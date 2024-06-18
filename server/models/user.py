from gc import disable
from pydantic import BaseModel
from datetime import datetime


class User(BaseModel):
    region: str
    organization: str
    first_name: str
    last_name: str
    email: str
    is_disabled: bool | None = False
    user_type: str | None = "USER"
    created_at: datetime = datetime.now()
    updated_at: datetime = datetime.now()


class UserInDB(User):
    password: str


class CreateUserRequest(BaseModel):
    region: str
    accessible_regions: str
    organization: str
    first_name: str
    last_name: str
    email: str
    password: str
    is_disabled: bool | None = False
    user_type: str
    created_at: datetime = datetime.now()
    updated_at: datetime = datetime.now()


class UpdatePersonalInfo(BaseModel):
    id: str
    first_name: str
    last_name: str
    region: str
    organization: str


class UpdateEmailRequest(BaseModel):
    id: str
    email: str
    password: str


class UpdatePasswordRequest(BaseModel):
    id: str
    current_password: str
    password: str
    re_password: str


class DisableUserRequest(BaseModel):
    disable_status: bool


class AdminResult(BaseModel):
    result: bool
    id: str


class SuperadminResult(BaseModel):
    result: bool
    id: str
