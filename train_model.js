/**
 * VERD — PlantVillage Model Training Pipeline
 * 
 * This script trains a CNN model on the PlantVillage dataset for plant disease detection.
 * 
 * Prerequisites:
 *   npm install
 *   Download PlantVillage dataset to ./data/plantvillage/
 *   Structure: data/plantvillage/<class_name>/*.jpg
 * 
 * Usage:
 *   node train_model.js
 * 
 * The trained model is saved to ./model/ in TensorFlow.js format
 * for deployment in the browser.
 */

const tf = require('@tensorflow/tfjs-node');
const fs = require('fs');
const path = require('path');

// ─── Configuration ──────────────────────────────
const CONFIG = {
    dataDir: path.join(__dirname, 'data', 'plantvillage'),
    modelDir: path.join(__dirname, 'model'),
    imageSize: 224,
    batchSize: 32,
    epochs: 15,
    learningRate: 0.001,
    validationSplit: 0.2,
    // PlantVillage has 38 base classes; we add 11 African crop diseases = 49 total
    numClasses: 49,
};

// ─── PlantVillage Class Labels ──────────────────
const CLASS_LABELS = [
    'Apple___Apple_scab', 'Apple___Black_rot', 'Apple___Cedar_apple_rust', 'Apple___healthy',
    'Blueberry___healthy',
    'Cherry___Powdery_mildew', 'Cherry___healthy',
    'Corn___Cercospora_leaf_spot', 'Corn___Common_rust', 'Corn___Northern_Leaf_Blight', 'Corn___healthy',
    'Grape___Black_rot', 'Grape___Esca', 'Grape___Leaf_blight', 'Grape___healthy',
    'Orange___Haunglongbing',
    'Peach___Bacterial_spot', 'Peach___healthy',
    'Pepper___Bacterial_spot', 'Pepper___healthy',
    'Potato___Early_blight', 'Potato___Late_blight', 'Potato___healthy',
    'Raspberry___healthy',
    'Soybean___healthy',
    'Squash___Powdery_mildew',
    'Strawberry___Leaf_scorch', 'Strawberry___healthy',
    'Tomato___Bacterial_spot', 'Tomato___Early_blight', 'Tomato___Late_blight',
    'Tomato___Leaf_Mold', 'Tomato___Septoria_leaf_spot', 'Tomato___Spider_mites',
    'Tomato___Target_Spot', 'Tomato___Yellow_Leaf_Curl_Virus', 'Tomato___Mosaic_virus', 'Tomato___healthy',
    // Additional African crop diseases
    'Cassava___Mosaic_Disease', 'Cassava___Brown_Streak', 'Cassava___Bacterial_Blight',
    'Cassava___Green_Mite', 'Cassava___healthy',
    'Rice___Blast', 'Rice___Brown_Spot', 'Rice___Leaf_Scald', 'Rice___healthy',
    'Maize___Fall_Armyworm',
    'General___Nitrogen_Deficiency'
];

// ─── Data Loading ───────────────────────────────
async function loadImageAsBuffer(imagePath) {
    const buffer = fs.readFileSync(imagePath);
    let tensor;
    if (imagePath.endsWith('.png')) {
        tensor = tf.node.decodePng(buffer, 3);
    } else {
        tensor = tf.node.decodeJpeg(buffer, 3);
    }
    return tensor
        .resizeBilinear([CONFIG.imageSize, CONFIG.imageSize])
        .toFloat()
        .div(255.0);
}

async function loadDataset() {
    console.log('Loading dataset from:', CONFIG.dataDir);

    if (!fs.existsSync(CONFIG.dataDir)) {
        console.error(`Dataset directory not found: ${CONFIG.dataDir}`);
        console.log('\nTo download the PlantVillage dataset:');
        console.log('  1. Visit: https://www.kaggle.com/datasets/emmarex/plantdisease');
        console.log('  2. Download and extract to: data/plantvillage/');
        console.log('  3. Ensure folder structure: data/plantvillage/<class_name>/*.jpg');
        console.log('\nAlternatively, download from:');
        console.log('  https://github.com/spMohanty/PlantVillage-Dataset');
        process.exit(1);
    }

    const classDirs = fs.readdirSync(CONFIG.dataDir)
        .filter(d => fs.statSync(path.join(CONFIG.dataDir, d)).isDirectory());

    console.log(`Found ${classDirs.length} class directories`);

    const images = [];
    const labels = [];

    for (const classDir of classDirs) {
        const classIndex = CLASS_LABELS.indexOf(classDir);
        if (classIndex === -1) {
            console.warn(`  Skipping unknown class: ${classDir}`);
            continue;
        }

        const classPath = path.join(CONFIG.dataDir, classDir);
        const files = fs.readdirSync(classPath)
            .filter(f => /\.(jpg|jpeg|png)$/i.test(f));

        console.log(`  Class ${classIndex}: ${classDir} — ${files.length} images`);

        for (const file of files) {
            images.push(path.join(classPath, file));
            labels.push(classIndex);
        }
    }

    console.log(`Total: ${images.length} images across ${new Set(labels).size} classes`);

    // Shuffle
    const indices = Array.from({ length: images.length }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    const shuffledImages = indices.map(i => images[i]);
    const shuffledLabels = indices.map(i => labels[i]);

    // Split
    const splitIdx = Math.floor(shuffledImages.length * (1 - CONFIG.validationSplit));
    return {
        train: { images: shuffledImages.slice(0, splitIdx), labels: shuffledLabels.slice(0, splitIdx) },
        val: { images: shuffledImages.slice(splitIdx), labels: shuffledLabels.slice(splitIdx) }
    };
}

// ─── Model Architecture ─────────────────────────
function buildModel() {
    console.log('\nBuilding model architecture...');

    const model = tf.sequential();

    // Block 1
    model.add(tf.layers.conv2d({ inputShape: [CONFIG.imageSize, CONFIG.imageSize, 3], filters: 32, kernelSize: 3, activation: 'relu', padding: 'same' }));
    model.add(tf.layers.batchNormalization());
    model.add(tf.layers.conv2d({ filters: 32, kernelSize: 3, activation: 'relu', padding: 'same' }));
    model.add(tf.layers.maxPooling2d({ poolSize: 2 }));
    model.add(tf.layers.dropout({ rate: 0.25 }));

    // Block 2
    model.add(tf.layers.conv2d({ filters: 64, kernelSize: 3, activation: 'relu', padding: 'same' }));
    model.add(tf.layers.batchNormalization());
    model.add(tf.layers.conv2d({ filters: 64, kernelSize: 3, activation: 'relu', padding: 'same' }));
    model.add(tf.layers.maxPooling2d({ poolSize: 2 }));
    model.add(tf.layers.dropout({ rate: 0.25 }));

    // Block 3
    model.add(tf.layers.conv2d({ filters: 128, kernelSize: 3, activation: 'relu', padding: 'same' }));
    model.add(tf.layers.batchNormalization());
    model.add(tf.layers.conv2d({ filters: 128, kernelSize: 3, activation: 'relu', padding: 'same' }));
    model.add(tf.layers.maxPooling2d({ poolSize: 2 }));
    model.add(tf.layers.dropout({ rate: 0.25 }));

    // Block 4
    model.add(tf.layers.conv2d({ filters: 256, kernelSize: 3, activation: 'relu', padding: 'same' }));
    model.add(tf.layers.batchNormalization());
    model.add(tf.layers.maxPooling2d({ poolSize: 2 }));
    model.add(tf.layers.dropout({ rate: 0.25 }));

    // Classifier head
    model.add(tf.layers.flatten());
    model.add(tf.layers.dense({ units: 512, activation: 'relu' }));
    model.add(tf.layers.batchNormalization());
    model.add(tf.layers.dropout({ rate: 0.5 }));
    model.add(tf.layers.dense({ units: 256, activation: 'relu' }));
    model.add(tf.layers.dropout({ rate: 0.3 }));
    model.add(tf.layers.dense({ units: CONFIG.numClasses, activation: 'softmax' }));

    model.compile({
        optimizer: tf.train.adam(CONFIG.learningRate),
        loss: 'sparseCategoricalCrossentropy',
        metrics: ['accuracy']
    });

    model.summary();
    return model;
}

// ─── Training ───────────────────────────────────
async function* batchGenerator(data) {
    for (let i = 0; i < data.images.length; i += CONFIG.batchSize) {
        const batchImages = data.images.slice(i, i + CONFIG.batchSize);
        const batchLabels = data.labels.slice(i, i + CONFIG.batchSize);

        const tensors = await Promise.all(batchImages.map(img => loadImageAsBuffer(img)));
        const xs = tf.stack(tensors);
        const ys = tf.tensor1d(batchLabels, 'int32');

        yield { xs, ys };

        // Cleanup
        tensors.forEach(t => t.dispose());
    }
}

async function train() {
    console.log('═══════════════════════════════════════════');
    console.log('  VERD — PlantVillage Model Training');
    console.log('═══════════════════════════════════════════\n');

    const data = await loadDataset();
    const model = buildModel();

    const totalBatches = Math.ceil(data.train.images.length / CONFIG.batchSize);
    console.log(`\nTraining: ${data.train.images.length} images, ${totalBatches} batches/epoch`);
    console.log(`Validation: ${data.val.images.length} images`);
    console.log(`Epochs: ${CONFIG.epochs}, Batch size: ${CONFIG.batchSize}\n`);

    let bestValAcc = 0;

    for (let epoch = 0; epoch < CONFIG.epochs; epoch++) {
        console.log(`\n─── Epoch ${epoch + 1}/${CONFIG.epochs} ───`);
        let batchNum = 0;
        let epochLoss = 0;
        let epochAcc = 0;

        for await (const batch of batchGenerator(data.train)) {
            const result = await model.trainOnBatch(batch.xs, batch.ys);
            epochLoss += result[0];
            epochAcc += result[1];
            batchNum++;

            if (batchNum % 10 === 0) {
                process.stdout.write(`  Batch ${batchNum}/${totalBatches} — loss: ${(epochLoss / batchNum).toFixed(4)}, acc: ${(epochAcc / batchNum * 100).toFixed(1)}%\r`);
            }

            batch.xs.dispose();
            batch.ys.dispose();
        }

        const avgLoss = epochLoss / batchNum;
        const avgAcc = epochAcc / batchNum;

        // Validation
        let valAcc = 0;
        let valBatches = 0;
        for await (const batch of batchGenerator(data.val)) {
            const result = await model.evaluate(batch.xs, batch.ys, { batchSize: CONFIG.batchSize });
            valAcc += result[1].dataSync()[0];
            valBatches++;
            batch.xs.dispose();
            batch.ys.dispose();
            result.forEach(t => t.dispose());
        }
        valAcc = valAcc / valBatches;

        console.log(`  Epoch ${epoch + 1}: loss=${avgLoss.toFixed(4)}, acc=${(avgAcc * 100).toFixed(1)}%, val_acc=${(valAcc * 100).toFixed(1)}%`);

        // Save best model
        if (valAcc > bestValAcc) {
            bestValAcc = valAcc;
            if (!fs.existsSync(CONFIG.modelDir)) {
                fs.mkdirSync(CONFIG.modelDir, { recursive: true });
            }
            await model.save(`file://${CONFIG.modelDir}`);
            console.log(`  ✓ Best model saved (val_acc: ${(valAcc * 100).toFixed(1)}%)`);
        }
    }

    console.log(`\n═══════════════════════════════════════════`);
    console.log(`  Training complete!`);
    console.log(`  Best validation accuracy: ${(bestValAcc * 100).toFixed(1)}%`);
    console.log(`  Model saved to: ${CONFIG.modelDir}/model.json`);
    console.log(`═══════════════════════════════════════════\n`);

    // Log model metadata
    const metadata = {
        version: '1.0.0',
        dataset: 'PlantVillage + African Crops',
        numClasses: CONFIG.numClasses,
        imageSize: CONFIG.imageSize,
        bestValAccuracy: bestValAcc,
        epochs: CONFIG.epochs,
        classLabels: CLASS_LABELS,
        trainedAt: new Date().toISOString()
    };

    fs.writeFileSync(
        path.join(CONFIG.modelDir, 'metadata.json'),
        JSON.stringify(metadata, null, 2)
    );
    console.log('Model metadata saved to: model/metadata.json');
}

train().catch(err => {
    console.error('Training failed:', err);
    process.exit(1);
});
