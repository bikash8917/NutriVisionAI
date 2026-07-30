import os
from datetime import timedelta

from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))


def _normalize_database_url(database_url):
  if not database_url or "your_neon_connection_string" in database_url:
    raise RuntimeError("DATABASE_URL must be set to the Neon PostgreSQL connection string")
  return database_url.replace("postgres://", "postgresql://", 1)


class Config:
  SECRET_KEY = os.getenv("SECRET_KEY", "change-me")
  SQLALCHEMY_DATABASE_URI = _normalize_database_url(os.getenv("DATABASE_URL"))
  SQLALCHEMY_TRACK_MODIFICATIONS = False
  JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", SECRET_KEY)
  JWT_COOKIE_NAME = os.getenv("JWT_COOKIE_NAME", "access_token")
  JWT_COOKIE_SECURE = os.getenv("JWT_COOKIE_SECURE", "false").lower() == "true"
  JWT_COOKIE_SAMESITE = os.getenv("JWT_COOKIE_SAMESITE", "Lax")
  JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=int(os.getenv("JWT_ACCESS_DAYS", "7")))
  CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
    if origin.strip()
  ]
  UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "uploads")
  AUTO_CREATE_TABLES = os.getenv("AUTO_CREATE_TABLES", "false").lower() == "true"
