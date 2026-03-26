"""Pydantic schemas for User entity."""

import re
from pydantic import BaseModel, EmailStr, field_validator


# ── Request ────────────────────────────────────
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        """
        Validate password strength:
        - At least 8 characters
        - At least one uppercase letter
        - At least one lowercase letter
        - At least one digit
        - At least one special character
        """
        if len(v) < 8:
            raise ValueError("Le mot de passe doit contenir au moins 8 caractères")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Le mot de passe doit contenir au moins une majuscule")
        if not re.search(r"[a-z]", v):
            raise ValueError("Le mot de passe doit contenir au moins une minuscule")
        if not re.search(r"\d", v):
            raise ValueError("Le mot de passe doit contenir au moins un chiffre")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Le mot de passe doit contenir au moins un caractère spécial")
        return v


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
    is_verified: bool

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
