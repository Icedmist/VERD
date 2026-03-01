#!/usr/bin/env python3
"""
VERD — Crop Disease Classification Model Training Pipeline
============================================================
Train a custom MobileNetV2-based model on the PlantVillage dataset
and export it for TensorFlow.js (browser inference).

Usage:
    pip install tensorflow tensorflowjs kagglehub pillow matplotlib
    python train_model.py

Or run cell-by-cell in Google Colab.
"""

import os
import json
import numpy as np

# ─── Config ───────────────────────────────────────────────
CONFIG = {
    "img_size": 224,
    "batch_size": 32,
    "epochs": 15,
    "learning_rate": 1e-3,
    "fine_tune_at": 100,        # Unfreeze layers after this index
    "fine_tune_epochs": 5,
    "validation_split": 0.2,
    "model_name": "verd_crop_model",
    "output_dir": "saved_model",
    "tfjs_output_dir": "tfjs_model",
}

# ─── Step 1: Download Dataset ─────────────────────────────
def download_dataset():
    """Download PlantVillage dataset via kagglehub or manual path."""
    print("\n[1/6] Downloading PlantVillage dataset...")

    try:
        import kagglehub
        path = kagglehub.dataset_download("emmarex/plantdisease")
        # Find the actual image directory
        for root, dirs, files in os.walk(path):
            if len(dirs) > 10:  # PlantVillage has 38 class folders
                return root
        return path
    except Exception as e:
        print(f"  kagglehub failed: {e}")
        print("  Trying alternative download method...")

    # Fallback: check if data directory exists locally
    local_paths = [
        "data/PlantVillage",
        "data/plantvillage",
        "PlantVillage",
        "/content/data/PlantVillage",  # Colab
    ]
    for p in local_paths:
        if os.path.isdir(p):
            print(f"  Found local dataset at: {p}")
            return p

    # Fallback: download via Kaggle API
    try:
        os.system("pip install kaggle -q")
        os.system("kaggle datasets download -d emmarex/plantdisease -p data/ --unzip")
        for root, dirs, files in os.walk("data"):
            if len(dirs) > 10:
                return root
    except Exception:
        pass

    raise FileNotFoundError(
        "Could not download PlantVillage dataset.\n"
        "Please download manually from:\n"
        "  https://www.kaggle.com/datasets/emmarex/plantdisease\n"
        "Extract to: data/PlantVillage/"
    )


# ─── Step 2: Prepare Data Pipeline ────────────────────────
def prepare_data(data_dir):
    """Create train/validation data generators with augmentation."""
    print("\n[2/6] Preparing data pipeline...")

    import tensorflow as tf
    from tensorflow.keras.preprocessing.image import ImageDataGenerator

    # Training data with augmentation
    train_datagen = ImageDataGenerator(
        rescale=1.0 / 255,
        rotation_range=25,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.15,
        zoom_range=0.2,
        horizontal_flip=True,
        vertical_flip=False,
        brightness_range=[0.8, 1.2],
        fill_mode="nearest",
        validation_split=CONFIG["validation_split"],
    )

    # Validation data without augmentation
    val_datagen = ImageDataGenerator(
        rescale=1.0 / 255,
        validation_split=CONFIG["validation_split"],
    )

    train_gen = train_datagen.flow_from_directory(
        data_dir,
        target_size=(CONFIG["img_size"], CONFIG["img_size"]),
        batch_size=CONFIG["batch_size"],
        class_mode="categorical",
        subset="training",
        shuffle=True,
        seed=42,
    )

    val_gen = val_datagen.flow_from_directory(
        data_dir,
        target_size=(CONFIG["img_size"], CONFIG["img_size"]),
        batch_size=CONFIG["batch_size"],
        class_mode="categorical",
        subset="validation",
        shuffle=False,
        seed=42,
    )

    num_classes = len(train_gen.class_indices)
    class_names = {v: k for k, v in train_gen.class_indices.items()}

    print(f"  Classes: {num_classes}")
    print(f"  Training samples: {train_gen.samples}")
    print(f"  Validation samples: {val_gen.samples}")
    print(f"  Sample classes: {list(class_names.values())[:5]}...")

    return train_gen, val_gen, num_classes, class_names


# ─── Step 3: Build Model ──────────────────────────────────
def build_model(num_classes):
    """Build MobileNetV2 transfer learning model."""
    print("\n[3/6] Building model architecture...")

    import tensorflow as tf
    from tensorflow.keras import layers, Model
    from tensorflow.keras.applications import MobileNetV2

    # Load MobileNetV2 base (frozen)
    base_model = MobileNetV2(
        input_shape=(CONFIG["img_size"], CONFIG["img_size"], 3),
        include_top=False,
        weights="imagenet",
    )
    base_model.trainable = False

    # Build classification head
    inputs = tf.keras.Input(shape=(CONFIG["img_size"], CONFIG["img_size"], 3))
    x = base_model(inputs, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dense(256, activation="relu")(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(0.5)(x)
    x = layers.Dense(128, activation="relu")(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(0.3)(x)
    outputs = layers.Dense(num_classes, activation="softmax")(x)

    model = Model(inputs, outputs, name="verd_crop_classifier")

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=CONFIG["learning_rate"]),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )

    total_params = model.count_params()
    trainable_params = sum(
        tf.keras.backend.count_params(w) for w in model.trainable_weights
    )
    print(f"  Total params: {total_params:,}")
    print(f"  Trainable params: {trainable_params:,}")
    print(f"  Non-trainable (frozen MobileNetV2): {total_params - trainable_params:,}")

    return model, base_model


# ─── Step 4: Train Model ──────────────────────────────────
def train_model(model, base_model, train_gen, val_gen):
    """Train in two phases: frozen base, then fine-tuning."""
    print("\n[4/6] Training model...")

    import tensorflow as tf

    callbacks = [
        tf.keras.callbacks.ReduceLROnPlateau(
            monitor="val_loss", factor=0.5, patience=3, min_lr=1e-6, verbose=1
        ),
        tf.keras.callbacks.EarlyStopping(
            monitor="val_accuracy", patience=5, restore_best_weights=True, verbose=1
        ),
        tf.keras.callbacks.ModelCheckpoint(
            os.path.join(CONFIG["output_dir"], f"{CONFIG['model_name']}_best.h5"),
            monitor="val_accuracy",
            save_best_only=True,
            verbose=1,
        ),
    ]

    os.makedirs(CONFIG["output_dir"], exist_ok=True)

    # Phase 1: Train classification head only
    print("\n  Phase 1: Training classification head (base frozen)...")
    history1 = model.fit(
        train_gen,
        epochs=CONFIG["epochs"],
        validation_data=val_gen,
        callbacks=callbacks,
        verbose=1,
    )

    # Phase 2: Fine-tune top layers of MobileNetV2
    print(f"\n  Phase 2: Fine-tuning (unfreezing layers after index {CONFIG['fine_tune_at']})...")
    base_model.trainable = True
    for layer in base_model.layers[: CONFIG["fine_tune_at"]]:
        layer.trainable = False

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=CONFIG["learning_rate"] / 10),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )

    history2 = model.fit(
        train_gen,
        epochs=CONFIG["fine_tune_epochs"],
        validation_data=val_gen,
        callbacks=callbacks,
        verbose=1,
    )

    # Merge histories
    history = {}
    for key in history1.history:
        history[key] = history1.history[key] + history2.history[key]

    return history


# ─── Step 5: Export to TensorFlow.js ───────────────────────
def export_to_tfjs(model, class_names):
    """Export model to TensorFlow.js format."""
    print("\n[5/6] Exporting to TensorFlow.js...")

    import subprocess

    os.makedirs(CONFIG["output_dir"], exist_ok=True)
    os.makedirs(CONFIG["tfjs_output_dir"], exist_ok=True)

    # Save Keras model
    h5_path = os.path.join(CONFIG["output_dir"], f"{CONFIG['model_name']}.h5")
    model.save(h5_path)
    print(f"  Saved Keras model: {h5_path}")

    # Convert to TF.js
    try:
        subprocess.run(
            [
                "tensorflowjs_converter",
                "--input_format=keras",
                "--output_format=tfjs_layers_model",
                "--weight_shard_size_bytes=4194304",
                h5_path,
                CONFIG["tfjs_output_dir"],
            ],
            check=True,
            capture_output=True,
            text=True,
        )
        print(f"  Exported TF.js model to: {CONFIG['tfjs_output_dir']}/")
    except FileNotFoundError:
        # Fallback: use Python API
        print("  tensorflowjs_converter CLI not found, using Python API...")
        import tensorflowjs as tfjs
        tfjs.converters.save_keras_model(model, CONFIG["tfjs_output_dir"])
        print(f"  Exported TF.js model to: {CONFIG['tfjs_output_dir']}/")

    # Save class labels
    # Clean up class names for the frontend
    clean_labels = {}
    for idx, name in class_names.items():
        # PlantVillage format: "Crop___Disease" -> "Crop: Disease"
        parts = name.replace("___", ": ").replace("_", " ")
        clean_labels[str(idx)] = parts

    labels_path = os.path.join(CONFIG["tfjs_output_dir"], "class_labels.json")
    with open(labels_path, "w") as f:
        json.dump(clean_labels, f, indent=2)
    print(f"  Saved class labels: {labels_path}")

    # Print model size
    total_size = 0
    for root, dirs, files in os.walk(CONFIG["tfjs_output_dir"]):
        for file in files:
            total_size += os.path.getsize(os.path.join(root, file))
    print(f"  Total model size: {total_size / 1024 / 1024:.1f} MB")


# ─── Step 6: Plot Training History ─────────────────────────
def plot_history(history):
    """Save training accuracy/loss curves."""
    print("\n[6/6] Saving training history...")

    try:
        import matplotlib
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt

        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))
        fig.suptitle("VERD Crop Classifier — Training History", fontsize=14, fontweight="bold")

        # Accuracy
        ax1.plot(history["accuracy"], label="Train", linewidth=2)
        ax1.plot(history["val_accuracy"], label="Validation", linewidth=2)
        ax1.set_title("Accuracy")
        ax1.set_xlabel("Epoch")
        ax1.set_ylabel("Accuracy")
        ax1.legend()
        ax1.grid(True, alpha=0.3)

        # Loss
        ax2.plot(history["loss"], label="Train", linewidth=2)
        ax2.plot(history["val_loss"], label="Validation", linewidth=2)
        ax2.set_title("Loss")
        ax2.set_xlabel("Epoch")
        ax2.set_ylabel("Loss")
        ax2.legend()
        ax2.grid(True, alpha=0.3)

        plt.tight_layout()
        plt.savefig("training_history.png", dpi=150)
        print("  Saved: training_history.png")
    except ImportError:
        print("  matplotlib not available, skipping plot")


# ─── Main ─────────────────────────────────────────────────
def main():
    print("=" * 60)
    print("  VERD — Crop Disease Model Training Pipeline")
    print("=" * 60)

    # Step 1: Get dataset
    data_dir = download_dataset()

    # Step 2: Prepare data
    train_gen, val_gen, num_classes, class_names = prepare_data(data_dir)

    # Step 3: Build model
    model, base_model = build_model(num_classes)

    # Step 4: Train
    history = train_model(model, base_model, train_gen, val_gen)

    # Step 5: Export
    export_to_tfjs(model, class_names)

    # Step 6: Plot
    plot_history(history)

    # Summary
    final_acc = history["val_accuracy"][-1]
    print("\n" + "=" * 60)
    print(f"  Training complete!")
    print(f"  Final validation accuracy: {final_acc:.1%}")
    print(f"  Keras model: {CONFIG['output_dir']}/{CONFIG['model_name']}.h5")
    print(f"  TF.js model: {CONFIG['tfjs_output_dir']}/model.json")
    print(f"  Class labels: {CONFIG['tfjs_output_dir']}/class_labels.json")
    print("=" * 60)
    print("\n  Next: Copy tfjs_model/ contents to")
    print("  agri-scan/public/models/verd-crop-v1/")
    print("  and VERD will use your custom model automatically.\n")


if __name__ == "__main__":
    main()
