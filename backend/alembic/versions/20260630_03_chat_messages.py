"""Add chat messages table.

Revision ID: 20260630_03
Revises: 20260629_02
Create Date: 2026-06-30
"""

from alembic import op
import sqlalchemy as sa

revision = "20260630_03"
down_revision = "20260629_02"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "chat_messages",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "user_id",
            sa.Integer(),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("role", sa.String(length=50), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
    )
    op.create_index(
        "ix_chat_messages_id",
        "chat_messages",
        ["id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        "ix_chat_messages_id",
        table_name="chat_messages",
    )
    op.drop_table("chat_messages")
