"""Stripe webhook route — handles checkout.session.completed to upgrade users to premium."""

import logging

import stripe
from fastapi import APIRouter, HTTPException, Header, Request, status
from sqlalchemy import select

from app.core.config import settings
from app.core.database import async_session
from app.models.user import User

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/webhooks", tags=["Stripe"])

stripe.api_key = settings.STRIPE_SECRET_KEY


@router.post("/stripe", status_code=status.HTTP_200_OK)
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None),
):
    """
    Stripe webhook endpoint.

    Listens for `checkout.session.completed` events to flip
    `is_premium = True` on the corresponding user.
    """
    payload = await request.body()

    # ── Verify signature ──────────────────────────
    try:
        event = stripe.Webhook.construct_event(
            payload,
            stripe_signature,
            settings.STRIPE_WEBHOOK_SECRET,
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    # ── Handle the event ──────────────────────────
    if event["type"] == "checkout.session.completed":
        session_data = event["data"]["object"]
        customer_email = session_data.get("customer_email") or session_data.get(
            "customer_details", {}
        ).get("email")

        if customer_email:
            async with async_session() as db:
                result = await db.execute(
                    select(User).where(User.email == customer_email)
                )
                user = result.scalar_one_or_none()
                if user:
                    user.is_premium = True
                    await db.commit()
                    logger.info("Upgraded user %s to premium", customer_email)
                else:
                    logger.warning("Stripe checkout for unknown email: %s", customer_email)
        else:
            logger.warning("Stripe checkout event missing customer email")

    return {"status": "ok"}
