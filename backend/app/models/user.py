"""User model — authentication & premium status."""

from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    role: Mapped[str] = mapped_column(String(20), default="user")  # admin | user
    is_premium: Mapped[bool] = mapped_column(Boolean, default=False)

    # Relationships
    products = relationship("Product", back_populates="owner", lazy="selectin")
    stock_movements = relationship("StockMovement", back_populates="user", lazy="selectin")
