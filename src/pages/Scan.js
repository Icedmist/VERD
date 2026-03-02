// ═══════════════════════════════════════════
//  Scan Module Page — Premium
// ═══════════════════════════════════════════

window.ScanPage = {
  _neuralAnim: null,

  render() {
    const voiceOn = typeof VoiceScanner !== 'undefined' && VoiceScanner.isEnabled();
    return `
      <div class="space-y-6 stagger">
        <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">Scan Crop</h1>
            <p class="text-surface-500 mt-1 text-sm">ML-powered crop diagnostics with neural network inference</p>
          </div>
          <button id="voice-toggle" class="btn ${voiceOn ? 'btn-primary' : 'btn-secondary'} text-sm py-2">
            ${Icons.sized(Icons.activity, 14)}
            <span id="voice-label">${voiceOn ? 'Voice On' : 'Voice Off'}</span>
          </button>
        </div>

        <div class="grid lg:grid-cols-2 gap-6">
          <!-- Left Column: Upload + Actions -->
          <div class="space-y-4">
            <div id="upload-area" class="scan-upload-area glass rounded-2xl p-8 border border-dashed border-surface-700 hover:border-verd-500/30 text-center cursor-pointer group relative overflow-hidden" style="min-height: 300px;">
              <input type="file" id="scan-file-input" accept="image/*" capture="environment" class="hidden" />

              <!-- Idle state -->
              <div class="flex flex-col items-center justify-center h-full py-6 relative z-10" id="upload-placeholder">
                <div class="scan-upload-icon w-20 h-20 rounded-2xl bg-surface-800/80 flex items-center justify-center mb-5 text-surface-500 group-hover:text-verd-400 group-hover:bg-verd-950/30 group-hover:shadow-lg group-hover:shadow-verd-500/10">
                  ${Icons.sized(Icons.upload, 32)}
                </div>
                <p class="text-lg font-bold text-surface-200 mb-1">Upload Crop Image</p>
                <p class="text-sm text-surface-600 mb-6">Drag and drop, take a photo, or browse files</p>
                <div class="flex flex-col sm:flex-row gap-3">
                  <button id="camera-btn" class="btn btn-primary text-sm py-2.5 px-5 shadow-lg shadow-verd-900/20">
                    ${Icons.camera} Camera
                  </button>
                  <button id="upload-btn" class="btn btn-secondary text-sm py-2.5 px-5">
                    ${Icons.folderOpen} Browse
                  </button>
                </div>
                <p class="text-xs text-surface-700 mt-5">JPG, PNG, WebP &middot; Max 10 MB</p>
              </div>

              <!-- Preview state -->
              <div id="image-preview" class="hidden relative">
                <div class="relative inline-block rounded-xl overflow-hidden shadow-2xl shadow-black/40">
                  <img id="preview-img" class="max-h-60 rounded-xl" alt="Crop preview" />
                  <div class="scan-sweep"></div>
                  <button id="clear-image-btn" class="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/70 backdrop-blur-sm text-white hover:bg-red-600 flex items-center justify-center shadow-lg">${Icons.sized(Icons.x, 14)}</button>
                </div>
                <p id="file-name" class="text-sm text-surface-500 mt-3 font-mono"></p>
              </div>

              <!-- Drag highlight overlay -->
              <div id="drag-overlay" class="hidden absolute inset-0 bg-verd-500/5 border-2 border-dashed border-verd-500/30 rounded-2xl flex items-center justify-center z-20">
                <div class="text-verd-400 text-center">
                  ${Icons.sized(Icons.download, 32)}
                  <p class="text-sm font-semibold mt-2">Drop to analyze</p>
                </div>
              </div>
            </div>

            <button id="analyze-btn" disabled
              class="btn btn-primary w-full py-3.5 text-base font-bold disabled:opacity-20 disabled:cursor-not-allowed shadow-xl shadow-verd-900/30 relative overflow-hidden group">
              <span class="relative z-10 flex items-center justify-center gap-2">
                ${Icons.brain} Analyze with AI
              </span>
              <div class="absolute inset-0 bg-gradient-to-r from-verd-600 to-verd-500 opacity-0 group-hover:opacity-100" style="transition: opacity 0.3s;"></div>
            </button>

            <!-- ML Model Info Card -->
            <div class="glass-elevated rounded-2xl p-4 flex items-start gap-3">
              <div class="w-9 h-9 rounded-xl bg-verd-950/30 flex items-center justify-center text-verd-500 flex-shrink-0">${Icons.sized(Icons.brain, 16)}</div>
              <div>
                <p class="text-xs font-bold text-surface-300">ML Engine: TensorFlow.js + MobileNet v2</p>
                <p class="text-xs text-surface-600 mt-0.5">Neural network inference runs locally in your browser. No data leaves your device.</p>
              </div>
              <div class="ml-auto flex-shrink-0">
                <div class="w-2 h-2 rounded-full bg-verd-500 pulse-ring"></div>
              </div>
            </div>
          </div>

          <!-- Right Column: Tips / Neural Net Processing -->
          <div id="analysis-panel" class="space-y-4">
            <!-- Scanning Tips -->
            <div class="glass rounded-2xl p-6 space-y-3" id="scan-instructions">
              <h3 class="text-sm font-semibold text-surface-400 uppercase tracking-wider flex items-center gap-2">
                <span class="text-verd-500">${Icons.info}</span> Scanning Tips
              </h3>
              <div class="space-y-2">
                ${[
        { icon: Icons.sun, title: 'Good Lighting', desc: 'Natural daylight gives optimal results' },
        { icon: Icons.target, title: 'Focus on Symptoms', desc: 'Close-ups of diseased or damaged tissue' },
        { icon: Icons.scan, title: 'Clear Angle', desc: 'Shoot from directly above at 45 degrees' },
        { icon: Icons.leaf, title: 'Include Healthy Parts', desc: 'Show contrast between healthy and affected tissue' },
        { icon: Icons.activity, title: 'Multiple Samples', desc: 'Scan several leaves for higher accuracy' }
      ].map(tip => `
                  <div class="flex items-start gap-3 p-3 rounded-xl bg-surface-900/30 hover:bg-surface-900/50 scan-tip-card">
                    <div class="w-8 h-8 rounded-lg bg-surface-800 flex items-center justify-center text-surface-500 flex-shrink-0">${Icons.sized(tip.icon, 14)}</div>
                    <div>
                      <p class="text-sm font-semibold text-surface-300">${tip.title}</p>
                      <p class="text-xs text-surface-600">${tip.desc}</p>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Neural Network Processing Viz -->
            <div id="scan-processing" class="hidden space-y-4">
              <!-- Neural Net Canvas -->
              <div class="glass rounded-2xl p-4 relative overflow-hidden">
                <div class="flex items-center justify-between mb-3">
                  <h3 class="text-xs font-bold text-surface-400 uppercase tracking-wider flex items-center gap-2">
                    <span class="text-verd-500">${Icons.sized(Icons.brain, 12)}</span> Neural Network
                  </h3>
                  <span class="text-xs font-mono text-verd-500" id="nn-layer-label">Input Layer</span>
                </div>
                <canvas id="neural-canvas" class="w-full rounded-xl" style="height: 180px; background: rgba(0,0,0,0.3);"></canvas>
              </div>

              <!-- Status Card -->
              <div class="glass rounded-2xl p-6 text-center space-y-4">
                <div class="relative w-20 h-20 mx-auto">
                  <div class="absolute inset-0 rounded-full border-2 border-surface-800"></div>
                  <div class="absolute inset-0 rounded-full border-2 border-verd-500 border-t-transparent spin"></div>
                  <div class="absolute inset-0 flex items-center justify-center">
                    <span class="text-3xl font-black text-verd-400 font-mono" id="process-percent-big">0</span>
                  </div>
                </div>
                <div>
                  <p class="text-sm font-bold text-white" id="process-stage">Initializing ML engine...</p>
                  <p class="text-xs text-surface-600 mt-1">Running inference locally</p>
                </div>
                <div class="w-full bg-surface-800 rounded-full h-1.5">
                  <div id="process-bar" class="bg-gradient-to-r from-verd-600 to-verd-400 h-1.5 rounded-full" style="width: 0%; transition: width 0.5s ease;"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  bindEvents() {
    LayoutComponent.setTitle('Scan', 'ML-powered crop diagnosis');

    const fileInput = document.getElementById('scan-file-input');
    const uploadArea = document.getElementById('upload-area');
    const cameraBtn = document.getElementById('camera-btn');
    const uploadBtn = document.getElementById('upload-btn');
    const previewContainer = document.getElementById('image-preview');
    const placeholder = document.getElementById('upload-placeholder');
    const previewImg = document.getElementById('preview-img');
    const fileNameEl = document.getElementById('file-name');
    const clearBtn = document.getElementById('clear-image-btn');
    const analyzeBtn = document.getElementById('analyze-btn');
    const dragOverlay = document.getElementById('drag-overlay');

    let selectedFile = null;

    // Voice toggle
    document.getElementById('voice-toggle')?.addEventListener('click', () => {
      if (typeof VoiceScanner === 'undefined') return;
      const on = VoiceScanner.toggle();
      const btn = document.getElementById('voice-toggle');
      const label = document.getElementById('voice-label');
      if (btn) { btn.className = `btn ${on ? 'btn-primary' : 'btn-secondary'} text-sm py-2`; }
      if (label) { label.textContent = on ? 'Voice On' : 'Voice Off'; }
    });

    const handleFile = (file) => {
      if (!file || !file.type.startsWith('image/')) {
        DOM.toast('Please select a valid image file', 'error');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        DOM.toast('Image must be under 10 MB', 'error');
        return;
      }
      selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        previewImg.src = e.target.result;
        placeholder.classList.add('hidden');
        previewContainer.classList.remove('hidden');
        fileNameEl.textContent = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
        analyzeBtn.disabled = false;
        uploadArea.classList.remove('border-dashed');
        uploadArea.classList.add('border-verd-500/20');
      };
      reader.readAsDataURL(file);
    };

    uploadBtn?.addEventListener('click', (e) => { e.stopPropagation(); fileInput.click(); });
    cameraBtn?.addEventListener('click', (e) => { e.stopPropagation(); fileInput.setAttribute('capture', 'environment'); fileInput.click(); });
    uploadArea?.addEventListener('click', () => { if (!selectedFile) fileInput.click(); });
    fileInput?.addEventListener('change', (e) => { if (e.target.files[0]) handleFile(e.target.files[0]); });

    // Drag & drop
    uploadArea?.addEventListener('dragover', (e) => { e.preventDefault(); dragOverlay?.classList.remove('hidden'); });
    uploadArea?.addEventListener('dragleave', () => { dragOverlay?.classList.add('hidden'); });
    uploadArea?.addEventListener('drop', (e) => {
      e.preventDefault(); dragOverlay?.classList.add('hidden');
      if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    });

    clearBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      selectedFile = null;
      placeholder.classList.remove('hidden');
      previewContainer.classList.add('hidden');
      analyzeBtn.disabled = true;
      uploadArea.classList.add('border-dashed');
      uploadArea.classList.remove('border-verd-500/20');
      fileInput.value = '';
    });

    analyzeBtn?.addEventListener('click', async () => {
      if (!selectedFile) return;
      const instructions = document.getElementById('scan-instructions');
      const processing = document.getElementById('scan-processing');
      instructions?.classList.add('hidden');
      processing?.classList.remove('hidden');
      analyzeBtn.disabled = true;
      analyzeBtn.innerHTML = '<span class="inline-block spin">' + Icons.sized(Icons.refresh, 18) + '</span> Analyzing...';

      // Start neural net animation
      const canvas = document.getElementById('neural-canvas');
      if (canvas && typeof NeuralNetAnim !== 'undefined') {
        this._neuralAnim = new NeuralNetAnim(canvas);
        this._neuralAnim.start();
      }

      // Voice cue
      if (typeof VoiceScanner !== 'undefined') VoiceScanner.onScanStart();

      const layerNames = ['Input Layer', 'Conv Block 1', 'Conv Block 2', 'Pooling', 'Conv Block 3', 'Dense 1', 'Dense 2', 'Output'];

      window._scanProgressCallback = (stage, pct) => {
        const stageEl = document.getElementById('process-stage');
        const barEl = document.getElementById('process-bar');
        const pctEl = document.getElementById('process-percent-big');
        const layerLabel = document.getElementById('nn-layer-label');
        if (stageEl) stageEl.textContent = stage;
        if (barEl) barEl.style.width = pct + '%';
        if (pctEl) pctEl.textContent = Math.round(pct);
        if (layerLabel) {
          const idx = Math.min(7, Math.floor(pct / 100 * 8));
          layerLabel.textContent = layerNames[idx] || 'Processing';
        }
        if (this._neuralAnim) this._neuralAnim.setProgress(pct);
        if (typeof VoiceScanner !== 'undefined') VoiceScanner.onScanProgress(stage, Math.round(pct));
      };

      try {
        const result = await ScannerService.analyze(selectedFile);
        await FirestoreService.saveScan(result);
        AppState.set('lastScanResult', result);
        // Save to local scan history
        if (typeof ScanHistoryDB !== 'undefined') {
          ScanHistoryDB.save(result).catch(e => console.warn('[VERD] History save failed:', e));
        }
        if (typeof VoiceScanner !== 'undefined') VoiceScanner.onScanComplete(result);
        DOM.toast('Analysis complete', 'success');
        if (this._neuralAnim) { this._neuralAnim.destroy(); this._neuralAnim = null; }
        window.location.hash = '#/results';
      } catch (err) {
        if (typeof VoiceScanner !== 'undefined') VoiceScanner.onScanError();
        DOM.toast('Analysis failed: ' + err.message, 'error');
        instructions?.classList.remove('hidden');
        processing?.classList.add('hidden');
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = Icons.brain + ' Analyze with AI';
        if (this._neuralAnim) { this._neuralAnim.destroy(); this._neuralAnim = null; }
      }
    });
  }
};
