"""Product model — inventory item with pricing & safety stock."""

from sqlalchemy import ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    sku: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, default="")
    image_url: Mapped[str | None] = mapped_column(String(500), default="")
    current_stock: Mapped[int] = mapped_column(Integer, default=0)
    safety_stock: Mapped[int] = mapped_column(Integer, default=0)
    purchase_price: Mapped[float] = mapped_column(Numeric(10, 2), default=0.0)
    selling_price: Mapped[float] = mapped_column(Numeric(10, 2), default=0.0)

    # Relationships
    owner = relationship("User", back_populates="products")
    movements = relationship("StockMovement", back_populates="product", lazy="selectin")
    forecasts = relationship("Forecast", back_populates="product", lazy="selectin")
