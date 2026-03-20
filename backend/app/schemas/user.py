"""Pydantic schemas for User entity."""

from pydantic import BaseModel, EmailStr


# ── Request ────────────────────────────────────
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


# ── Response ───────────────────────────────────
class UserRead(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    is_premium: bool

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
