from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime, timezone
from qc_scan.backend.database import Base


class Wish(Base):
    __tablename__ = "wishes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    wish_text = Column(String, nullable=False)
    image_url = Column(String, nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )