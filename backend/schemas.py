from pydantic import BaseModel
from datetime import datetime


class WishResponse(BaseModel):
    id: int
    name: str
    wish_text: str
    image_url: str
    created_at: datetime

    class Config:
        from_attributes = True