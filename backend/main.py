from fastapi import FastAPI, Depends, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import List
import os
import uuid
import shutil

from qc_scan.backend.database import Base, engine, get_db
from qc_scan.backend.models import Wish
from qc_scan.backend.schemas import WishResponse

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="QR Wish Backend",
    description="Backend for uploading wishes and showing them in slideshow",
    version="1.0.0"
)

BACKEND_URL = os.getenv("BACKEND_URL", "http://127.0.0.1:8000")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        FRONTEND_URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "QR Wish Backend Running",
        "docs": f"{BACKEND_URL}/docs"
    }


@app.post("/wishes", response_model=WishResponse)
def create_wish(
    name: str = Form(...),
    wish_text: str = Form(...),
    image: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    allowed_extensions = ["jpg", "jpeg", "png", "webp"]

    file_extension = image.filename.split(".")[-1].lower()

    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Only jpg, jpeg, png and webp images are allowed"
        )

    file_name = f"{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, file_name)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    image_url = f"{BACKEND_URL}/uploads/{file_name}"

    new_wish = Wish(
        name=name,
        wish_text=wish_text,
        image_url=image_url
    )

    db.add(new_wish)
    db.commit()
    db.refresh(new_wish)

    return new_wish


@app.get("/wishes", response_model=List[WishResponse])
def get_all_wishes(db: Session = Depends(get_db)):
    wishes = db.query(Wish).order_by(Wish.id.desc()).all()
    return wishes


@app.get("/wishes/{wish_id}", response_model=WishResponse)
def get_single_wish(
    wish_id: int,
    db: Session = Depends(get_db)
):
    wish = db.query(Wish).filter(Wish.id == wish_id).first()

    if not wish:
        raise HTTPException(
            status_code=404,
            detail="Wish not found"
        )

    return wish


@app.put("/wishes/{wish_id}", response_model=WishResponse)
def update_wish(
    wish_id: int,
    name: str = Form(...),
    wish_text: str = Form(...),
    image: UploadFile | None = File(None),
    db: Session = Depends(get_db)
):
    wish = db.query(Wish).filter(Wish.id == wish_id).first()

    if not wish:
        raise HTTPException(status_code=404, detail="Wish not found")

    wish.name = name
    wish.wish_text = wish_text

    if image:
        allowed_extensions = ["jpg", "jpeg", "png", "webp"]
        file_extension = image.filename.split(".")[-1].lower()

        if file_extension not in allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail="Only jpg, jpeg, png and webp images are allowed"
            )

        old_image_path = wish.image_url.replace(f"{BACKEND_URL}/", "")

        if os.path.exists(old_image_path):
            os.remove(old_image_path)

        file_name = f"{uuid.uuid4()}.{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, file_name)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

        wish.image_url = f"{BACKEND_URL}/uploads/{file_name}"

    db.commit()
    db.refresh(wish)

    return wish

@app.delete("/wishes/{wish_id}")
def delete_wish(
    wish_id: int,
    db: Session = Depends(get_db)
):
    wish = db.query(Wish).filter(Wish.id == wish_id).first()

    if not wish:
        raise HTTPException(
            status_code=404,
            detail="Wish not found"
        )

    image_path = wish.image_url.replace(f"{BACKEND_URL}/", "")

    if os.path.exists(image_path):
        os.remove(image_path)

    db.delete(wish)
    db.commit()

    return {
        "message": "Wish deleted successfully"
    }