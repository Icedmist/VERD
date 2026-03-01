// ═══════════════════════════════════════════
//  VERD Browser-Based Transfer Learning Engine
// ═══════════════════════════════════════════
//  Enables in-browser model training using MobileNet as
//  a feature extractor and a lightweight trainable classifier.
// ═══════════════════════════════════════════

window.BrowserTrainer = class BrowserTrainer {
    constructor() {
        this.featureExtractor = null;
        this.classifier = null;
        this.classes = [];           // Array of { name, samples: [imgElement] }
        this.featureCache = new Map(); // Cached feature vectors
        this.trained = false;
        this.training = false;
        this.onProgress = null;      // Callback: (epoch, logs) => {}
    }

    /**
     * Load MobileNet as feature extractor.
     */
    async loadFeatureExtractor() {
        if (this.featureExtractor) return;
        this._report('Loading MobileNet feature extractor...');

        const mobilenetModel = await tf.loadLayersModel(
            'https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v2_1.0_224/model.json'
        );

        // Get output from the last convolutional layer
        const layer = mobilenetModel.getLayer('out_relu');
        this.featureExtractor = tf.model({
            inputs: mobilenetModel.input,
            outputs: layer.output,
        });

        this._report('Feature extractor ready');
    }

    /**
     * Add a class to the training set.
     */
    addClass(name) {
        if (this.classes.find(c => c.name === name)) {
            throw new Error(`Class "${name}" already exists`);
        }
        this.classes.push({ name, samples: [], features: [] });
        return this.classes.length - 1;
    }

    /**
     * Remove a class by index.
     */
    removeClass(index) {
        this.classes.splice(index, 1);
        this.trained = false;
    }

    /**
     * Add sample images to a class.
     * @param {number} classIndex 
     * @param {HTMLImageElement[]} images - Array of image elements (224x224)
     */
    async addSamples(classIndex, images) {
        if (!this.featureExtractor) await this.loadFeatureExtractor();

        const cls = this.classes[classIndex];
        if (!cls) throw new Error('Invalid class index');

        for (const img of images) {
            cls.samples.push(img);

            // Extract and cache features
            const features = tf.tidy(() => {
                const tensor = tf.browser.fromPixels(img)
                    .resizeBilinear([224, 224])
                    .toFloat()
                    .div(255.0)
                    .expandDims(0);
                const feat = this.featureExtractor.predict(tensor);
                return tf.layers.globalAveragePooling2d().apply(feat).squeeze();
            });
            cls.features.push(features);
        }

        this.trained = false;
        this._report(`Added ${images.length} samples to "${cls.name}" (total: ${cls.samples.length})`);
    }

    /**
     * Build and train the classifier.
     */
    async train(config = {}) {
        const {
            epochs = 50,
            batchSize = 16,
            learningRate = 0.001,
            validationSplit = 0.15,
        } = config;

        if (this.classes.length < 2) {
            throw new Error('Need at least 2 classes to train');
        }

        const totalSamples = this.classes.reduce((sum, c) => sum + c.features.length, 0);
        if (totalSamples < 10) {
            throw new Error('Need at least 10 total samples to train');
        }

        this.training = true;
        this._report('Building classifier...');

        // Prepare training data
        const numClasses = this.classes.length;
        const featureArrays = [];
        const labelArrays = [];

        for (let i = 0; i < this.classes.length; i++) {
            for (const feat of this.classes[i].features) {
                featureArrays.push(feat);
                const oneHot = new Float32Array(numClasses);
                oneHot[i] = 1.0;
                labelArrays.push(oneHot);
            }
        }

        // Shuffle
        const indices = Array.from({ length: featureArrays.length }, (_, i) => i);
        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
        }

        const xData = tf.stack(indices.map(i => featureArrays[i]));
        const yData = tf.tensor2d(indices.map(i => labelArrays[i]));

        // Build classifier
        this.classifier = tf.sequential({
            layers: [
                tf.layers.dense({
                    inputShape: [xData.shape[1]],
                    units: 128,
                    activation: 'relu',
                    kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
                }),
                tf.layers.dropout({ rate: 0.3 }),
                tf.layers.dense({ units: numClasses, activation: 'softmax' })
            ]
        });

        this.classifier.compile({
            optimizer: tf.train.adam(learningRate),
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy']
        });

        this._report(`Training on ${totalSamples} samples across ${numClasses} classes...`);

        // Train
        const history = await this.classifier.fit(xData, yData, {
            epochs,
            batchSize,
            validationSplit,
            shuffle: true,
            callbacks: {
                onEpochEnd: (epoch, logs) => {
                    if (this.onProgress) {
                        this.onProgress(epoch + 1, epochs, logs);
                    }
                }
            }
        });

        // Cleanup training tensors
        xData.dispose();
        yData.dispose();

        this.trained = true;
        this.training = false;

        const finalAcc = history.history.acc
            ? history.history.acc[history.history.acc.length - 1]
            : history.history.accuracy[history.history.accuracy.length - 1];

        this._report(`Training complete — accuracy: ${(finalAcc * 100).toFixed(1)}%`);

        return {
            accuracy: finalAcc,
            epochs: history.epoch.length,
            history: history.history
        };
    }

    /**
     * Predict on a new image.
     */
    async predict(imgElement) {
        if (!this.trained || !this.classifier || !this.featureExtractor) {
            throw new Error('Model not trained');
        }

        const t0 = performance.now();

        // Extract features
        const features = tf.tidy(() => {
            const tensor = tf.browser.fromPixels(imgElement)
                .resizeBilinear([224, 224])
                .toFloat()
                .div(255.0)
                .expandDims(0);
            const feat = this.featureExtractor.predict(tensor);
            return tf.layers.globalAveragePooling2d().apply(feat);
        });

        // Classify
        const prediction = this.classifier.predict(features);
        const probabilities = await prediction.data();
        const inferenceMs = Math.round(performance.now() - t0);

        features.dispose();
        prediction.dispose();

        // Map to class names
        const results = Array.from(probabilities)
            .map((prob, idx) => ({
                className: this.classes[idx]?.name || `Class ${idx}`,
                probability: Math.round(prob * 100)
            }))
            .sort((a, b) => b.probability - a.probability);

        return { predictions: results, inferenceMs };
    }

    /**
     * Save trained model + class info to IndexedDB.
     */
    async save() {
        if (!this.classifier) return;
        await this.classifier.save('indexeddb://verd-browser-model');
        localStorage.setItem('verd_browser_classes', JSON.stringify(
            this.classes.map(c => ({ name: c.name, sampleCount: c.samples.length }))
        ));
        this._report('Model saved locally');
    }

    /**
     * Load trained model from IndexedDB.
     */
    async load() {
        try {
            this.classifier = await tf.loadLayersModel('indexeddb://verd-browser-model');
            const stored = localStorage.getItem('verd_browser_classes');
            if (stored) {
                const classInfo = JSON.parse(stored);
                this.classes = classInfo.map(c => ({ name: c.name, samples: [], features: [], sampleCount: c.sampleCount }));
            }
            this.trained = true;
            await this.loadFeatureExtractor();
            this._report('Loaded browser-trained model');
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Get training summary.
     */
    getSummary() {
        return {
            numClasses: this.classes.length,
            classes: this.classes.map(c => ({ name: c.name, samples: c.samples.length })),
            totalSamples: this.classes.reduce((sum, c) => sum + c.samples.length, 0),
            trained: this.trained,
            modelParams: this.classifier ? this.classifier.countParams() : 0
        };
    }

    /**
     * Delete saved model.
     */
    async deleteSaved() {
        try {
            await tf.io.removeModel('indexeddb://verd-browser-model');
            localStorage.removeItem('verd_browser_classes');
        } catch (e) { /* ignore */ }
    }

    /**
     * Dispose all tensors.
     */
    dispose() {
        this.classes.forEach(c => c.features.forEach(f => f.dispose()));
        if (this.classifier) this.classifier.dispose();
        if (this.featureExtractor) this.featureExtractor.dispose();
    }

    _report(msg) {
        console.log(`BrowserTrainer: ${msg}`);
    }
};
