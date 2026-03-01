# VERD — Custom ML Model Training Pipeline

## Overview

This directory contains a complete Python pipeline to train a custom crop disease classification model using **Keras/TensorFlow** and export it for use in VERD's browser-based scanner (via **TensorFlow.js**).

The model uses **transfer learning** on MobileNetV2, fine-tuned on the [PlantVillage](https://www.kaggle.com/datasets/emmarex/plantdisease) dataset (54,000+ labeled crop disease images across 38 classes).

## Quick Start (Google Colab — Recommended)

Since no local Python is required, you can train entirely in the cloud:

1. Open [Google Colab](https://colab.research.google.com/)
2. Upload `train_model.py` or copy its contents into a notebook
3. Run each section in order
4. Download the exported `tfjs_model/` directory
5. Place it in `agri-scan/public/models/verd-crop-v1/`
6. VERD's scanner service will automatically detect and load it

### Colab Cell-by-Cell Setup

```python
# Cell 1: Install dependencies
!pip install tensorflow tensorflowjs kagglehub pillow matplotlib

# Cell 2: Run training
!python train_model.py

# Cell 3: Download model
from google.colab import files
import shutil
shutil.make_archive('verd-crop-model', 'zip', 'tfjs_model')
files.download('verd-crop-model.zip')
```

## Local Setup (if Python is installed)

```bash
pip install tensorflow tensorflowjs kagglehub pillow matplotlib
python train_model.py
```

## Output

After training completes, you'll get:

| File | Description |
|---|---|
| `saved_model/verd_crop_model.h5` | Keras model weights |
| `tfjs_model/model.json` | TensorFlow.js model topology |
| `tfjs_model/group1-shard*of*.bin` | Model weight shards |
| `tfjs_model/class_labels.json` | Class name mapping |
| `training_history.png` | Accuracy/loss curves |

## Model Architecture

```
MobileNetV2 (frozen base, ImageNet weights)
  -> GlobalAveragePooling2D
  -> Dense(256, ReLU) + BatchNorm + Dropout(0.5)
  -> Dense(128, ReLU) + BatchNorm + Dropout(0.3)
  -> Dense(NUM_CLASSES, Softmax)
```

- **Input**: 224 x 224 x 3 (RGB)
- **Output**: Probability distribution over crop disease classes
- **Training**: 15 epochs, batch size 32, Adam optimizer with ReduceLROnPlateau
- **Expected accuracy**: 92-96% on PlantVillage validation set

## Connecting to VERD

After exporting, place the `tfjs_model/` contents into your VERD app:

```
agri-scan/
  public/
    models/
      verd-crop-v1/
        model.json
        group1-shard1of3.bin
        group1-shard2of3.bin
        group1-shard3of3.bin
        class_labels.json
```

The updated `scanner.js` on this branch automatically checks for this directory and loads the custom model instead of MobileNet.
