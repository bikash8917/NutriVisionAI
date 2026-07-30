import os

import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing import image

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model", "best_food_model.keras")

model = tf.keras.models.load_model(MODEL_PATH)

print("Model loaded successfully.")

CLASS_NAMES = [
  "burger",
  "butter_naan",
  "caesar_salad",
  "chai",
  "chapati",
  "chicken_curry",
  "chicken_wings",
  "chole_bhature",
  "club_sandwich",
  "dal_makhani",
  "dhokla",
  "french_fries",
  "fried_rice",
  "garlic_bread",
  "greek_salad",
  "grilled_salmon",
  "hamburger",
  "hot_dog",
  "hummus",
  "ice_cream",
  "idli",
  "jalebi",
  "kaathi_rolls",
  "kadai_paneer",
  "kulfi",
  "lasagna",
  "macaroni_and_cheese",
  "masala_dosa",
  "momos",
  "nachos",
  "omelette",
  "paani_puri",
  "pad_thai",
  "paella",
  "pakode",
  "pav_bhaji",
  "pizza",
  "ramen",
  "samosa",
  "spring_rolls",
]


def predict_food(image_path):
  img = image.load_img(image_path, target_size=(224, 224))
  img_array = image.img_to_array(img)
  img_array = np.expand_dims(img_array, axis=0)
  predictions = model.predict(img_array, verbose=0)
  predicted_index = np.argmax(predictions[0])
  confidence = float(predictions[0][predicted_index])

  return {
    "food": CLASS_NAMES[predicted_index],
    "confidence": round(confidence * 100, 2),
  }


if __name__ == "__main__":
  test_image = input("Enter image path: ")

  if not os.path.exists(test_image):
    print("Image not found.")
  else:
    result = predict_food(test_image)
    print("\nPrediction")
    print("-------------------------")
    print("Food       :", result["food"])
    print("Confidence :", f"{result['confidence']}%")

