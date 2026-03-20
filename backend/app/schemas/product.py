"""Pydantic schemas for Product entity."""

from pydantic import BaseModel


class ProductCreate(BaseModel):
    name: str
    sku: str
    description: str = ""
    image_url: str = ""
    current_stock: int = 0
    safety_stock: int = 0
    purchase_price: float = 0.0
    selling_price: float = 0.0


class ProductUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    image_url: str | None = None
    current_stock: int | None = None
    safety_stock: int | None = None
    purchase_price: float | None = None
    selling_price: float | None = None


class ProductRead(BaseModel):
    id: int
    owner_id: int
    name: str
    sku: str
    description: str | None
    image_url: str | None
    current_stock: int
    safety_stock: int
    purchase_price: float
    selling_price: float

    model_config = {"from_attributes": True}
