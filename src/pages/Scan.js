// ═══════════════════════════════════════════
//  Scan Module Page
// ═══════════════════════════════════════════

window.ScanPage = {
  render() {
    return `
      <div class="space-y-6 stagger">
        <div>
          <h1 class="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">Scan Crop</h1>
          <p class="text-surface-500 mt-1 text-sm">Upload or capture a photo for ML-powered crop analysis</p>
        </div>

        <div class="grid lg:grid-cols-2 gap-6">
          <div class="space-y-4">
            <div id="upload-area" class="glass rounded-2xl p-8 border border-dashed border-surface-700 hover:border-verd-500/30 text-center cursor-pointer group" style="min-height: 280px;">
              <input type="file" id="scan-file-input" accept="image/*" capture="environment" class="hidden" />
              <div class="flex flex-col items-center justify-center h-full py-6" id="upload-placeholder">
                <div class="w-16 h-16 rounded-2xl bg-surface-800 flex items-center justify-center mb-4 text-surface-500 group-hover:text-verd-400 group-hover:bg-verd-950/30" style="transition: all 0.3s">
                  ${Icons.sized(Icons.upload, 28)}
                </div>
                <p class="text-base font-bold text-surface-200 mb-1">Upload Crop Image</p>
                <p class="text-sm text-surface-600 mb-5">Drag and drop or click to browse</p>
                <div class="flex flex-col sm:flex-row gap-3">
                  <button id="camera-btn" class="btn btn-primary text-sm py-2.5 px-4">
                    ${Icons.camera} Camera
                  </button>
                  <button id="upload-btn" class="btn btn-secondary text-sm py-2.5 px-4">
                    ${Icons.folderOpen} Browse
                  </button>
                </div>
                <p class="text-xs text-surface-700 mt-4">JPG, PNG, WebP &middot; Max 10 MB</p>
              </div>

              <div id="image-preview" class="hidden">
                <div class="relative inline-block rounded-xl overflow-hidden">
                  <img id="preview-img" class="max-h-56 rounded-xl" alt="Crop preview" />
                  <button id="clear-image-btn" class="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 text-white text-sm hover:bg-red-600 flex items-center justify-center">${Icons.sized(Icons.x, 14)}</button>
                </div>
                <p id="file-name" class="text-sm text-surface-500 mt-2"></p>
              </div>
            </div>

            <button id="analyze-btn" disabled
              class="btn btn-primary w-full py-3.5 text-base disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-verd-900/30">
              ${Icons.brain} Analyze with AI
            </button>

            <!-- ML Model Info -->
            <div class="glass rounded-2xl p-4 flex items-start gap-3">
              <div class="w-8 h-8 rounded-lg bg-surface-800 flex items-center justify-center text-verd-500 flex-shrink-0">${Icons.sized(Icons.brain, 16)}</div>
              <div>
                <p class="text-xs font-semibold text-surface-300">ML Engine: TensorFlow.js + MobileNet v2</p>
                <p class="text-xs text-surface-600 mt-0.5">Neural network inference runs locally in your browser. No data leaves your device.</p>
              </div>
            </div>
          </div>

          <div id="analysis-panel" class="space-y-4">
            <div class="glass rounded-2xl p-6 space-y-3" id="scan-instructions">
              <h3 class="text-sm font-semibold text-surface-400 uppercase tracking-wider flex items-center gap-2">
                <span class="text-verd-500">${Icons.info}</span> Scanning Tips
              </h3>
              <div class="space-y-2.5">
                ${[
        { icon: Icons.sun, title: 'Good Lighting', desc: 'Photograph in natural daylight for optimal results' },
        { icon: Icons.target, title: 'Focus on Affected Area', desc: 'Capture close-ups of diseased or damaged tissue' },
        { icon: Icons.scan, title: 'Clear Angle', desc: 'Shoot from directly above or at a 45-degree angle' },
        { icon: Icons.leaf, title: 'Include Healthy Parts', desc: 'Show both healthy and affected tissue for comparison' },
        { icon: Icons.activity, title: 'Multiple Samples', desc: 'Scan several leaves for higher diagnostic accuracy' }
      ].map(tip => `
                  <div class="flex items-start gap-3 p-3 rounded-xl bg-surface-900/30">
                    <div class="w-8 h-8 rounded-lg bg-surface-800 flex items-center justify-center text-surface-500 flex-shrink-0">${Icons.sized(tip.icon, 16)}</div>
                    <div>
                      <p class="text-sm font-semibold text-surface-300">${tip.title}</p>
                      <p class="text-xs text-surface-600">${tip.desc}</p>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <div id="scan-processing" class="hidden glass rounded-2xl p-8 text-center space-y-6">
              <div class="relative w-28 h-28 mx-auto">
                <div class="absolute inset-0 rounded-full border-2 border-surface-800"></div>
                <div class="absolute inset-0 rounded-full border-2 border-verd-500 border-t-transparent spin"></div>
                <div class="absolute inset-0 flex items-center justify-center text-verd-500">
                  ${Icons.sized(Icons.brain, 32)}
                </div>
              </div>
              <div>
                <p class="text-sm font-bold text-white" id="process-stage">Initializing ML engine...</p>
                <p class="text-xs text-surface-600 mt-1">Running neural network inference locally</p>
              </div>
              <div class="w-full bg-surface-800 rounded-full h-2">
                <div id="process-bar" class="bg-verd-500 h-2 rounded-full transition-all duration-500" style="width: 0%"></div>
              </div>
              <p class="text-xs text-surface-700 font-mono" id="process-percent">0%</p>
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

    let selectedFile = null;

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

    uploadArea?.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.classList.add('border-verd-500/40'); });
    uploadArea?.addEventListener('dragleave', () => { uploadArea.classList.remove('border-verd-500/40'); });
    uploadArea?.addEventListener('drop', (e) => { e.preventDefault(); uploadArea.classList.remove('border-verd-500/40'); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); });

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

      window._scanProgressCallback = (stage, pct) => {
        const stageEl = document.getElementById('process-stage');
        const barEl = document.getElementById('process-bar');
        const pctEl = document.getElementById('process-percent');
        if (stageEl) stageEl.textContent = stage;
        if (barEl) barEl.style.width = pct + '%';
        if (pctEl) pctEl.textContent = Math.round(pct) + '%';
      };

      try {
        const result = await ScannerService.analyze(selectedFile);
        await FirestoreService.saveScan(result);
        AppState.set('lastScanResult', result);
        DOM.toast('Analysis complete', 'success');
        window.location.hash = '#/results';
      } catch (err) {
        DOM.toast('Analysis failed: ' + err.message, 'error');
        instructions?.classList.remove('hidden');
        processing?.classList.add('hidden');
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = Icons.brain + ' Analyze with AI';
      }
    });
  }
};
