# VERD — In-Browser Transfer Learning

## Overview

This branch adds an in-browser **transfer learning** system where users can train a custom crop classifier directly inside the VERD application — no Python, no servers, no data uploads.

## How It Works

1. Navigate to the **Train Model** page (`#/train`)
2. Create training classes (e.g., "Healthy Maize", "Maize Blight", "Fall Armyworm")
3. Upload 10-20 sample images per class
4. Click **Train** — the browser trains a classifier using MobileNet feature extraction
5. The trained model is saved to IndexedDB and used for future scans

## Architecture

```
MobileNet v2 (frozen, feature extraction only)
  → Extracted feature vectors (1280-dim)
  → Dense(128, ReLU) + Dropout(0.3)
  → Dense(NUM_USER_CLASSES, Softmax)
```

- Training happens entirely in the browser via TensorFlow.js
- Features are extracted once and cached, making training fast
- Typical training time: 10-30 seconds for 5 classes × 20 images each

## Key Advantage

Farmers can create models specific to **their own crops and local diseases**, rather than relying on a generic pre-trained model. The model improves as more samples are added.

## Privacy

All data stays on the user's device. No images are uploaded to any server.

## Files

| File | Description |
|---|---|
| `src/ml/browser-trainer.js` | Transfer learning engine |
| `src/pages/TrainModel.js` | Training UI page |
| `src/services/scanner.js` | Updated to use browser-trained model |
