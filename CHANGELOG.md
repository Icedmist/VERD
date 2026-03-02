# Changelog

All notable changes to VERD are documented here.

---

## [1.2.0] — 2026-03-02

### Added — Premium UI & Interactive Features

**New Components:**
- `src/components/NeuralNetAnim.js` — Canvas-based neural network visualization
  - 8-layer architecture rendered in real-time
  - Particles flow through active connections during inference
  - Spark effects at activated nodes
  - Layer labels sync to scan progress (Input → Conv → Pool → Dense → Output)
  - Responsive canvas with devicePixelRatio support

- `src/components/VoiceScanner.js` — Voice-guided scanning via Web Speech API
  - Auto-selects best English voice
  - Spoken cues at each scan stage
  - Full results readout: condition, confidence, severity, recommendation
  - On/off toggle persisted to localStorage

**Modified Files:**

- `src/pages/Scan.js` — Complete rebuild
  - Voice On/Off toggle button in page header
  - Neural net canvas replaces spinner during processing
  - Drag-and-drop overlay with icon and label
  - Large percentage counter during analysis
  - Gradient progress bar
  - ML engine info card with pulsing green status dot
  - Live layer label updates during inference

- `src/pages/ScanResults.js` — Visual overhaul
  - SVG confidence ring with animated stroke-dashoffset
  - Severity gradient cards (green / yellow / red based on severity)
  - Classification probability bars with rank numbers
  - Healthy crop card with green checkmark
  - Soil metric cards with hover lift effect
  - Colored glow on status indicators

- `src/style.css` — Design System v2 (complete rewrite)
  - Gradient buttons: `linear-gradient(135deg, ...)` with hover lift and shadow
  - Glass surfaces: depth shadow on hover, elevated variant
  - Glass glow variant: green-tinted border for active states
  - Micro-animations: scan tip slide-right, upload icon float, card lift
  - Severity indicator system: `.severity-none/low/medium/high`
  - SVG confidence ring styles
  - Toast notification system with auto-fade
  - Extended stagger animation (10 children)
  - Float and glow-pulse keyframe animations
  - Sidebar nav hover slide effect
  - Button active scale feedback (0.97)

- `index.html`
  - Added script tags for `NeuralNetAnim.js` and `VoiceScanner.js`

---

## [1.1.0] — 2026-03-01

### Added — ML Model Training Pipeline

**Branch: `ml/python-training`**

- `ml/option-2-python/train_model.py` — Python training script
  - Downloads PlantVillage dataset via kagglehub (54K images, 38 classes)
  - MobileNetV2 transfer learning with frozen base
  - Two-phase training: classification head (15 epochs) + fine-tuning (5 epochs)
  - Exports to TensorFlow.js format (model.json + weight shards)
  - Saves class_labels.json for frontend mapping
  - Callbacks: ReduceLROnPlateau, EarlyStopping, ModelCheckpoint
  - Training history plot (accuracy + loss curves)

- `ml/option-2-python/requirements.txt`
  - tensorflow, tensorflowjs, kagglehub, Pillow, matplotlib, numpy

- `ml/option-2-python/README.md`
  - Setup instructions for Google Colab and local Python

- `src/services/scanner.js` — Custom model loading
  - First tries `/public/models/verd-crop-v1/model.json`
  - Falls back to MobileNet v2 if custom model not found
  - Reports active model type in scan results
  - `_classifyCustom()`: preprocesses image, runs custom model inference
  - `_mapCustomPrediction()`: maps PlantVillage class names to conditions

- `public/models/verd-crop-v1/README.md` — Deployment placeholder

**Branch: `ml/custom-tfjs`**

- `src/ml/custom-model.js` — VerdModel class
  - Builds custom TF.js model using MobileNetV2 feature extractor
  - Classification head: GAP → Dense(256, ReLU) → Dropout(0.5) → Dense(38, Softmax)
  - IndexedDB persistence for trained weights
  - 38 PlantVillage class labels

- `ml/option-1-custom-tfjs/README.md`

**Branch: `ml/browser-training`**

- `src/ml/browser-trainer.js` — BrowserTrainer class
  - In-browser transfer learning using MobileNet feature extraction
  - Trains custom classification head on user-uploaded images
  - Saves/loads models from IndexedDB
  - All data stays on-device

- `src/pages/TrainModel.js` — Training UI
  - Add classes, upload images per class
  - Start/stop training with live accuracy display
  - Save and load trained models

- `ml/option-3-browser-training/README.md`

**Other changes:**
- `src/router.js` — Added `/train` route
- `src/components/Layout.js` — Added Train Model nav link
- `index.html` — Added custom-model.js and browser-trainer.js script tags
- `.gitignore` — Added ML-specific exclusions

---

## [1.0.0] — 2026-03-01

### Added — VERD v1 (Full Application)

**Core Architecture:**
- `index.html` — Single-page app entry point with CDN dependencies
- `src/main.js` — Bootstrap, auth listener, initial render
- `src/router.js` — Hash-based SPA router with auth guards
- `src/state.js` — Reactive state management singleton
- `src/style.css` — Dark theme design system with glass morphism

**Authentication:**
- `src/services/auth.js` — Firebase Auth with demo mode fallback
- `src/pages/Login.js` — Login page (email/password + demo button)
- `src/pages/Register.js` — Registration with Farmer/Admin roles

**UI Components:**
- `src/components/Layout.js` — Responsive sidebar + header shell
- `src/components/Card.js` — Glass card component
- `src/components/Modal.js` — Dialog with backdrop blur
- `src/components/WeatherWidget.js` — Weather with 5-day forecast

**Pages:**
- `src/pages/Dashboard.js` — Crop health, stats, weather, quick actions
- `src/pages/AdminDashboard.js` — Platform analytics, farmer distribution
- `src/pages/Scan.js` — Image upload + ML analysis trigger
- `src/pages/ScanResults.js` — Diagnosis, confidence, recommendations, soil metrics
- `src/pages/Marketplace.js` — Agricultural insights and advisory
- `src/pages/NotFound.js` — 404 page

**Services:**
- `src/services/scanner.js` — TensorFlow.js + MobileNet v2 inference pipeline
- `src/services/firestore.js` — Firestore CRUD operations
- `src/services/weather.js` — Weather data integration

**Utilities:**
- `src/utils/dom.js` — DOM manipulation, toast system, date formatting
- `src/utils/icons.js` — 40+ Lucide SVG icons as template literals
- `src/utils/offline.js` — Network status detection, offline banner

**Design:**
- Dark theme: `#0a0a0a` base, `#1aaf63` accent
- Glass morphism: `backdrop-filter: blur(16px)`
- All emojis replaced with SVG icons
- Mobile-first responsive layout
- Staggered fade-in animations
