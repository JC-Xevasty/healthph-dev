from fastapi import Depends, HTTPException, status, Response
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from typing_extensions import Annotated
from datetime import datetime, timedelta
import re
import os
from dotenv import dotenv_values

config_dotenv = dotenv_values()

from config.database import user_collection
from models.auth import (
    TokenData,
    OAuth2PasswordRequestFormJSON,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    VerifyResetPasswordToken,
)
from models.user import User, UserInDB
from schema.userSchema import individual_user
from helpers.authHelpers import (
    verify_password,
    generate_hashed_password,
    create_access_token,
    create_reset_password_token,
)
from helpers.sendMail import mail_forgot_password


"""
@desc     Auth user / set token
route     POST api/auth/authenticate
@access   Public
"""


async def authenticate_user(
    response: Response, credentials: Annotated[OAuth2PasswordRequestFormJSON, Depends()]
):
    # Check if user submitted an email and password
    if not credentials.email or not credentials.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Must provide both email address and password",
        )

    # Find user with {email} in database
    user_data = user_collection.find_one({"email": credentials.email})

    # Check if user with {email} exists
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = UserInDB(**user_data)

    if not verify_password(credentials.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(
        minutes=float(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))
    )

    access_token = create_access_token(
        data={"sub": str(user_data["_id"])}, expires_delta=access_token_expires
    )

    # secure = True / https
    response = JSONResponse(
        content={
            "access_token": access_token,
            "token_type": "bearer",
            "user": individual_user(user_data),
        }
    )
    response.set_cookie(
        key="accesstoken", value=access_token, httponly=False, samesite="none"
    )

    return response


"""
@desc     Create reset password link and send email to user
route     POST api/auth/forgot-password
@access   Public
"""


async def forgot_password(req: ForgotPasswordRequest):
    # Check if users with {email} exists in database
    user_data = user_collection.find_one({"email": req.email})

    # If not, raise error
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email address does not exists.",
        )

    # Create User variable
    user = User(**user_data)

    # Create unique reset password token using email
    reset_pwd_token = create_reset_password_token(email=user.email)

    # Create reset password link with token for client-side
    reset_pwd_link = (
        os.getenv("CLIENT_URL") + f"/reset-password/{reset_pwd_token}"
    )

    # Send reset password instructions thru email
    result = mail_forgot_password(
        user.email, {"first_name": user.first_name, "reset_pwd_link": reset_pwd_link}
    )

    if result:
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "message": "Reset password instructions sent to email successfully."
            },
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error sending reset password link. Please try again later.",
        )


"""
@desc     Verify reset password link
route     POST api/auth/verify-reset-password
@access   Public
"""


async def verify_reset_password(data: VerifyResetPasswordToken):
    credential_exception = HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Invalid reset password link or reset password link expired",
    )

    token = data.token

    try:
        payload = jwt.decode(
            token,
            os.getenv("FORGOT_PWD_SECRET_KEY"),
            algorithms=[os.getenv("ALGORITHM")],
        )

        email: str = payload.get("sub")

        if email is None:
            raise credential_exception
        
        return email

        token_data = TokenData(email=email)

        return token_data
    except JWTError:
        raise credential_exception


"""
@desc     Reset user password
route     POST api/auth/reset-password
@access   Public
"""


async def reset_password(req: ResetPasswordRequest):
    # Verify token if valid or not expired
    email = await verify_reset_password(
        VerifyResetPasswordToken(**{"token": req.token})
    )

    # If not, raise error
    if not email:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Invalid reset password link or reset password link expired",
        )

    # Check if request contains password and confirm password
    if not req.password or not req.re_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing fields (password and/or confirm password)",
        )

    # Check if new password and confirm password matches
    if req.password != req.re_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match",
        )

    # Hash new password
    new_pwd = generate_hashed_password(req.password)

    # Check if user with {email} exists in database
    user_data = user_collection.find_one({"email": email})

    # If not, raise error
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Invalid reset password link or reset password link expired",
        )

    # Create User variable
    user = User(**user_data)

    # Find user in database and update password with new hashed password
    user_collection.find_one_and_update(
        {"email": user.email},
        {"$set": {"password": new_pwd, "updated_at": datetime.now()}},
    )

    return JSONResponse(
        status_code=status.HTTP_200_OK, content={"message": "Password reset successful"}
    )
