"""Stock movement routes — record IN/OUT/LOSS/RETURN with transactional stock update."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.product import Product
from app.models.stock_movement import StockMovement
from app.models.user import User
from app.schemas.stock_movement import StockMovementCreate, StockMovementRead

router = APIRouter(prefix="/stock", tags=["Stock Movements"])


@router.post("/movements", response_model=StockMovementRead, status_code=status.HTTP_201_CREATED)
async def create_movement(
    payload: StockMovementCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Record a stock movement and atomically update `current_stock`.

    Uses the session transaction to ensure consistency:
    - If the UPDATE or INSERT fails, both are rolled back.
    - quantity_changed is positive for IN/RETURN, negative for OUT/LOSS.
    """
    result = await db.execute(
        select(Product)
        .where(Product.id == payload.product_id, Product.owner_id == current_user.id)
        .with_for_update()  # row-level lock for concurrency safety
    )
    product = result.scalar_one_or_none()

    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    # Apply the stock change
    new_stock = product.current_stock + payload.quantity_changed
    if new_stock < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient stock. Current: {product.current_stock}, attempted change: {payload.quantity_changed}",
        )

    product.current_stock = new_stock

    movement = StockMovement(
        product_id=payload.product_id,
        user_id=current_user.id,
        quantity_changed=payload.quantity_changed,
        type=payload.type,
        reason=payload.reason,
    )
    db.add(movement)
    await db.flush()
    await db.refresh(movement)
    return movement


@router.get("/movements/{product_id}", response_model=list[StockMovementRead])
async def list_movements(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all movements for a product (audit trail)."""
    # Verify ownership
    prod = await db.execute(
        select(Product).where(Product.id == product_id, Product.owner_id == current_user.id)
    )
    if not prod.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    result = await db.execute(
        select(StockMovement)
        .where(StockMovement.product_id == product_id)
        .order_by(StockMovement.timestamp.desc())
    )
    return result.scalars().all()
