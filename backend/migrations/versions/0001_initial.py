"""Initial NutriVisionAI schema."""

from alembic import op
import sqlalchemy as sa

revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
  op.create_table(
    "users",
    sa.Column("id", sa.Integer(), primary_key=True),
    sa.Column("username", sa.String(length=80), nullable=False),
    sa.Column("email", sa.String(length=120), nullable=False),
    sa.Column("password_hash", sa.String(length=255), nullable=False),
    sa.Column("created_at", sa.DateTime(), nullable=False),
    sa.UniqueConstraint("username"),
    sa.UniqueConstraint("email"),
  )
  op.create_index(op.f("ix_users_email"), "users", ["email"], unique=False)
  op.create_index(op.f("ix_users_username"), "users", ["username"], unique=False)

  op.create_table(
    "profiles",
    sa.Column("id", sa.Integer(), primary_key=True),
    sa.Column("user_id", sa.Integer(), nullable=False),
    sa.Column("profile_image", sa.Text(), nullable=False),
    sa.Column("full_name", sa.String(length=120), nullable=False),
    sa.Column("email", sa.String(length=120), nullable=False),
    sa.Column("phone", sa.String(length=32), nullable=False),
    sa.Column("age", sa.Integer(), nullable=False),
    sa.Column("gender", sa.String(length=40), nullable=False),
    sa.Column("height", sa.Float(), nullable=False),
    sa.Column("weight", sa.Float(), nullable=False),
    sa.Column("activity_level", sa.String(length=40), nullable=False),
    sa.Column("daily_goal", sa.String(length=80), nullable=False),
    sa.Column("created_at", sa.DateTime(), nullable=False),
    sa.Column("updated_at", sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
    sa.UniqueConstraint("user_id"),
  )

  op.create_table(
    "settings",
    sa.Column("id", sa.Integer(), primary_key=True),
    sa.Column("user_id", sa.Integer(), nullable=False),
    sa.Column("theme", sa.String(length=20), nullable=False),
    sa.Column("notifications_enabled", sa.Boolean(), nullable=False),
    sa.Column("reminders_enabled", sa.Boolean(), nullable=False),
    sa.Column("preferred_units", sa.String(length=20), nullable=False),
    sa.Column("created_at", sa.DateTime(), nullable=False),
    sa.Column("updated_at", sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
    sa.UniqueConstraint("user_id"),
  )

  op.create_table(
    "goals",
    sa.Column("id", sa.Integer(), primary_key=True),
    sa.Column("user_id", sa.Integer(), nullable=False),
    sa.Column("calorie_goal", sa.Float(), nullable=False),
    sa.Column("protein_goal", sa.Float(), nullable=False),
    sa.Column("carbohydrate_goal", sa.Float(), nullable=False),
    sa.Column("fat_goal", sa.Float(), nullable=False),
    sa.Column("weight_loss_kg", sa.Float(), nullable=False),
    sa.Column("timeframe_days", sa.Integer(), nullable=False),
    sa.Column("created_at", sa.DateTime(), nullable=False),
    sa.Column("updated_at", sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
    sa.UniqueConstraint("user_id"),
  )

  op.create_table(
    "meals",
    sa.Column("id", sa.Integer(), primary_key=True),
    sa.Column("user_id", sa.Integer(), nullable=False),
    sa.Column("food_name", sa.String(length=120), nullable=False),
    sa.Column("image_path", sa.Text(), nullable=False),
    sa.Column("calories", sa.Float(), nullable=False),
    sa.Column("protein", sa.Float(), nullable=False),
    sa.Column("carbohydrates", sa.Float(), nullable=False),
    sa.Column("fats", sa.Float(), nullable=False),
    sa.Column("fiber", sa.Float(), nullable=False),
    sa.Column("sugar", sa.Float(), nullable=False),
    sa.Column("quantity", sa.Float(), nullable=False),
    sa.Column("serving_size", sa.Float(), nullable=False),
    sa.Column("prediction_confidence", sa.Float(), nullable=False),
    sa.Column("meal_type", sa.String(length=40), nullable=False),
    sa.Column("original_nutrition", sa.JSON(), nullable=True),
    sa.Column("sodium", sa.Float(), nullable=False),
    sa.Column("cholesterol", sa.Float(), nullable=False),
    sa.Column("potassium", sa.Float(), nullable=False),
    sa.Column("calcium", sa.Float(), nullable=False),
    sa.Column("iron", sa.Float(), nullable=False),
    sa.Column("vitamin_c", sa.Float(), nullable=False),
    sa.Column("created_at", sa.DateTime(), nullable=False),
    sa.Column("updated_at", sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
  )
  op.create_index(op.f("ix_meals_created_at"), "meals", ["created_at"], unique=False)
  op.create_index(op.f("ix_meals_food_name"), "meals", ["food_name"], unique=False)
  op.create_index(op.f("ix_meals_user_id"), "meals", ["user_id"], unique=False)

  op.create_table(
    "hydration_logs",
    sa.Column("id", sa.Integer(), primary_key=True),
    sa.Column("user_id", sa.Integer(), nullable=False),
    sa.Column("log_date", sa.Date(), nullable=False),
    sa.Column("amount_liters", sa.Float(), nullable=False),
    sa.Column("created_at", sa.DateTime(), nullable=False),
    sa.Column("updated_at", sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
  )
  op.create_index(op.f("ix_hydration_logs_log_date"), "hydration_logs", ["log_date"], unique=False)
  op.create_index(op.f("ix_hydration_logs_user_id"), "hydration_logs", ["user_id"], unique=False)


def downgrade():
  op.drop_index(op.f("ix_hydration_logs_user_id"), table_name="hydration_logs")
  op.drop_index(op.f("ix_hydration_logs_log_date"), table_name="hydration_logs")
  op.drop_table("hydration_logs")
  op.drop_index(op.f("ix_meals_user_id"), table_name="meals")
  op.drop_index(op.f("ix_meals_food_name"), table_name="meals")
  op.drop_index(op.f("ix_meals_created_at"), table_name="meals")
  op.drop_table("meals")
  op.drop_table("goals")
  op.drop_table("settings")
  op.drop_table("profiles")
  op.drop_index(op.f("ix_users_username"), table_name="users")
  op.drop_index(op.f("ix_users_email"), table_name="users")
  op.drop_table("users")

