"""
FluxStock — Core configuration via Pydantic Settings.
Loads values from .env file or environment variables.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # ── Database ────────────────────────────────
    DATABASE_URL: str = "postgresql+asyncpg://fluxstock:changeme@db:5432/fluxstock"

    # ── JWT ─────────────────────────────────────
    SECRET_KEY: str = "change-me-to-a-random-64-char-string"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # ── Stripe ──────────────────────────────────
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    STRIPE_PRICE_ID: str = ""

    # ── App ─────────────────────────────────────
    APP_NAME: str = "FluxStock"
    DEBUG: bool = False
    FRONTEND_URL: str = "http://localhost:3000"

    # ── Email (SMTP) ────────────────────────────
    SMTP_HOST: str = "smtp.mailtrap.io"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAILS_FROM_EMAIL: str = "info@fluxstock.com"
    EMAILS_FROM_NAME: str = "FluxStock"


settings = Settings()
