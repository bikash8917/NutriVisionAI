import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.applications import EfficientNetB0

# =====================================================
# Dataset Paths
# =====================================================

TRAIN_DIR = "dataset/train"
VALIDATION_DIR = "dataset/validation"
TEST_DIR = "dataset/test"

# =====================================================
# Configuration
# =====================================================

IMAGE_SIZE = (224, 224)
BATCH_SIZE = 16
SEED = 42
EPOCHS = 20

print("=" * 60)
print("TensorFlow Version :", tf.__version__)
print("=" * 60)

# =====================================================
# Load Dataset
# =====================================================

train_dataset = tf.keras.utils.image_dataset_from_directory(
    TRAIN_DIR,
    image_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=True,
    seed=SEED
)

validation_dataset = tf.keras.utils.image_dataset_from_directory(
    VALIDATION_DIR,
    image_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=False
)

test_dataset = tf.keras.utils.image_dataset_from_directory(
    TEST_DIR,
    image_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=False
)

class_names = train_dataset.class_names

print("\nClasses:")
print(class_names)
print("\nTotal Classes :", len(class_names))

AUTOTUNE = tf.data.AUTOTUNE

train_dataset = train_dataset.prefetch(AUTOTUNE)
validation_dataset = validation_dataset.prefetch(AUTOTUNE)
test_dataset = test_dataset.prefetch(AUTOTUNE)

# =====================================================
# Data Augmentation
# =====================================================

data_augmentation = tf.keras.Sequential([
    layers.RandomFlip("horizontal"),
    layers.RandomRotation(0.1),
    layers.RandomZoom(0.1),
])

# =====================================================
# Load EfficientNetB0
# =====================================================

base_model = EfficientNetB0(
    weights="imagenet",
    include_top=False,
    input_shape=(224,224,3)
)

base_model.trainable = False

print("\nEfficientNetB0 Loaded Successfully!")

# =====================================================
# Build Model
# =====================================================

model = models.Sequential([
    layers.Input(shape=(224,224,3)),

    data_augmentation,

    # IMPORTANT:
    # Do NOT use Rescaling(1./255)

    base_model,

    layers.GlobalAveragePooling2D(),

    layers.Dense(256, activation="relu"),

    layers.Dropout(0.3),

    layers.Dense(len(class_names), activation="softmax")
])

# =====================================================
# Compile
# =====================================================

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)

model.summary()

# =====================================================
# Callbacks
# =====================================================

early_stop = tf.keras.callbacks.EarlyStopping(
    monitor="val_loss",
    patience=5,
    restore_best_weights=True
)

reduce_lr = tf.keras.callbacks.ReduceLROnPlateau(
    monitor="val_loss",
    factor=0.2,
    patience=2,
    min_lr=1e-6,
    verbose=1
)

checkpoint = tf.keras.callbacks.ModelCheckpoint(
    "best_food_model.keras",
    monitor="val_accuracy",
    save_best_only=True,
    verbose=1
)

# =====================================================
# Train
# =====================================================

history = model.fit(
    train_dataset,
    validation_data=validation_dataset,
    epochs=EPOCHS,
    callbacks=[
        early_stop,
        reduce_lr,
        checkpoint
    ]
)

# =====================================================
# Evaluate
# =====================================================

print("\nEvaluating on Test Dataset...\n")

loss, accuracy = model.evaluate(test_dataset)

print("=" * 60)
print(f"Test Loss     : {loss:.4f}")
print(f"Test Accuracy : {accuracy*100:.2f}%")
print("=" * 60)

# =====================================================
# Save Final Model
# =====================================================

model.save("food_classifier_model.keras")

print("\nFinal model saved successfully!")