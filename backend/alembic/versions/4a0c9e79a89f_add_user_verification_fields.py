"""add_user_verification_fields

Revision ID: 4a0c9e79a89f
Revises: 
Create Date: 2026-03-25 15:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4a0c9e79a89f'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Add columns as nullable first
    op.add_column('users', sa.Column('is_verified', sa.Boolean(), nullable=True))
    op.add_column('users', sa.Column('verification_token', sa.String(length=255), nullable=True))
    
    # 2. Update existing users to be verified (or not, depending on preference)
    # Let's assume existing users are verified to not lock them out, 
    # OR set them to False if you want to force verification.
    op.execute("UPDATE users SET is_verified = False")
    
    # 3. Set is_verified to NOT NULL
    op.alter_column('users', 'is_verified', nullable=False)


def downgrade() -> None:
    op.drop_column('users', 'verification_token')
    op.drop_column('users', 'is_verified')
