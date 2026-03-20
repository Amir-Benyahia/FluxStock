"""
FluxStock — Seed script.

Creates a test user and sample products with stock movement history
so the dashboard and AI predictions are populated on first launch.
"""

import logging
import random
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import async_session
from app.core.security import hash_password
from app.models.product import Product
from app.models.stock_movement import MovementType, StockMovement
from app.models.user import User

logger = logging.getLogger(__name__)

TEST_EMAIL = "test@example.com"
TEST_PASSWORD = "testpassword123"

SAMPLE_PRODUCTS = [
    {
        "name": "iPhone 15 Pro Max",
        "sku": "APL-IP15PM-256",
        "description": "Apple iPhone 15 Pro Max 256Go — Titane Naturel",
        "current_stock": 12,
        "safety_stock": 5,
        "purchase_price": 1199.00,
        "selling_price": 1479.00,
    },
    {
        "name": "Samsung Galaxy S24 Ultra",
        "sku": "SAM-GS24U-256",
        "description": "Samsung Galaxy S24 Ultra 256Go — Titanium Gray",
        "current_stock": 8,
        "safety_stock": 4,
        "purchase_price": 1099.00,
        "selling_price": 1369.00,
    },
    {
        "name": "Sony WH-1000XM5",
        "sku": "SNY-WH1KXM5-BK",
        "description": "Casque sans fil à réduction de bruit — Noir",
        "current_stock": 3,
        "safety_stock": 10,
        "purchase_price": 299.00,
        "selling_price": 399.00,
    },
    {
        "name": "MacBook Air M3",
        "sku": "APL-MBA-M3-16",
        "description": "Apple MacBook Air 15\" M3 16Go/512Go — Minuit",
        "current_stock": 5,
        "safety_stock": 3,
        "purchase_price": 1499.00,
        "selling_price": 1799.00,
    },
]


def _generate_movements(product_id: int, user_id: int) -> list[StockMovement]:
    """Generate 90 days of realistic stock movements."""
    movements: list[StockMovement] = []
    now = datetime.now(timezone.utc)

    for day_offset in range(90, 0, -1):
        ts = now - timedelta(days=day_offset, hours=random.randint(0, 12))

        # OUT movements (1–3 per day, quantity 1–4)
        out_count = random.randint(0, 3)
        for _ in range(out_count):
            movements.append(
                StockMovement(
                    product_id=product_id,
                    user_id=user_id,
                    quantity_changed=-random.randint(1, 4),
                    type=MovementType.OUT,
                    reason="Vente client",
                    timestamp=ts + timedelta(minutes=random.randint(0, 300)),
                )
            )

        # IN movements (restock every ~15 days)
        if day_offset % 15 == 0:
            movements.append(
                StockMovement(
                    product_id=product_id,
                    user_id=user_id,
                    quantity_changed=random.randint(15, 40),
                    type=MovementType.IN,
                    reason="Réapprovisionnement fournisseur",
                    timestamp=ts + timedelta(hours=8),
                )
            )

    return movements


async def run_seed():
    """Create test user + sample data if not already present."""
    async with async_session() as db:
        db: AsyncSession

        # ── Check if test user exists ──────────────
        result = await db.execute(select(User).where(User.email == TEST_EMAIL))
        user = result.scalar_one_or_none()

        if user:
            logger.info("Seed: test user '%s' already exists — skipping.", TEST_EMAIL)
            return

        # ── Create test user ───────────────────────
        user = User(
            email=TEST_EMAIL,
            hashed_password=hash_password(TEST_PASSWORD),
            full_name="Utilisateur Test",
            role="admin",
            is_premium=True,
        )
        db.add(user)
        await db.flush()
        logger.info("Seed: created test user '%s' (id=%d)", TEST_EMAIL, user.id)

        # ── Create sample products ─────────────────
        for product_data in SAMPLE_PRODUCTS:
            product = Product(owner_id=user.id, **product_data)
            db.add(product)
            await db.flush()
            logger.info("Seed: created product '%s' (id=%d)", product.name, product.id)

            # ── Generate stock movement history ────
            movements = _generate_movements(product.id, user.id)
            db.add_all(movements)
            logger.info("Seed:   → %d movements generated", len(movements))

        await db.commit()
        logger.info("Seed: ✅ Done. Login with %s / %s", TEST_EMAIL, TEST_PASSWORD)
