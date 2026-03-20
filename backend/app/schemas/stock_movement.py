"""Pydantic schemas for StockMovement entity."""

from datetime import datetime

from pydantic import BaseModel

from app.models.stock_movement import MovementType


class StockMovementCreate(BaseModel):
    product_id: int
    quantity_changed: int
    type: MovementType
    reason: str = ""


class StockMovementRead(BaseModel):
    id: int
    product_id: int
    user_id: int | None
    quantity_changed: int
    type: MovementType
    reason: str | None
    timestamp: datetime

    model_config = {"from_attributes": True}
