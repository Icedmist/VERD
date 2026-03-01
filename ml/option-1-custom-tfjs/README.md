# VERD — Custom TF.js Model (In-Browser Architecture)

## Overview

This branch provides a **custom TensorFlow.js model architecture** built entirely in the browser. Rather than using the generic MobileNet classifier, this defines a purpose-built crop disease classification network.

## How It Works

1. The model architecture is defined in `src/ml/custom-model.js`
2. It uses MobileNetV2 as a **feature extractor** (loaded from CDN)
3. A custom classification head is built on top using TF.js Layers API
4. The model can load pre-trained weights from `/public/models/verd-crop-v1/`

## Architecture

```
MobileNetV2 Feature Extractor (truncated at 'out_relu')
  → Global Average Pooling 2D
  → Dense(256, ReLU) + Dropout(0.5)
  → Dense(128, ReLU) + Dropout(0.3)
  → Dense(NUM_CLASSES, Softmax)
```

This is the **same architecture** as the Python training pipeline (Option 2), ensuring weight compatibility. Models trained in Python can be loaded directly.

## Key Difference from Option 2

- **Option 2**: Train in Python → export → load weights here
- **Option 1 (this)**: Define the full model graph in TF.js, load weights either from Python export OR from in-browser training

## Usage

The `VerdModel` class in `custom-model.js` provides:

```javascript
const model = new VerdModel();
await model.initialize(classLabels);    // Build architecture
await model.loadWeights(modelUrl);      // Load pre-trained weights
const predictions = await model.predict(imageElement);  // Inference
```

## Files

| File | Description |
|---|---|
| `src/ml/custom-model.js` | TF.js model architecture and inference |
| `src/services/scanner.js` | Updated scanner using VerdModel |
