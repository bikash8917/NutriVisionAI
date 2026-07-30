import base64
import hashlib
import hmac
import json
import os
import time
from datetime import date, datetime, timedelta, timezone
from functools import wraps

from dotenv import load_dotenv
from flask import Flask, g, jsonify, request
from flask_cors import CORS
from sqlalchemy import func
from werkzeug.security import check_password_hash, generate_password_hash

from config import Config
from database import init_db
from extensions import db, migrate
from models import Goal, HydrationLog, Meal, Profile, Settings, User
from nutrition import get_nutrition
from predict import predict_food

load_dotenv()


def get_jwt_identity():
  return g.get("jwt_identity")


def _base64_urlsafe_encode(value):
  return base64.urlsafe_b64encode(value).rstrip(b"=").decode("utf-8")


def _base64_urlsafe_decode(value):
  padding = "=" * (-len(value) % 4)
  return base64.urlsafe_b64decode(value + padding)


def create_access_token(identity):
  now = int(time.time())
  expires = now + int(Config.JWT_ACCESS_TOKEN_EXPIRES.total_seconds())
  header = {"alg": "HS256", "typ": "JWT"}
  payload = {
    "sub": str(identity),
    "iat": now,
    "exp": expires,
  }
  signing_input = ".".join([
    _base64_urlsafe_encode(json.dumps(header, separators=(",", ":")).encode("utf-8")),
    _base64_urlsafe_encode(json.dumps(payload, separators=(",", ":")).encode("utf-8")),
  ])
  signature = hmac.new(
    Config.JWT_SECRET_KEY.encode("utf-8"),
    signing_input.encode("utf-8"),
    hashlib.sha256,
  ).digest()
  return f"{signing_input}.{_base64_urlsafe_encode(signature)}"


def _decode_access_token(token):
  header_part, payload_part, signature_part = token.split(".")
  signing_input = f"{header_part}.{payload_part}"
  expected_signature = hmac.new(
    Config.JWT_SECRET_KEY.encode("utf-8"),
    signing_input.encode("utf-8"),
    hashlib.sha256,
  ).digest()
  if not hmac.compare_digest(signature_part, _base64_urlsafe_encode(expected_signature)):
    raise ValueError("Invalid token signature")

  payload = json.loads(_base64_urlsafe_decode(payload_part).decode("utf-8"))
  if int(payload.get("exp", 0)) < int(time.time()):
    raise ValueError("Token expired")
  return payload


def set_access_cookies(response, access_token):
  response.set_cookie(
    Config.JWT_COOKIE_NAME,
    access_token,
    httponly=True,
    secure=Config.JWT_COOKIE_SECURE,
    samesite=Config.JWT_COOKIE_SAMESITE,
    max_age=int(Config.JWT_ACCESS_TOKEN_EXPIRES.total_seconds()),
    path="/",
  )


def unset_jwt_cookies(response):
  response.delete_cookie(Config.JWT_COOKIE_NAME, path="/")


def jwt_required(optional=False):
  def decorator(view_function):
    @wraps(view_function)
    def wrapper(*args, **kwargs):
      token = request.cookies.get(Config.JWT_COOKIE_NAME)
      if not token:
        if optional:
          g.jwt_identity = None
          return view_function(*args, **kwargs)
        return jsonify({"error": "Authentication required"}), 401

      try:
        payload = _decode_access_token(token)
      except Exception:
        if optional:
          g.jwt_identity = None
          return view_function(*args, **kwargs)
        return jsonify({"error": "Invalid session"}), 401

      g.jwt_identity = payload.get("sub")
      return view_function(*args, **kwargs)

    return wrapper

  return decorator


def create_app():
  app = Flask(__name__)
  app.config.from_object(Config)
  os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

  CORS(app, supports_credentials=True, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}})
  db.init_app(app)
  migrate.init_app(app, db)

  @app.after_request
  def add_security_headers(response):
    response.headers["Cache-Control"] = "no-store"
    return response

  @app.route("/api/health")
  def health():
    return jsonify({"status": "ok"})

  @app.route("/api/auth/register", methods=["POST"])
  def register():
    payload = request.get_json(silent=True) or {}
    username = (payload.get("username") or payload.get("email") or "").split("@")[0].strip().lower()
    email = (payload.get("email") or "").strip().lower()
    password = payload.get("password") or ""
    full_name = (payload.get("fullName") or payload.get("name") or username).strip()

    if not username or not email or not password:
      return jsonify({"error": "Username, email, and password are required"}), 400

    if User.query.filter((User.email == email) | (User.username == username)).first():
      return jsonify({"error": "An account with those credentials already exists"}), 409

    user = User(
      username=username,
      email=email,
      password_hash=generate_password_hash(password),
    )
    db.session.add(user)
    db.session.flush()

    profile = Profile(
      user_id=user.id,
      full_name=full_name,
      email=email,
    )
    settings = Settings(user_id=user.id)
    goal = Goal(user_id=user.id)

    db.session.add_all([profile, settings, goal])
    db.session.commit()

    access_token = create_access_token(identity=str(user.id))
    response = jsonify({
      "message": "Account created",
      "user": serialize_current_user(user),
    })
    set_access_cookies(response, access_token)
    return response, 201

  @app.route("/api/auth/login", methods=["POST"])
  def login():
    payload = request.get_json(silent=True) or {}
    identifier = (payload.get("email") or payload.get("username") or "").strip().lower()
    password = payload.get("password") or ""

    if not identifier or not password:
      return jsonify({"error": "Email and password are required"}), 400

    user = User.query.filter((User.email == identifier) | (User.username == identifier)).first()
    if not user or not check_password_hash(user.password_hash, password):
      return jsonify({"error": "Invalid email or password"}), 401

    access_token = create_access_token(identity=str(user.id))
    response = jsonify({
      "message": "Signed in",
      "user": serialize_current_user(user),
    })
    set_access_cookies(response, access_token)
    return response

  @app.route("/api/auth/logout", methods=["POST"])
  def logout():
    response = jsonify({"message": "Signed out"})
    unset_jwt_cookies(response)
    return response

  @app.route("/api/auth/reset-password", methods=["POST"])
  def reset_password():
    payload = request.get_json(silent=True) or {}
    email = (payload.get("email") or "").strip().lower()
    if not email:
      return jsonify({"error": "Email is required"}), 400
    return jsonify({"message": "Password reset requested", "email": email})

  @app.route("/api/auth/me")
  @jwt_required(optional=True)
  def me():
    user = current_user()
    if not user:
      return jsonify({"user": None}), 200
    return jsonify({"user": serialize_current_user(user)})

  @app.route("/api/profile", methods=["GET", "PATCH"])
  @jwt_required()
  def profile():
    user = current_user()
    profile = ensure_profile(user)

    if request.method == "GET":
      return jsonify(profile.to_dict())

    payload = request.get_json(silent=True) or {}
    profile.profile_image = payload.get("profileImage", profile.profile_image)
    profile.full_name = payload.get("fullName", profile.full_name)
    profile.email = payload.get("email", user.email)
    profile.phone = payload.get("phone", profile.phone)
    profile.age = to_int(payload.get("age"), profile.age)
    profile.gender = payload.get("gender", profile.gender)
    profile.height = to_float(payload.get("height"), profile.height)
    profile.weight = to_float(payload.get("weight"), profile.weight)
    profile.activity_level = payload.get("activityLevel", profile.activity_level)
    profile.daily_goal = payload.get("dailyGoal", profile.daily_goal)
    user.email = profile.email or user.email
    db.session.commit()
    return jsonify(profile.to_dict())

  @app.route("/api/settings", methods=["GET", "PATCH"])
  @jwt_required()
  def settings():
    user = current_user()
    settings = ensure_settings(user)

    if request.method == "GET":
      return jsonify(settings.to_dict())

    payload = request.get_json(silent=True) or {}
    settings.theme = (payload.get("theme") or settings.theme or "light").lower()
    settings.notifications_enabled = bool(payload.get("notifications", settings.notifications_enabled))
    settings.reminders_enabled = bool(payload.get("reminders", settings.reminders_enabled))
    settings.preferred_units = payload.get("units", settings.preferred_units)
    db.session.commit()
    return jsonify(settings.to_dict())

  @app.route("/api/goals", methods=["GET", "PATCH"])
  @jwt_required()
  def goals():
    user = current_user()
    goal = ensure_goal(user)

    if request.method == "GET":
      return jsonify(goal.to_dict())

    payload = request.get_json(silent=True) or {}
    goal.calorie_goal = to_float(payload.get("calorieGoal"), goal.calorie_goal)
    goal.protein_goal = to_float(payload.get("proteinGoal"), goal.protein_goal)
    goal.carbohydrate_goal = to_float(payload.get("carbohydrateGoal"), goal.carbohydrate_goal)
    goal.fat_goal = to_float(payload.get("fatGoal"), goal.fat_goal)
    goal.weight_loss_kg = max(to_float(payload.get("weightLossKg"), goal.weight_loss_kg), 0)
    goal.timeframe_days = max(to_int(payload.get("timeframeDays"), goal.timeframe_days), 1)
    db.session.commit()
    return jsonify(goal.to_dict())

  @app.route("/api/meals", methods=["GET", "POST", "DELETE"])
  @jwt_required()
  def meals():
    user = current_user()

    if request.method == "GET":
      return jsonify([meal.to_dict() for meal in Meal.query.filter_by(user_id=user.id).order_by(Meal.created_at.desc()).all()])

    if request.method == "DELETE":
      Meal.query.filter_by(user_id=user.id).delete()
      db.session.commit()
      return jsonify({"message": "Meals cleared"})

    payload = request.get_json(silent=True) or {}
    meal = Meal(
      user_id=user.id,
      food_name=(payload.get("food") or payload.get("foodName") or "").strip(),
      image_path=payload.get("image") or payload.get("imagePath") or "",
      calories=to_float(payload.get("calories"), 0),
      protein=to_float(payload.get("protein"), 0),
      carbohydrates=to_float(payload.get("carbs") or payload.get("carbohydrates"), 0),
      fats=to_float(payload.get("fat") or payload.get("fats"), 0),
      fiber=to_float(payload.get("fiber"), 0),
      sugar=to_float(payload.get("sugar"), 0),
      quantity=to_float(payload.get("quantity"), 100),
      serving_size=to_float(payload.get("servingSize") or payload.get("serving_size"), 100),
      prediction_confidence=to_float(payload.get("confidence") or payload.get("predictionConfidence"), 0),
      meal_type=payload.get("mealType") or "Breakfast",
      original_nutrition=payload.get("nutrition") or payload.get("originalNutrition") or {},
      sodium=to_float(payload.get("sodium"), 0),
      cholesterol=to_float(payload.get("cholesterol"), 0),
      potassium=to_float(payload.get("potassium"), 0),
      calcium=to_float(payload.get("calcium"), 0),
      iron=to_float(payload.get("iron"), 0),
      vitamin_c=to_float(payload.get("vitaminC"), 0),
    )

    if not meal.food_name:
      return jsonify({"error": "Food name is required"}), 400

    db.session.add(meal)
    db.session.commit()
    return jsonify(meal.to_dict()), 201

  @app.route("/api/meals/<int:meal_id>", methods=["PATCH", "DELETE"])
  @jwt_required()
  def meal_detail(meal_id):
    user = current_user()
    meal = Meal.query.filter_by(id=meal_id, user_id=user.id).first_or_404()

    if request.method == "DELETE":
      db.session.delete(meal)
      db.session.commit()
      return jsonify({"message": "Meal deleted"})

    payload = request.get_json(silent=True) or {}
    meal.meal_type = payload.get("mealType", meal.meal_type)
    meal.quantity = to_float(payload.get("quantity"), meal.quantity)
    if payload.get("nutrition"):
      meal.original_nutrition = payload.get("nutrition")

    nutrition = meal.original_nutrition or {}
    quantity_factor = meal.quantity / max(to_float(nutrition.get("servingSize"), meal.serving_size or 100) or 100, 1)

    meal.calories = to_float(nutrition.get("calories"), meal.calories) * quantity_factor
    meal.protein = to_float(nutrition.get("protein"), meal.protein) * quantity_factor
    meal.carbohydrates = to_float(nutrition.get("carbs") or nutrition.get("carbohydrates"), meal.carbohydrates) * quantity_factor
    meal.fats = to_float(nutrition.get("fat") or nutrition.get("fats"), meal.fats) * quantity_factor
    meal.fiber = to_float(nutrition.get("fiber"), meal.fiber) * quantity_factor
    meal.sugar = to_float(nutrition.get("sugar"), meal.sugar) * quantity_factor
    meal.sodium = to_float(nutrition.get("sodium"), meal.sodium) * quantity_factor
    meal.cholesterol = to_float(nutrition.get("cholesterol"), meal.cholesterol) * quantity_factor
    meal.potassium = to_float(nutrition.get("potassium"), meal.potassium) * quantity_factor
    meal.calcium = to_float(nutrition.get("calcium"), meal.calcium) * quantity_factor
    meal.iron = to_float(nutrition.get("iron"), meal.iron) * quantity_factor
    meal.vitamin_c = to_float(nutrition.get("vitaminC"), meal.vitamin_c) * quantity_factor
    meal.updated_at = datetime.utcnow()
    db.session.commit()
    return jsonify(meal.to_dict())

  @app.route("/api/hydration", methods=["GET", "PATCH"])
  @jwt_required()
  def hydration():
    user = current_user()
    today = date.today()
    record = HydrationLog.query.filter_by(user_id=user.id, log_date=today).first()

    if request.method == "GET":
      return jsonify({
        "today": to_float(record.amount_liters if record else 0, 0),
        "days": {
          item.log_date.isoformat(): item.amount_liters
          for item in HydrationLog.query.filter_by(user_id=user.id).order_by(HydrationLog.log_date.asc()).all()
        },
      })

    payload = request.get_json(silent=True) or {}
    amount = to_float(payload.get("amountLiters"), 0)
    reset = bool(payload.get("reset"))
    if not record:
      record = HydrationLog(user_id=user.id, log_date=today, amount_liters=0)
      db.session.add(record)
    record.amount_liters = 0 if reset else max(amount, 0)
    db.session.commit()
    return jsonify({"today": record.amount_liters})

  @app.route("/api/dashboard/summary")
  @jwt_required()
  def dashboard_summary():
    user = current_user()
    profile = ensure_profile(user)
    settings = ensure_settings(user)
    goal = ensure_goal(user)
    meals = Meal.query.filter_by(user_id=user.id).all()
    today_meals = [meal for meal in meals if meal.created_at.date() == date.today()]
    hydration_today = get_hydration_today(user.id)
    target_calories = calculate_target_calories(profile, settings, goal)
    consumed = sum(meal.calories or 0 for meal in today_meals)
    remaining = max(round(target_calories - consumed), 0)
    progress = min(round((consumed / target_calories) * 100) if target_calories else 0, 100)
    streak = calculate_streak(meals)

    return jsonify({
      "summary": [
        {"label": "Calories Consumed", "value": f"{round(consumed)} kcal", "change": "Today"},
        {"label": "Calories Remaining", "value": f"{remaining} kcal", "change": f"Target {target_calories} kcal"},
        {"label": "Protein", "value": f"{round(sum(meal.protein or 0 for meal in today_meals), 1)} g", "change": "Today"},
        {"label": "Carbs", "value": f"{round(sum(meal.carbohydrates or 0 for meal in today_meals), 1)} g", "change": "Today"},
        {"label": "Fat", "value": f"{round(sum(meal.fats or 0 for meal in today_meals), 1)} g", "change": "Today"},
        {"label": "Goal Progress", "value": f"{progress}%", "change": format_goal(goal)},
        {"label": "Water Intake", "value": f"{round(hydration_today, 2)} L", "change": "Manual tracking"},
        {"label": "Meals Today", "value": len(today_meals), "change": "Saved"},
      ],
      "goals": [
        {"title": "Daily Target", "value": f"{target_calories} kcal"},
        {"title": "Daily Deficit", "value": f"{calculate_daily_deficit(goal)} kcal"},
        {"title": "Weekly Loss", "value": f"{round((calculate_daily_deficit(goal) * 7) / 7700, 2)} kg"},
        {"title": "Water Remaining", "value": f"{round(max(3 - hydration_today, 0), 2)} L"},
        {"title": "Weight Goal", "value": format_goal(goal)},
      ],
      "progress": progress,
      "targetCalories": target_calories,
      "remainingCalories": remaining,
      "weeklyStreak": streak,
      "motivation": build_motivation(today_meals, progress),
    })

  @app.route("/api/analytics")
  @jwt_required()
  def analytics():
    user = current_user()
    meals = Meal.query.filter_by(user_id=user.id).order_by(Meal.created_at.asc()).all()
    return jsonify({
      "weeklyCalories": weekly_calories(meals),
      "monthlyTrend": monthly_trend(meals),
      "macroBreakdown": macro_breakdown(meals),
      "mealDistribution": meal_distribution(meals),
      "topFoods": top_foods(meals),
      "averageConfidence": average_confidence(meals),
      "nutritionSummary": nutrition_summary(meals),
      "nutritionScore": nutrition_score(meals),
    })

  @app.route("/api/predict", methods=["POST"])
  @app.route("/predict", methods=["POST"])
  def predict():
    if "image" not in request.files:
      return jsonify({"error": "No image uploaded"}), 400

    file = request.files["image"]
    if not file.filename:
      return jsonify({"error": "No image uploaded"}), 400

    filepath = os.path.join(app.config["UPLOAD_FOLDER"], file.filename)
    file.save(filepath)

    try:
      result = predict_food(filepath)
      nutrition = get_nutrition(result["food"])
      result["nutrition"] = nutrition or {}
      return jsonify(result)
    finally:
      if os.path.exists(filepath):
        os.remove(filepath)

  with app.app_context():
    if app.config["AUTO_CREATE_TABLES"]:
      init_db(app)

  return app


def serialize_current_user(user):
  profile = ensure_profile(user)
  settings = ensure_settings(user)
  goal = ensure_goal(user)
  return {
    **user.to_dict(),
    "name": profile.full_name or user.username,
    "avatar": profile.profile_image or "",
    "profile": profile.to_dict(),
    "settings": settings.to_dict(),
    "goal": goal.to_dict(),
  }


def current_user():
  user_id = get_jwt_identity()
  if not user_id:
    return None
  return User.query.get(int(user_id))


def ensure_profile(user):
  profile = Profile.query.filter_by(user_id=user.id).first()
  if not profile:
    profile = Profile(user_id=user.id, full_name=user.username, email=user.email)
    db.session.add(profile)
    db.session.flush()
  return profile


def ensure_settings(user):
  settings = Settings.query.filter_by(user_id=user.id).first()
  if not settings:
    settings = Settings(user_id=user.id)
    db.session.add(settings)
    db.session.flush()
  return settings


def ensure_goal(user):
  goal = Goal.query.filter_by(user_id=user.id).first()
  if not goal:
    goal = Goal(user_id=user.id)
    db.session.add(goal)
    db.session.flush()
  return goal


def get_hydration_today(user_id):
  record = HydrationLog.query.filter_by(user_id=user_id, log_date=date.today()).first()
  return record.amount_liters if record else 0


def calculate_goal_label(goal):
  return f"Lose {round(goal.weight_loss_kg or 3, 1)} kg"


def format_goal(goal):
  return calculate_goal_label(goal)


def activity_multiplier(profile):
  return {
    "Sedentary": 1.2,
    "Light": 1.375,
    "Moderate": 1.55,
    "Active": 1.725,
    "VeryActive": 1.9,
  }.get(profile.activity_level, 1.55)


def calculate_bmr(profile):
  weight = float(profile.weight or 0)
  height = float(profile.height or 0)
  age = int(profile.age or 0)
  if not weight or not height or not age:
    return 0

  is_female = "female" in str(profile.gender or "").lower()
  base = 447.593 if is_female else 88.362
  weight_factor = 9.247 if is_female else 13.397
  height_factor = 3.098 if is_female else 4.799
  age_factor = 4.33 if is_female else 5.677
  return round(base + weight_factor * weight + height_factor * height - age_factor * age)


def calculate_daily_calories(profile):
  bmr = calculate_bmr(profile)
  if not bmr:
    return 0
  return round(bmr * activity_multiplier(profile))


def calculate_daily_deficit(goal):
  return max(round((float(goal.weight_loss_kg or 3) * 7700) / max(int(goal.timeframe_days or 30), 1)), 0)


def calculate_target_calories(profile, settings, goal):
  maintenance = calculate_daily_calories(profile)
  if not maintenance:
    return 1800
  target = maintenance - calculate_daily_deficit(goal)
  return max(round(target), 1200)


def calculate_streak(meals):
  dates = {meal.created_at.date() for meal in meals}
  streak = 0
  current = date.today()
  while current in dates:
    streak += 1
    current = date.fromordinal(current.toordinal() - 1)
  return streak


def weekly_calories(meals):
  today = date.today()
  rows = []
  for offset in range(6, -1, -1):
    current = date.fromordinal(today.toordinal() - offset)
    label = current.strftime("%a")
    total = sum((meal.calories or 0) for meal in meals if meal.created_at.date() == current)
    rows.append({"day": label, "calories": round(total, 1)})
  return rows


def monthly_trend(meals):
  rows = []
  today = date.today()
  for offset in range(5, -1, -1):
    month_index = (today.month - offset - 1) % 12 + 1
    year_adjust = (today.month - offset - 1) // 12
    label_date = today.replace(year=today.year + year_adjust, month=month_index, day=1)
    month_total = sum((meal.calories or 0) for meal in meals if meal.created_at.year == label_date.year and meal.created_at.month == label_date.month)
    rows.append({"label": label_date.strftime("%b"), "calories": round(month_total, 1)})
  return rows


def macro_breakdown(meals):
  totals = {
    "protein": sum((meal.protein or 0) for meal in meals),
    "carbs": sum((meal.carbohydrates or 0) for meal in meals),
    "fat": sum((meal.fats or 0) for meal in meals),
  }
  return [
    {"name": "Protein", "value": round(totals["protein"], 1)},
    {"name": "Carbs", "value": round(totals["carbs"], 1)},
    {"name": "Fat", "value": round(totals["fat"], 1)},
  ]


def meal_distribution(meals):
  distribution = {"Breakfast": 0, "Lunch": 0, "Dinner": 0, "Snack": 0}
  for meal in meals:
    if meal.meal_type in distribution:
      distribution[meal.meal_type] += 1
  return [{"meal": name, "count": count} for name, count in distribution.items()]


def top_foods(meals):
  counts = {}
  for meal in meals:
    counts[meal.food_name] = counts.get(meal.food_name, 0) + 1
  return [
    {"food": food.replace("_", " "), "count": count}
    for food, count in sorted(counts.items(), key=lambda item: item[1], reverse=True)[:5]
  ]


def average_confidence(meals):
  if not meals:
    return 0
  return round(sum((meal.prediction_confidence or 0) for meal in meals) / len(meals), 1)


def nutrition_summary(meals):
  if not meals:
    return {"calories": 0, "protein": 0, "carbs": 0, "fat": 0}
  count = len(meals)
  return {
    "calories": round(sum((meal.calories or 0) for meal in meals) / count, 1),
    "protein": round(sum((meal.protein or 0) for meal in meals) / count, 1),
    "carbs": round(sum((meal.carbohydrates or 0) for meal in meals) / count, 1),
    "fat": round(sum((meal.fats or 0) for meal in meals) / count, 1),
  }


def nutrition_score(meals):
  if not meals:
    return 0
  return min(100, max(0, round(average_confidence(meals) * 0.9)))


def build_motivation(today_meals, progress):
  if not today_meals:
    return "Scan your first meal to start tracking today’s nutrition."
  if progress >= 90:
    return "You are very close to your daily calorie target. Keep the momentum going."
  if progress >= 60:
    return "Good progress today. One more balanced meal will keep you on track."
  return "Small consistent meals build long-term nutrition habits."


def to_int(value, fallback=0):
  try:
    return int(float(value))
  except (TypeError, ValueError):
    return fallback


def to_float(value, fallback=0.0):
  try:
    return float(value)
  except (TypeError, ValueError):
    return fallback


app = create_app()


if __name__ == "__main__":
  app.run(host="0.0.0.0", port=int(os.getenv("PORT", "5000")), debug=False)
