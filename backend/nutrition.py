import os
import pandas as pd

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

CSV_PATH = os.path.join(BASE_DIR, "nutrition-value-team-nexus.csv")

df = pd.read_csv(CSV_PATH)

df["food_name"] = df["food_name"].str.lower().str.strip()


def get_nutrition(food_name):
    food_name = food_name.lower().strip()

    food = df[df["food_name"] == food_name]

    if food.empty:
        return None

    row = food.iloc[0]

    return {
        "servingSize": int(row["serving_size_g"]),
        "calories": float(row["calories_kcal"]),
        "protein": float(row["protein_g"]),
        "carbs": float(row["carbs_g"]),
        "fat": float(row["fat_g"]),
        "fiber": float(row["fiber_g"]),
        "sugar": float(row["sugar_g"]),
        "sodium": float(row["sodium_mg"]),
        "cholesterol": float(row["cholesterol_mg"]),
        "potassium": float(row["potassium_mg"]),
        "calcium": float(row["calcium_mg"]),
        "iron": float(row["iron_mg"]),
        "vitaminC": float(row["vitamin_c_mg"]),
        "category": row["category"]
    }