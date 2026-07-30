import os
import random
import shutil

# ======================================================
# DATASET SPLITTER
# ======================================================

# Source dataset (Original Images)
SOURCE_DIR = "food-Dataset"

# Output dataset
DEST_DIR = "dataset"

# Split Ratio
TRAIN_RATIO = 0.80
VAL_RATIO = 0.10
TEST_RATIO = 0.10

# Random Seed (Keeps same split every run)
RANDOM_SEED = 42

# Supported Image Extensions
IMAGE_EXTENSIONS = (
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".bmp",
    ".tif",
    ".tiff"
)

random.seed(RANDOM_SEED)

# ======================================================
# Create Output Folders
# ======================================================

for split in ["train", "validation", "test"]:
    os.makedirs(os.path.join(DEST_DIR, split), exist_ok=True)

print("=" * 75)
print(f"{'Class':20}{'Total':>10}{'Train':>10}{'Validation':>12}{'Test':>10}")
print("=" * 75)

grand_total = 0
grand_train = 0
grand_val = 0
grand_test = 0

# ======================================================
# Process Every Class
# ======================================================

for class_name in sorted(os.listdir(SOURCE_DIR)):

    class_path = os.path.join(SOURCE_DIR, class_name)

    if not os.path.isdir(class_path):
        continue

    images = [
        img for img in os.listdir(class_path)
        if img.lower().endswith(IMAGE_EXTENSIONS)
    ]

    total = len(images)

    if total == 0:
        print(f"Skipping '{class_name}' (No images found)")
        continue

    random.shuffle(images)

    train_count = int(total * TRAIN_RATIO)
    val_count = int(total * VAL_RATIO)
    test_count = total - train_count - val_count

    train_images = images[:train_count]
    val_images = images[train_count:train_count + val_count]
    test_images = images[train_count + val_count:]

    # Create Class Folders
    train_folder = os.path.join(DEST_DIR, "train", class_name)
    val_folder = os.path.join(DEST_DIR, "validation", class_name)
    test_folder = os.path.join(DEST_DIR, "test", class_name)

    os.makedirs(train_folder, exist_ok=True)
    os.makedirs(val_folder, exist_ok=True)
    os.makedirs(test_folder, exist_ok=True)

    # Copy Train Images
    for img in train_images:
        shutil.copy2(
            os.path.join(class_path, img),
            os.path.join(train_folder, img)
        )

    # Copy Validation Images
    for img in val_images:
        shutil.copy2(
            os.path.join(class_path, img),
            os.path.join(val_folder, img)
        )

    # Copy Test Images
    for img in test_images:
        shutil.copy2(
            os.path.join(class_path, img),
            os.path.join(test_folder, img)
        )

    grand_total += total
    grand_train += train_count
    grand_val += val_count
    grand_test += test_count

    print(
        f"{class_name:20}"
        f"{total:10}"
        f"{train_count:10}"
        f"{val_count:12}"
        f"{test_count:10}"
    )

print("=" * 75)
print(f"{'TOTAL':20}{grand_total:10}{grand_train:10}{grand_val:12}{grand_test:10}")
print("=" * 75)

print("\n✅ Dataset successfully split!")
print(f"📂 Output Folder : {DEST_DIR}")
print(f"📸 Total Images : {grand_total}")
print(f"🎯 Train Images : {grand_train}")
print(f"🧪 Validation   : {grand_val}")
print(f"✅ Test Images  : {grand_test}")