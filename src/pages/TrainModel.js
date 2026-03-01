// ═══════════════════════════════════════════
//  Train Model Page — In-Browser Transfer Learning
// ═══════════════════════════════════════════

window.TrainModelPage = {
    _trainer: null,

    render() {
        return `
      <div class="space-y-6 stagger">
        <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">Train Model</h1>
            <p class="text-surface-500 mt-1 text-sm">Teach VERD to recognise your crops with in-browser transfer learning</p>
          </div>
          <div class="flex gap-3">
            <button id="load-saved-btn" class="btn btn-secondary text-sm">${Icons.download} Load Saved</button>
            <button id="clear-all-btn" class="btn btn-secondary text-sm">${Icons.x} Clear All</button>
          </div>
        </div>

        <!-- How it works -->
        <div class="glass rounded-2xl p-5">
          <h3 class="text-sm font-semibold text-surface-400 uppercase tracking-wider flex items-center gap-2 mb-3">
            <span class="text-verd-500">${Icons.info}</span> How It Works
          </h3>
          <div class="grid sm:grid-cols-3 gap-3">
            <div class="p-3 rounded-xl bg-surface-900/30 text-center">
              <div class="text-verd-500 flex justify-center mb-2">${Icons.sized(Icons.folderOpen, 24)}</div>
              <p class="text-sm font-semibold text-surface-200">1. Add Classes</p>
              <p class="text-xs text-surface-600 mt-1">Create categories like "Healthy Maize" or "Blight"</p>
            </div>
            <div class="p-3 rounded-xl bg-surface-900/30 text-center">
              <div class="text-verd-500 flex justify-center mb-2">${Icons.sized(Icons.upload, 24)}</div>
              <p class="text-sm font-semibold text-surface-200">2. Upload Samples</p>
              <p class="text-xs text-surface-600 mt-1">Add 10-20 images per class for best results</p>
            </div>
            <div class="p-3 rounded-xl bg-surface-900/30 text-center">
              <div class="text-verd-500 flex justify-center mb-2">${Icons.sized(Icons.brain, 24)}</div>
              <p class="text-sm font-semibold text-surface-200">3. Train</p>
              <p class="text-xs text-surface-600 mt-1">Model trains locally in seconds — your data stays private</p>
            </div>
          </div>
        </div>

        <!-- Classes -->
        <div class="glass rounded-2xl p-5 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold text-surface-400 uppercase tracking-wider flex items-center gap-2">
              <span class="text-verd-500">${Icons.leaf}</span> Training Classes
            </h3>
            <button id="add-class-btn" class="btn btn-primary text-sm py-2">${Icons.sized(Icons.sprout, 14)} Add Class</button>
          </div>

          <div id="classes-container" class="space-y-3">
            <p class="text-center text-surface-600 py-6 text-sm">No classes added yet. Click "Add Class" to start.</p>
          </div>
        </div>

        <!-- Training -->
        <div class="glass rounded-2xl p-5 space-y-4">
          <h3 class="text-sm font-semibold text-surface-400 uppercase tracking-wider flex items-center gap-2">
            <span class="text-verd-500">${Icons.activity}</span> Training
          </h3>

          <div class="grid sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-xs text-surface-600 mb-1">Epochs</label>
              <input id="train-epochs" type="number" value="50" min="10" max="200" class="w-full px-3 py-2 rounded-lg text-sm" />
            </div>
            <div>
              <label class="block text-xs text-surface-600 mb-1">Batch Size</label>
              <input id="train-batch" type="number" value="16" min="4" max="64" class="w-full px-3 py-2 rounded-lg text-sm" />
            </div>
            <div>
              <label class="block text-xs text-surface-600 mb-1">Learning Rate</label>
              <input id="train-lr" type="number" value="0.001" step="0.0001" min="0.0001" max="0.01" class="w-full px-3 py-2 rounded-lg text-sm" />
            </div>
          </div>

          <button id="train-btn" disabled class="btn btn-primary w-full py-3 text-base disabled:opacity-30 disabled:cursor-not-allowed">
            ${Icons.brain} Start Training
          </button>

          <div id="training-progress" class="hidden space-y-3">
            <div class="flex items-center justify-between text-sm">
              <span class="text-surface-400" id="train-status">Preparing...</span>
              <span class="text-surface-500 font-mono" id="train-epoch">0/0</span>
            </div>
            <div class="w-full bg-surface-800 rounded-full h-2">
              <div id="train-progress-bar" class="bg-verd-500 h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="p-3 rounded-xl bg-surface-900/30 text-center">
                <p class="text-xs text-surface-600">Accuracy</p>
                <p class="text-lg font-bold text-verd-400 font-mono" id="train-accuracy">--</p>
              </div>
              <div class="p-3 rounded-xl bg-surface-900/30 text-center">
                <p class="text-xs text-surface-600">Loss</p>
                <p class="text-lg font-bold text-surface-300 font-mono" id="train-loss">--</p>
              </div>
            </div>
          </div>

          <div id="training-result" class="hidden p-4 rounded-xl bg-verd-950/30 border border-verd-900/20 space-y-3">
            <div class="flex items-center gap-2 text-verd-400 font-semibold">
              ${Icons.checkCircle} Training Complete
            </div>
            <p class="text-sm text-surface-400" id="result-summary"></p>
            <div class="flex gap-3">
              <button id="save-model-btn" class="btn btn-primary text-sm py-2">${Icons.download} Save Model</button>
              <a href="#/scan" class="btn btn-secondary text-sm py-2">${Icons.scan} Test Scan</a>
            </div>
          </div>
        </div>

        <!-- ML Info -->
        <div class="glass rounded-2xl p-4 flex items-start gap-3">
          <div class="w-8 h-8 rounded-lg bg-surface-800 flex items-center justify-center text-verd-500 flex-shrink-0">${Icons.sized(Icons.shieldCheck, 16)}</div>
          <div>
            <p class="text-xs font-semibold text-surface-300">Privacy First</p>
            <p class="text-xs text-surface-600 mt-0.5">All training runs locally in your browser using TensorFlow.js. No images or data leave your device.</p>
          </div>
        </div>
      </div>
    `;
    },

    bindEvents() {
        LayoutComponent.setTitle('Train Model', 'In-browser transfer learning');

        this._trainer = new BrowserTrainer();

        // Add class
        document.getElementById('add-class-btn')?.addEventListener('click', () => {
            const name = prompt('Enter class name (e.g., "Healthy Maize", "Maize Blight"):');
            if (!name || !name.trim()) return;
            try {
                this._trainer.addClass(name.trim());
                this._renderClasses();
                this._updateTrainButton();
                DOM.toast(`Class "${name.trim()}" added`, 'success');
            } catch (e) {
                DOM.toast(e.message, 'error');
            }
        });

        // Load saved model
        document.getElementById('load-saved-btn')?.addEventListener('click', async () => {
            const loaded = await this._trainer.load();
            if (loaded) {
                DOM.toast('Saved model loaded', 'success');
                this._renderClasses();
                document.getElementById('training-result').classList.remove('hidden');
                document.getElementById('result-summary').textContent =
                    `Loaded model with ${this._trainer.classes.length} classes. Ready for scanning.`;
            } else {
                DOM.toast('No saved model found', 'warning');
            }
        });

        // Clear all
        document.getElementById('clear-all-btn')?.addEventListener('click', async () => {
            if (!confirm('Clear all classes and training data?')) return;
            this._trainer.dispose();
            this._trainer = new BrowserTrainer();
            await this._trainer.deleteSaved();
            this._renderClasses();
            this._updateTrainButton();
            document.getElementById('training-result').classList.add('hidden');
            document.getElementById('training-progress').classList.add('hidden');
            DOM.toast('All data cleared', 'info');
        });

        // Train button
        document.getElementById('train-btn')?.addEventListener('click', async () => {
            const progressEl = document.getElementById('training-progress');
            const resultEl = document.getElementById('training-result');
            const trainBtn = document.getElementById('train-btn');

            progressEl.classList.remove('hidden');
            resultEl.classList.add('hidden');
            trainBtn.disabled = true;
            trainBtn.innerHTML = '<span class="inline-block spin">' + Icons.sized(Icons.refresh, 18) + '</span> Training...';

            const epochs = parseInt(document.getElementById('train-epochs').value) || 50;
            const batchSize = parseInt(document.getElementById('train-batch').value) || 16;
            const learningRate = parseFloat(document.getElementById('train-lr').value) || 0.001;

            this._trainer.onProgress = (epoch, totalEpochs, logs) => {
                const acc = logs.acc || logs.accuracy || 0;
                document.getElementById('train-epoch').textContent = `${epoch}/${totalEpochs}`;
                document.getElementById('train-progress-bar').style.width = `${(epoch / totalEpochs) * 100}%`;
                document.getElementById('train-accuracy').textContent = `${(acc * 100).toFixed(1)}%`;
                document.getElementById('train-loss').textContent = logs.loss.toFixed(4);
                document.getElementById('train-status').textContent = `Epoch ${epoch} of ${totalEpochs}`;
            };

            try {
                const result = await this._trainer.train({ epochs, batchSize, learningRate });
                resultEl.classList.remove('hidden');
                document.getElementById('result-summary').textContent =
                    `Trained ${this._trainer.classes.length} classes over ${result.epochs} epochs. Final accuracy: ${(result.accuracy * 100).toFixed(1)}%.`;
                DOM.toast('Model training complete', 'success');
            } catch (e) {
                DOM.toast('Training failed: ' + e.message, 'error');
            }

            trainBtn.disabled = false;
            trainBtn.innerHTML = Icons.brain + ' Start Training';
            this._updateTrainButton();
        });

        // Save model
        document.getElementById('save-model-btn')?.addEventListener('click', async () => {
            await this._trainer.save();
            DOM.toast('Model saved to device', 'success');
        });
    },

    _renderClasses() {
        const container = document.getElementById('classes-container');
        if (!container) return;

        if (this._trainer.classes.length === 0) {
            container.innerHTML = '<p class="text-center text-surface-600 py-6 text-sm">No classes added yet. Click "Add Class" to start.</p>';
            return;
        }

        container.innerHTML = this._trainer.classes.map((cls, idx) => {
            const sampleCount = cls.samples?.length || cls.sampleCount || 0;
            const isReady = sampleCount >= 5;
            return `
        <div class="flex items-center gap-4 p-4 rounded-xl bg-surface-900/30 border border-surface-800/50">
          <div class="w-10 h-10 rounded-xl ${isReady ? 'bg-verd-950/50 text-verd-400' : 'bg-surface-800 text-surface-500'} flex items-center justify-center font-bold text-sm">${idx + 1}</div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-surface-200">${cls.name}</p>
            <p class="text-xs text-surface-600">${sampleCount} samples ${sampleCount < 5 ? '(need at least 5)' : ''}</p>
          </div>
          <div class="flex gap-2">
            <label class="btn btn-secondary text-xs py-1.5 px-3 cursor-pointer">
              ${Icons.sized(Icons.upload, 12)} Add Images
              <input type="file" accept="image/*" multiple class="hidden" data-class-idx="${idx}" />
            </label>
            <button class="text-surface-600 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-950/20" data-remove-idx="${idx}">
              ${Icons.sized(Icons.x, 14)}
            </button>
          </div>
        </div>
      `;
        }).join('');

        // Bind file upload handlers
        container.querySelectorAll('input[type="file"]').forEach(input => {
            input.addEventListener('change', async (e) => {
                const classIdx = parseInt(e.target.dataset.classIdx);
                const files = Array.from(e.target.files);
                if (!files.length) return;

                DOM.toast(`Processing ${files.length} images...`, 'info');

                const images = [];
                for (const file of files) {
                    try {
                        const img = await this._fileToImage(file);
                        images.push(img);
                    } catch (err) {
                        console.warn('Failed to process image:', err);
                    }
                }

                if (images.length > 0) {
                    await this._trainer.addSamples(classIdx, images);
                    this._renderClasses();
                    this._updateTrainButton();
                    DOM.toast(`Added ${images.length} samples`, 'success');
                }
            });
        });

        // Bind remove handlers
        container.querySelectorAll('[data-remove-idx]').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.removeIdx);
                const name = this._trainer.classes[idx]?.name;
                if (confirm(`Remove class "${name}"?`)) {
                    this._trainer.removeClass(idx);
                    this._renderClasses();
                    this._updateTrainButton();
                }
            });
        });
    },

    _updateTrainButton() {
        const btn = document.getElementById('train-btn');
        if (!btn) return;
        const summary = this._trainer.getSummary();
        btn.disabled = summary.numClasses < 2 || summary.totalSamples < 10;
    },

    _fileToImage(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(file);
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = 224;
                canvas.height = 224;
                canvas.getContext('2d').drawImage(img, 0, 0, 224, 224);
                URL.revokeObjectURL(url);
                const resized = new Image();
                resized.onload = () => resolve(resized);
                resized.onerror = reject;
                resized.src = canvas.toDataURL();
            };
            img.onerror = reject;
            img.src = url;
        });
    },

    afterRender() {
        this.bindEvents();
    }
};
