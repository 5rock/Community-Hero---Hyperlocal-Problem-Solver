"""Add ward to issue

Revision ID: 2a8f5ddfbcee
Revises: b04525f71d6a
Create Date: 2026-08-20 22:38:51.637299

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2a8f5ddfbcee'
down_revision: Union[str, Sequence[str], None] = 'b04525f71d6a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('issues', sa.Column('ward', sa.String(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('issues', 'ward')
