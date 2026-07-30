"""Store meal timestamps with timezone awareness."""

from alembic import op
import sqlalchemy as sa

revision = "0002_meal_timestamps_timezone"
down_revision = "0001_initial"
branch_labels = None
depends_on = None


def upgrade():
  op.alter_column(
    "meals",
    "created_at",
    type_=sa.DateTime(timezone=True),
    existing_type=sa.DateTime(),
  )
  op.alter_column(
    "meals",
    "updated_at",
    type_=sa.DateTime(timezone=True),
    existing_type=sa.DateTime(),
  )


def downgrade():
  op.alter_column(
    "meals",
    "created_at",
    type_=sa.DateTime(),
    existing_type=sa.DateTime(timezone=True),
  )
  op.alter_column(
    "meals",
    "updated_at",
    type_=sa.DateTime(),
    existing_type=sa.DateTime(timezone=True),
  )
