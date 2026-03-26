"""Auth routes — register, login, me, verify."""

import logging
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import (
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)
from app.models.user import User
from app.schemas.user import Token, UserLogin, UserRead, UserRegister
from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def register(payload: UserRegister, db: AsyncSession = Depends(get_db)):
    """Create a new user account with verification token."""
    logger.info("Register attempt for email: %s", payload.email)

    result = await db.execute(select(User).where(User.email == payload.email))
    existing = result.scalar_one_or_none()

    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    verification_token = str(uuid.uuid4())
    user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
        verification_token=verification_token,
        is_verified=False,
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)

    # ── Simulation d'envoi d'email ─────────────────
    verification_url = f"{settings.FRONTEND_URL}/verify-email?token={verification_token}"
    logger.info(f"📧 EMAIL DE VÉRIFICATION ENVOYÉ À {user.email}")
    logger.info(f"🔗 LIEN : {verification_url}")
    # ──────────────────────────────────────────────

    return user


@router.get("/verify-email")
async def verify_email(token: str, db: AsyncSession = Depends(get_db)):
    """Verify a user's email using the token."""
    result = await db.execute(select(User).where(User.verification_token == token))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Jeton de vérification invalide",
        )

    user.is_verified = True
    user.verification_token = None
    await db.commit()

    return {"status": "ok", "message": "Email vérifié avec succès"}


@router.post("/login", response_model=Token)
async def login(payload: UserLogin, db: AsyncSession = Depends(get_db)):
    """Authenticate and return a JWT token (only if verified)."""
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect",
        )

    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Veuillez vérifier votre email avant de vous connecter",
        )

    token = create_access_token(data={"sub": str(user.id)})
    return Token(access_token=token)


@router.get("/me", response_model=UserRead)
async def me(current_user: User = Depends(get_current_user)):
    """Return the currently authenticated user."""
    return current_user
