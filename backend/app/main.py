"""
FluxStock — FastAPI application factory.

Swagger UI available at /docs when running.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(name)s — %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown hooks."""
    from app.core.database import create_tables, engine
    from app.core.seed import run_seed

    # On startup — ensure tables exist and seed test data
    logger.info("🚀 Starting %s...", settings.APP_NAME)
    await create_tables()
    await run_seed()
    logger.info("✅ %s ready.", settings.APP_NAME)

    yield

    # On shutdown — dispose the async engine
    await engine.dispose()
    logger.info("👋 %s shut down.", settings.APP_NAME)


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        description="Intelligent Inventory Management Micro-SaaS — AI-powered reorder predictions, barcode scanning & Stripe billing.",
        version="1.0.0",
        lifespan=lifespan,
    )

    # ── CORS (allow the React dev server) ──────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000", "http://localhost:5173"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Register routers ───────────────────────────
    from app.api.routes.auth import router as auth_router
    from app.api.routes.forecast import router as forecast_router
    from app.api.routes.products import router as products_router
    from app.api.routes.stock import router as stock_router
    from app.api.routes.stripe import router as stripe_router

    app.include_router(auth_router)
    app.include_router(products_router)
    app.include_router(stock_router)
    app.include_router(forecast_router)
    app.include_router(stripe_router)

    @app.get("/", tags=["Health"])
    async def health():
        return {"status": "ok", "app": settings.APP_NAME}

    return app


app = create_app()
