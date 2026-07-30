from datetime import datetime

from sqlalchemy import JSON
from sqlalchemy.orm import relationship

from database import db


def utc_now():
  return datetime.utcnow()


class User(db.Model):
  __tablename__ = "users"

  id = db.Column(db.Integer, primary_key=True)
  username = db.Column(db.String(80), unique=True, nullable=False, index=True)
  email = db.Column(db.String(120), unique=True, nullable=False, index=True)
  password_hash = db.Column(db.String(255), nullable=False)
  created_at = db.Column(db.DateTime, default=utc_now, nullable=False)

  profile = relationship("Profile", uselist=False, back_populates="user", cascade="all, delete-orphan")
  settings = relationship("Settings", uselist=False, back_populates="user", cascade="all, delete-orphan")
  goals = relationship("Goal", uselist=False, back_populates="user", cascade="all, delete-orphan")
  meals = relationship("Meal", back_populates="user", cascade="all, delete-orphan")
  hydration_logs = relationship("HydrationLog", back_populates="user", cascade="all, delete-orphan")

  def to_dict(self):
    return {
      "id": self.id,
      "username": self.username,
      "email": self.email,
      "createdAt": self.created_at.isoformat() if self.created_at else None,
    }


class Profile(db.Model):
  __tablename__ = "profiles"

  id = db.Column(db.Integer, primary_key=True)
  user_id = db.Column(db.Integer, db.ForeignKey("users.id"), unique=True, nullable=False)
  profile_image = db.Column(db.Text, default="", nullable=False)
  full_name = db.Column(db.String(120), default="", nullable=False)
  email = db.Column(db.String(120), default="", nullable=False)
  phone = db.Column(db.String(32), default="", nullable=False)
  age = db.Column(db.Integer, default=0, nullable=False)
  gender = db.Column(db.String(40), default="Prefer not to say", nullable=False)
  height = db.Column(db.Float, default=0, nullable=False)
  weight = db.Column(db.Float, default=0, nullable=False)
  activity_level = db.Column(db.String(40), default="Moderate", nullable=False)
  daily_goal = db.Column(db.String(80), default="Lose Weight", nullable=False)
  created_at = db.Column(db.DateTime, default=utc_now, nullable=False)
  updated_at = db.Column(db.DateTime, default=utc_now, onupdate=utc_now, nullable=False)

  user = relationship("User", back_populates="profile")

  def to_dict(self):
    return {
      "id": self.id,
      "userId": self.user_id,
      "profileImage": self.profile_image or "",
      "fullName": self.full_name or "",
      "email": self.email or "",
      "phone": self.phone or "",
      "age": self.age or "",
      "gender": self.gender or "Prefer not to say",
      "height": self.height or "",
      "weight": self.weight or "",
      "activityLevel": self.activity_level or "Moderate",
      "dailyGoal": self.daily_goal or "Lose Weight",
      "createdAt": self.created_at.isoformat() if self.created_at else None,
      "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
    }


class Settings(db.Model):
  __tablename__ = "settings"

  id = db.Column(db.Integer, primary_key=True)
  user_id = db.Column(db.Integer, db.ForeignKey("users.id"), unique=True, nullable=False)
  theme = db.Column(db.String(20), default="light", nullable=False)
  notifications_enabled = db.Column(db.Boolean, default=True, nullable=False)
  reminders_enabled = db.Column(db.Boolean, default=True, nullable=False)
  preferred_units = db.Column(db.String(20), default="metric", nullable=False)
  created_at = db.Column(db.DateTime, default=utc_now, nullable=False)
  updated_at = db.Column(db.DateTime, default=utc_now, onupdate=utc_now, nullable=False)

  user = relationship("User", back_populates="settings")

  def to_dict(self):
    return {
      "id": self.id,
      "userId": self.user_id,
      "theme": self.theme or "light",
      "notifications": bool(self.notifications_enabled),
      "reminders": bool(self.reminders_enabled),
      "units": self.preferred_units or "metric",
      "createdAt": self.created_at.isoformat() if self.created_at else None,
      "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
    }


class Goal(db.Model):
  __tablename__ = "goals"

  id = db.Column(db.Integer, primary_key=True)
  user_id = db.Column(db.Integer, db.ForeignKey("users.id"), unique=True, nullable=False)
  calorie_goal = db.Column(db.Float, default=0, nullable=False)
  protein_goal = db.Column(db.Float, default=0, nullable=False)
  carbohydrate_goal = db.Column(db.Float, default=0, nullable=False)
  fat_goal = db.Column(db.Float, default=0, nullable=False)
  weight_loss_kg = db.Column(db.Float, default=3, nullable=False)
  timeframe_days = db.Column(db.Integer, default=30, nullable=False)
  created_at = db.Column(db.DateTime, default=utc_now, nullable=False)
  updated_at = db.Column(db.DateTime, default=utc_now, onupdate=utc_now, nullable=False)

  user = relationship("User", back_populates="goals")

  def to_dict(self):
    return {
      "id": self.id,
      "userId": self.user_id,
      "calorieGoal": self.calorie_goal or 0,
      "proteinGoal": self.protein_goal or 0,
      "carbohydrateGoal": self.carbohydrate_goal or 0,
      "fatGoal": self.fat_goal or 0,
      "weightLossKg": self.weight_loss_kg or 3,
      "timeframeDays": self.timeframe_days or 30,
      "createdAt": self.created_at.isoformat() if self.created_at else None,
      "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
    }


class Meal(db.Model):
  __tablename__ = "meals"

  id = db.Column(db.Integer, primary_key=True)
  user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
  food_name = db.Column(db.String(120), nullable=False, index=True)
  image_path = db.Column(db.Text, default="", nullable=False)
  calories = db.Column(db.Float, default=0, nullable=False)
  protein = db.Column(db.Float, default=0, nullable=False)
  carbohydrates = db.Column(db.Float, default=0, nullable=False)
  fats = db.Column(db.Float, default=0, nullable=False)
  fiber = db.Column(db.Float, default=0, nullable=False)
  sugar = db.Column(db.Float, default=0, nullable=False)
  quantity = db.Column(db.Float, default=100, nullable=False)
  serving_size = db.Column(db.Float, default=100, nullable=False)
  prediction_confidence = db.Column(db.Float, default=0, nullable=False)
  meal_type = db.Column(db.String(40), default="Breakfast", nullable=False)
  original_nutrition = db.Column(JSON, nullable=True)
  sodium = db.Column(db.Float, default=0, nullable=False)
  cholesterol = db.Column(db.Float, default=0, nullable=False)
  potassium = db.Column(db.Float, default=0, nullable=False)
  calcium = db.Column(db.Float, default=0, nullable=False)
  iron = db.Column(db.Float, default=0, nullable=False)
  vitamin_c = db.Column(db.Float, default=0, nullable=False)
  created_at = db.Column(db.DateTime, default=utc_now, nullable=False, index=True)
  updated_at = db.Column(db.DateTime, default=utc_now, onupdate=utc_now, nullable=False)

  user = relationship("User", back_populates="meals")

  def to_dict(self):
    nutrition = self.original_nutrition or {}
    return {
      "id": self.id,
      "userId": self.user_id,
      "food": self.food_name,
      "foodLabel": self.food_name.replace("_", " ").title(),
      "image": self.image_path or "",
      "imagePath": self.image_path or "",
      "calories": self.calories or 0,
      "protein": self.protein or 0,
      "carbs": self.carbohydrates or 0,
      "carbohydrates": self.carbohydrates or 0,
      "fat": self.fats or 0,
      "fats": self.fats or 0,
      "fiber": self.fiber or 0,
      "sugar": self.sugar or 0,
      "quantity": self.quantity or 100,
      "servingSize": self.serving_size or 100,
      "confidence": self.prediction_confidence or 0,
      "predictionConfidence": self.prediction_confidence or 0,
      "mealType": self.meal_type or "Breakfast",
      "nutrition": nutrition,
      "sodium": self.sodium or 0,
      "cholesterol": self.cholesterol or 0,
      "potassium": self.potassium or 0,
      "calcium": self.calcium or 0,
      "iron": self.iron or 0,
      "vitaminC": self.vitamin_c or 0,
      "createdAt": self.created_at.isoformat() if self.created_at else None,
      "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
    }


class HydrationLog(db.Model):
  __tablename__ = "hydration_logs"

  id = db.Column(db.Integer, primary_key=True)
  user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
  log_date = db.Column(db.Date, nullable=False, index=True)
  amount_liters = db.Column(db.Float, default=0, nullable=False)
  created_at = db.Column(db.DateTime, default=utc_now, nullable=False)
  updated_at = db.Column(db.DateTime, default=utc_now, onupdate=utc_now, nullable=False)

  user = relationship("User", back_populates="hydration_logs")

  def to_dict(self):
    return {
      "id": self.id,
      "userId": self.user_id,
      "date": self.log_date.isoformat(),
      "amountLiters": self.amount_liters or 0,
    }
