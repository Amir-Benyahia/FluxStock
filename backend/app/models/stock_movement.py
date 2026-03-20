"""StockMovement model — audit journal for every stock change."""

import enum
from datetime import datetime, timezone

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class MovementType(str, enum.Enum):
    IN = "IN"
    OUT = "OUT"
    LOSS = "LOSS"
    RETURN = "RETURN"


class StockMovement(Base):
    __tablename__ = "stock_movements"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    quantity_changed: Mapped[int] = mapped_column(Integer, nullable=False)
    type: Mapped[MovementType] = mapped_column(Enum(MovementType), nullable=False)
    reason: Mapped[str | None] = mapped_column(String(500), default="")
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    product = relationship("Product", back_populates="movements")
    user = relationship("User", back_populates="stock_movements")
