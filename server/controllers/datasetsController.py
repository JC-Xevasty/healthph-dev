from datetime import datetime
import os
from pathlib import Path
import pymongo
from typing_extensions import Annotated

from bson import ObjectId
from fastapi import Depends, HTTPException, UploadFile, status
from fastapi.responses import FileResponse, JSONResponse

from config.database import user_collection, dataset_collection
from models.user import AdminResult
from middleware.requireAdmin import require_admin
from schema.datasetSchema import individual_dataset, list_datasets

# Folder to store datasets
datasets_folder = Path("public/datasets")


"""
@desc     Upload a single dataset
route     POST api/datasets/upload
@access   Private
"""


async def upload_dataset(
    file: UploadFile, is_admin: Annotated[AdminResult, Depends(require_admin)]
):
    # Check if user is an admin or superadmin
    if not is_admin.result:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authorized to upload a dataset.",
        )

    dataset_data = {"user_id": is_admin.id}

    to_encode = dict(dataset_data).copy()

    # Check if id is valid object ID
    if not ObjectId.is_valid(to_encode["user_id"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to upload dataset",
        )

    user_data = user_collection.find_one({"_id": ObjectId(to_encode["user_id"])})

    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload dataset",
        )

    # Create uploads destination folder if it not exists
    os.makedirs(datasets_folder, exist_ok=True)

    filename = file.filename

    original_filename = filename

    filename = f"{(round(datetime.now().timestamp() * 1000))}-{filename}"

    file_size = file.size

    content_type = file.content_type

    # Check if file is a csv file
    if content_type != "text/csv":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type",
        )

    full_path = datasets_folder / filename

    contents = await file.read()

    with open(full_path, "wb") as f:
        f.write(contents)

    to_encode.update(
        {
            "user_name": f"{user_data['first_name']} {user_data['last_name']}",
            "filename": filename,
            "original_filename": original_filename,
            "file_size": file_size,
            "created_at": datetime.now(),
        }
    )

    new_dataset = dataset_collection.insert_one(dict(to_encode))

    if not new_dataset:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload dataset",
        )

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={"message": "Dataset uploaded successfully"},
    )


"""
@desc     Download a single dataset by filename
route     GET api/datasets/download/{filename}
@access   Private
"""


async def download_dataset(filename: str):
    full_path = datasets_folder / filename

    if not os.path.isfile(full_path):
        return {"message": f"File {filename} not found."}

    with open(full_path, "rb") as f:
        file_data = f.read()

    response = FileResponse(
        full_path, media_type="application/octet-stream", filename=filename
    )

    response.headers["Content-Disposition"] = f'attachment; filename="{filename}"'

    return response


"""
@desc     Fetch all datasets
route     GET api/datasets
@access   Private
"""


async def fetch_datasets():
    data = dataset_collection.aggregate(
        [
            {
                "$lookup": {
                    "from": "users",
                    "localField": "user_id",
                    "foreignField": "_id",
                    "as": "user_data",
                }
            },
            {"$sort": {"created_at": pymongo.DESCENDING}},
        ]
    )

    datasets = list_datasets(data)

    return datasets


"""
@desc     Delete a single dataset
route     DELETE api/datasets/{id}
@access   Private
"""


async def delete_dataset(id: str):
    # Check if there is id
    if not id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error deleting dataset...",
        )

    # Check if id is valid object ID
    if not ObjectId.is_valid(id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to delete dataset"
        )

    # Check if data exists in database
    dataset_data = dataset_collection.find_one({"_id": ObjectId(id)})

    if not (dataset_data):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found"
        )

    deleted_dataset = dataset_collection.find_one_and_delete({"_id": ObjectId(id)})

    # If deletion failed
    if not deleted_dataset:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to delete dataset.",
        )

    full_path = datasets_folder / dataset_data["filename"]

    if os.path.exists(full_path):
        os.remove(full_path)

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "message": "Dataset deleted successfully",
            "user": individual_dataset(deleted_dataset),
        },
    )
