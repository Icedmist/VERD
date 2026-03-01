This directory is where the custom VERD crop classifier model files are deployed.

After training with `ml/option-2-python/train_model.py`, copy the contents of
the generated `tfjs_model/` directory here:

  - model.json
  - group1-shard1of*.bin (weight files)
  - class_labels.json

The scanner service will automatically detect and load these files.
If no model is found here, VERD falls back to the generic MobileNet v2.
