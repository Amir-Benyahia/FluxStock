"""Forecast / Reorder Point route — AI-powered inventory intelligence."""

import sys
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.product import Product
from app.models.stock_movement import MovementType, StockMovement
from app.models.user import User
from app.schemas.forecast import ReorderResponse

# Make the data-science module importable (mounted via docker volume)
sys.path.insert(0, str(Path(__file__).resolve().parents[3] / "data_science_module"))
from forecasting import calculate_reorder_point  # noqa: E402

router = APIRouter(prefix="/products", tags=["Forecasting"])


@router.get("/{product_id}/reorder", response_model=ReorderResponse)
async def get_reorder_point(
    product_id: int,
    lead_time_days: int = Query(default=7, ge=1, description="Supplier lead time in days"),
    max_lead_time_days: int | None = Query(default=None, ge=1, description="Maximum lead time (defaults to lead_time × 1.5)"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Calculate the reorder point for a product using historical demand.

    This is a *computation* endpoint, not CRUD.
    It analyses the last 90 days of OUT movements and returns:
    - average & max daily demand
    - safety stock (SS)
    - reorder point (RP)
    - whether a reorder is needed now
    """
    # Verify ownership
    result = await db.execute(
        select(Product).where(Product.id == product_id, Product.owner_id == current_user.id)
    )
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    # Fetch OUT movements for last 90 days
    from datetime import datetime, timedelta, timezone

    cutoff = datetime.now(timezone.utc) - timedelta(days=90)
    movements_result = await db.execute(
        select(StockMovement)
        .where(
            StockMovement.product_id == product_id,
            StockMovement.type == MovementType.OUT,
            StockMovement.timestamp >= cutoff,
        )
        .order_by(StockMovement.timestamp)
    )
    movements = movements_result.scalars().all()

    # Build data for the forecasting module
    movement_data = [
        {"timestamp": m.timestamp, "quantity": abs(m.quantity_changed)}
        for m in movements
    ]

    max_lt = max_lead_time_days or int(lead_time_days * 1.5)

    forecast = calculate_reorder_point(
        movements=movement_data,
        lead_time_days=lead_time_days,
        max_lead_time_days=max_lt,
    )

    return ReorderResponse(
        product_id=product.id,
        product_name=product.name,
        current_stock=product.current_stock,
        avg_daily_demand=forecast["avg_daily_demand"],
        max_daily_demand=forecast["max_daily_demand"],
        safety_stock=forecast["safety_stock"],
        reorder_point=forecast["reorder_point"],
        reorder_needed=product.current_stock < forecast["reorder_point"],
        lead_time_days=lead_time_days,
    )
