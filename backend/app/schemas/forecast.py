"""Pydantic schemas for Forecast / Reorder endpoint."""

from pydantic import BaseModel


class ReorderRequest(BaseModel):
    lead_time_days: int = 7
    max_lead_time_days: int | None = None  # defaults to lead_time_days * 1.5


class ReorderResponse(BaseModel):
    product_id: int
    product_name: str
    current_stock: int
    avg_daily_demand: float
    max_daily_demand: float
    safety_stock: float
    reorder_point: float
    reorder_needed: bool
    lead_time_days: int
