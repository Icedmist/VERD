// ═══════════════════════════════════════════
//  VERD Custom Crop Classifier — TF.js Model
// ═══════════════════════════════════════════
//  Purpose-built TensorFlow.js model for crop disease classification.
//  Uses MobileNetV2 as feature extractor + custom classification head.
//  Compatible with weights trained via the Python pipeline.
// ═══════════════════════════════════════════

window.VerdModel = class VerdModel {
    constructor() {
        this.model = null;
        this.baseModel = null;
        this.classLabels = null;
        this.initialized = false;
        this.modelUrl = '/public/models/verd-crop-v1/model.json';
        this.labelsUrl = '/public/models/verd-crop-v1/class_labels.json';
    }

    /**
     * Initialize the model — tries to load pre-trained weights first,
     * then falls back to building the architecture for future training.
     */
    async initialize() {
        if (this.initialized) return;

        console.log('VerdModel: Initializing...');

        // Try loading class labels
        try {
            const resp = await fetch(this.labelsUrl);
            if (resp.ok) {
                this.classLabels = await resp.json();
                console.log(`VerdModel: Loaded ${Object.keys(this.classLabels).length} class labels`);
            }
        } catch (e) {
            console.log('VerdModel: No class labels found, using defaults');
            this.classLabels = this._getDefaultLabels();
        }

        // Try loading the full pre-trained model
        try {
            const headResp = await fetch(this.modelUrl, { method: 'HEAD' });
            if (headResp.ok) {
                this.model = await tf.loadLayersModel(this.modelUrl);
                console.log('VerdModel: Loaded pre-trained model from', this.modelUrl);
                this.initialized = true;
                return;
            }
        } catch (e) {
            console.log('VerdModel: No pre-trained model found, building architecture...');
        }

        // Build the architecture from scratch
        await this._buildArchitecture();
        this.initialized = true;
    }

    /**
     * Build the model architecture using MobileNetV2 base.
     * This creates a randomly-initialized model that needs training.
     */
    async _buildArchitecture() {
        console.log('VerdModel: Building MobileNetV2 + classification head...');

        // Load MobileNetV2 from CDN as feature extractor
        const mobilenetModel = await tf.loadLayersModel(
            'https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v2_1.0_224/model.json'
        );

        // Find the output of the feature extraction layers (before final classification)
        // MobileNetV2's penultimate feature output layer
        const featureLayer = mobilenetModel.getLayer('out_relu');
        this.baseModel = tf.model({
            inputs: mobilenetModel.input,
            outputs: featureLayer.output,
        });

        // Freeze the base model weights
        this.baseModel.trainable = false;

        // Build classification head
        const numClasses = Object.keys(this.classLabels).length || 38;
        const input = tf.input({ shape: [224, 224, 3] });

        // Pass through frozen MobileNetV2 feature extractor
        const features = this.baseModel.apply(input);

        // Global Average Pooling
        let x = tf.layers.globalAveragePooling2d().apply(features);

        // FC layers
        x = tf.layers.dense({ units: 256, activation: 'relu', name: 'fc1' }).apply(x);
        x = tf.layers.dropout({ rate: 0.5, name: 'dropout1' }).apply(x);
        x = tf.layers.dense({ units: 128, activation: 'relu', name: 'fc2' }).apply(x);
        x = tf.layers.dropout({ rate: 0.3, name: 'dropout2' }).apply(x);

        // Output
        const output = tf.layers.dense({
            units: numClasses,
            activation: 'softmax',
            name: 'predictions'
        }).apply(x);

        this.model = tf.model({ inputs: input, outputs: output, name: 'verd_crop_classifier' });

        // Compile
        this.model.compile({
            optimizer: tf.train.adam(0.001),
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy']
        });

        const totalParams = this.model.countParams();
        console.log(`VerdModel: Architecture built — ${totalParams.toLocaleString()} params, ${numClasses} classes`);
    }

    /**
     * Load pre-trained weights into the current architecture.
     * @param {string} url - URL to model.json
     */
    async loadWeights(url) {
        try {
            const loadedModel = await tf.loadLayersModel(url);
            // Transfer weights
            const sourceWeights = loadedModel.getWeights();
            this.model.setWeights(sourceWeights);
            console.log('VerdModel: Weights loaded successfully');
            loadedModel.dispose();
        } catch (e) {
            console.warn('VerdModel: Weight loading failed:', e.message);
        }
    }

    /**
     * Run inference on an image element.
     * @param {HTMLImageElement} imgElement - Pre-processed 224x224 image
     * @returns {Array} Top-5 predictions [{className, probability}]
     */
    async predict(imgElement) {
        if (!this.model) throw new Error('Model not initialized');

        // Preprocess
        const tensor = tf.tidy(() => {
            return tf.browser.fromPixels(imgElement)
                .resizeBilinear([224, 224])
                .toFloat()
                .div(255.0)
                .expandDims(0);
        });

        // Inference
        const t0 = performance.now();
        const predictions = this.model.predict(tensor);
        const probabilities = await predictions.data();
        const inferenceMs = Math.round(performance.now() - t0);

        // Cleanup
        tensor.dispose();
        predictions.dispose();

        // Map to class labels and sort
        const results = Array.from(probabilities)
            .map((prob, idx) => ({
                className: this.classLabels?.[String(idx)] || `Class ${idx}`,
                probability: Math.round(prob * 100),
                rawProbability: prob
            }))
            .sort((a, b) => b.probability - a.probability)
            .slice(0, 5);

        return { predictions: results, inferenceMs };
    }

    /**
     * Save model to IndexedDB for offline use.
     */
    async saveLocal() {
        if (!this.model) return;
        await this.model.save('indexeddb://verd-crop-model');
        localStorage.setItem('verd_model_labels', JSON.stringify(this.classLabels));
        console.log('VerdModel: Saved to IndexedDB');
    }

    /**
     * Load model from IndexedDB.
     */
    async loadLocal() {
        try {
            this.model = await tf.loadLayersModel('indexeddb://verd-crop-model');
            const stored = localStorage.getItem('verd_model_labels');
            if (stored) this.classLabels = JSON.parse(stored);
            this.initialized = true;
            console.log('VerdModel: Loaded from IndexedDB');
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Get model info for display.
     */
    getInfo() {
        return {
            name: 'VERD Crop Classifier',
            version: 'v1.0',
            architecture: 'MobileNetV2 + Custom Head',
            numClasses: this.classLabels ? Object.keys(this.classLabels).length : 0,
            totalParams: this.model ? this.model.countParams().toLocaleString() : 'N/A',
            inputShape: '224 x 224 x 3',
            status: this.initialized ? 'Ready' : 'Not initialized'
        };
    }

    /**
     * Dispose model to free GPU memory.
     */
    dispose() {
        if (this.model) this.model.dispose();
        if (this.baseModel) this.baseModel.dispose();
        this.initialized = false;
    }

    /**
     * Default PlantVillage-style class labels.
     */
    _getDefaultLabels() {
        return {
            '0': 'Apple: Apple scab',
            '1': 'Apple: Black rot',
            '2': 'Apple: Cedar apple rust',
            '3': 'Apple: Healthy',
            '4': 'Blueberry: Healthy',
            '5': 'Cherry: Powdery mildew',
            '6': 'Cherry: Healthy',
            '7': 'Corn: Cercospora leaf spot',
            '8': 'Corn: Common rust',
            '9': 'Corn: Northern leaf blight',
            '10': 'Corn: Healthy',
            '11': 'Grape: Black rot',
            '12': 'Grape: Esca (Black measles)',
            '13': 'Grape: Leaf blight',
            '14': 'Grape: Healthy',
            '15': 'Orange: Citrus greening',
            '16': 'Peach: Bacterial spot',
            '17': 'Peach: Healthy',
            '18': 'Pepper: Bacterial spot',
            '19': 'Pepper: Healthy',
            '20': 'Potato: Early blight',
            '21': 'Potato: Late blight',
            '22': 'Potato: Healthy',
            '23': 'Raspberry: Healthy',
            '24': 'Soybean: Healthy',
            '25': 'Squash: Powdery mildew',
            '26': 'Strawberry: Leaf scorch',
            '27': 'Strawberry: Healthy',
            '28': 'Tomato: Bacterial spot',
            '29': 'Tomato: Early blight',
            '30': 'Tomato: Late blight',
            '31': 'Tomato: Leaf mold',
            '32': 'Tomato: Septoria leaf spot',
            '33': 'Tomato: Spider mite',
            '34': 'Tomato: Target spot',
            '35': 'Tomato: Mosaic virus',
            '36': 'Tomato: Yellow leaf curl virus',
            '37': 'Tomato: Healthy'
        };
    }
};
