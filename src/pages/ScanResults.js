// ═══════════════════════════════════════════
//  Scan Results Page — Premium
// ═══════════════════════════════════════════

window.ScanResultsPage = {
  render() {
    const result = AppState.get('lastScanResult');
    if (!result) {
      return `
        <div class="flex flex-col items-center justify-center py-20 text-center">
          <div class="w-20 h-20 rounded-2xl bg-surface-800 flex items-center justify-center text-surface-500 mb-5 float">${Icons.sized(Icons.fileText, 32)}</div>
          <h2 class="text-xl font-bold text-surface-300 mb-2">No Results Available</h2>
          <p class="text-surface-600 mb-6 text-sm">Run a scan first to view analysis results.</p>
          <a href="#/scan" class="btn btn-primary">${Icons.scan} Start Scanning</a>
        </div>
      `;
    }

    const isHealthy = result.severity === 'none';
    const badgeClass = { none: 'badge-success', moderate: 'badge-warning', high: 'badge-danger' };
    const severityClass = { none: 'severity-none', moderate: 'severity-medium', high: 'severity-high' };
    const conf = result.confidence || 0;
    const circumference = 2 * Math.PI * 42;
    const dashoffset = circumference - (conf / 100) * circumference;

    return `
      <div class="space-y-6 stagger">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div class="flex items-center gap-3 mb-1">
              <h1 class="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">Analysis Results</h1>
              <span class="badge ${badgeClass[result.severity] || 'badge-neutral'}">${result.severity === 'none' ? 'Healthy' : result.severity === 'moderate' ? 'Moderate' : 'Critical'}</span>
            </div>
            <p class="text-surface-600 text-sm font-mono">ID: ${result.id} &middot; ${DOM.formatDate(result.timestamp)}</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <a href="#/scan" class="btn btn-secondary text-sm">${Icons.scan} New Scan</a>
            <button id="download-report-btn" class="btn btn-secondary text-sm">${Icons.download} Download</button>
            <button id="whatsapp-share-btn" class="btn btn-secondary text-sm" style="color: #25D366; border-color: rgba(37, 211, 102, 0.2);">${Icons.share} WhatsApp</button>
            <button id="share-result-btn" class="btn btn-primary text-sm">${Icons.share} Share</button>
          </div>
        </div>

        <div class="grid lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 space-y-5">

            <!-- Diagnosis Hero Card -->
            <div class="rounded-2xl p-6 ${severityClass[result.severity] || 'glass'} relative overflow-hidden">
              <div class="absolute top-0 right-0 w-40 h-40 rounded-full opacity-5" style="background: ${result.color}; filter: blur(60px); transform: translate(30%, -30%);"></div>
              <div class="flex items-start justify-between mb-5 relative z-10">
                <div class="flex-1">
                  <p class="text-xs text-surface-500 uppercase tracking-wider mb-1.5 font-semibold">Detected Condition</p>
                  <h2 class="text-2xl font-extrabold text-white mb-2">${result.condition}</h2>
                  <p class="text-surface-400 text-sm leading-relaxed max-w-lg">${result.description}</p>
                </div>
                <!-- SVG Confidence Ring -->
                <div class="confidence-ring flex-shrink-0 ml-4">
                  <svg width="100" height="100" viewBox="0 0 100 100">
                    <circle class="track" cx="50" cy="50" r="42" />
                    <circle class="fill" cx="50" cy="50" r="42"
                      stroke="${result.color}"
                      stroke-dasharray="${circumference}"
                      stroke-dashoffset="${dashoffset}" />
                  </svg>
                  <div class="label" style="color: ${result.color};">${conf}%</div>
                </div>
              </div>

              <!-- Severity Bar -->
              <div class="severity-bar mt-2">
                <div class="severity-bar-fill" style="width: ${conf}%; background: ${result.color};"></div>
              </div>
            </div>

            ${result.mlData ? `
            <!-- ML Model Output -->
            <div class="glass rounded-2xl p-6">
              <h3 class="text-sm font-semibold text-surface-400 uppercase tracking-wider flex items-center gap-2 mb-4">
                <span class="text-verd-500">${Icons.brain}</span> Neural Network Output
              </h3>
              <div class="grid sm:grid-cols-3 gap-3 mb-5">
                <div class="p-3 rounded-xl bg-surface-900/50 text-center metric-card">
                  <p class="text-xs text-surface-600 mb-0.5">Model</p>
                  <p class="text-sm font-bold text-surface-200">${result.mlData.modelVersion}</p>
                </div>
                <div class="p-3 rounded-xl bg-surface-900/50 text-center metric-card">
                  <p class="text-xs text-surface-600 mb-0.5">Inference</p>
                  <p class="text-sm font-bold text-verd-400 font-mono">${result.mlData.inferenceMs}ms</p>
                </div>
                <div class="p-3 rounded-xl bg-surface-900/50 text-center metric-card">
                  <p class="text-xs text-surface-600 mb-0.5">Processing</p>
                  <p class="text-sm font-bold text-surface-200">On-device</p>
                </div>
              </div>
              <p class="text-xs text-surface-600 uppercase tracking-wider mb-3 font-semibold">Top Classifications</p>
              <div class="space-y-2">
                ${result.mlData.topPredictions.map((p, i) => `
                  <div class="flex items-center gap-3 p-2.5 rounded-lg ${i === 0 ? 'bg-verd-950/30 border border-verd-900/20' : 'bg-surface-900/30 hover:bg-surface-900/50'}">
                    <div class="w-6 h-6 rounded-md ${i === 0 ? 'bg-verd-500/20 text-verd-400' : 'bg-surface-800 text-surface-500'} flex items-center justify-center text-xs font-bold">${i + 1}</div>
                    <span class="text-sm ${i === 0 ? 'font-bold text-verd-400' : 'text-surface-300'} flex-1">${p.className}</span>
                    <div class="flex items-center gap-2">
                      <div class="w-16 h-1.5 rounded-full bg-surface-800 overflow-hidden">
                        <div class="h-full rounded-full ${i === 0 ? 'bg-verd-500' : 'bg-surface-600'}" style="width: ${p.probability}%;"></div>
                      </div>
                      <span class="text-xs font-bold font-mono ${i === 0 ? 'text-verd-400' : 'text-surface-500'} w-8 text-right">${p.probability}%</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
            ` : ''}

            <!-- Recommendations -->
            <div class="glass rounded-2xl p-6">
              <h3 class="text-sm font-semibold text-surface-400 uppercase tracking-wider flex items-center gap-2 mb-4">
                <span class="text-verd-500">${Icons.shieldCheck}</span> Recommendations
              </h3>
              <div class="space-y-2">
                ${result.recommendations.map((rec, i) => `
                  <div class="flex items-start gap-3 p-3 rounded-xl bg-surface-900/30 hover:bg-surface-900/50 scan-tip-card">
                    <div class="w-7 h-7 rounded-lg bg-verd-950/30 flex items-center justify-center text-xs font-bold text-verd-500 flex-shrink-0">${i + 1}</div>
                    <p class="text-sm text-surface-300 leading-relaxed">${rec}</p>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Soil Metrics -->
            <div class="glass rounded-2xl p-6">
              <h3 class="text-sm font-semibold text-surface-400 uppercase tracking-wider flex items-center gap-2 mb-4">
                <span class="text-verd-500">${Icons.beaker}</span> Soil Metrics
              </h3>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                ${Object.entries({
      'Nitrogen (N)': { value: result.soilMetrics.nitrogen, unit: 'ppm', good: [40, 60] },
      'Phosphorus (P)': { value: result.soilMetrics.phosphorus, unit: 'ppm', good: [25, 45] },
      'Potassium (K)': { value: result.soilMetrics.potassium, unit: 'ppm', good: [30, 50] },
      'Soil pH': { value: result.soilMetrics.pH, unit: '', good: [6.0, 7.0] },
      'Organic Matter': { value: result.soilMetrics.organicMatter, unit: '%', good: [2.0, 4.0] }
    }).map(([name, data]) => {
      const val = parseFloat(data.value);
      const status = val >= data.good[0] && val <= data.good[1] ? 'text-verd-400' : val < data.good[0] ? 'text-yellow-400' : 'text-blue-400';
      const dotClass = val >= data.good[0] && val <= data.good[1] ? 'dot-excellent' : val < data.good[0] ? 'dot-warning' : 'dot-good';
      return `
                    <div class="p-3 rounded-xl bg-surface-900/30 text-center metric-card">
                      <div class="flex items-center justify-center gap-1.5 mb-1">
                        <div class="w-1.5 h-1.5 rounded-full ${dotClass}"></div>
                        <p class="text-xs text-surface-600">${name}</p>
                      </div>
                      <p class="text-xl font-extrabold ${status} font-mono">${data.value}<span class="text-xs text-surface-700 ml-0.5">${data.unit}</span></p>
                    </div>
                  `;
    }).join('')}
              </div>
            </div>
          </div>

          <!-- Right Sidebar -->
          <div class="space-y-4">
            <div class="glass-elevated rounded-2xl p-5 space-y-3">
              <h3 class="text-sm font-semibold text-surface-400 uppercase tracking-wider flex items-center gap-2">
                ${Icons.folderOpen} Scan Details
              </h3>
              <div class="space-y-2.5 text-sm">
                <div class="flex justify-between text-surface-500"><span>File</span><span class="text-surface-300 truncate ml-4">${result.fileName}</span></div>
                <div class="flex justify-between text-surface-500"><span>Size</span><span class="text-surface-300">${result.fileSize}</span></div>
                <div class="flex justify-between text-surface-500"><span>Date</span><span class="text-surface-300">${DOM.formatDate(result.timestamp)}</span></div>
                <div class="flex justify-between text-surface-500"><span>ID</span><span class="text-surface-300 font-mono text-xs">${result.id}</span></div>
              </div>
            </div>

            <div class="glass-elevated rounded-2xl p-5 space-y-3">
              <h3 class="text-sm font-semibold text-surface-400 uppercase tracking-wider flex items-center gap-2">
                ${Icons.target} Next Steps
              </h3>
              <a href="#/marketplace" class="flex items-center gap-3 p-3 rounded-xl bg-surface-900/30 hover:bg-verd-950/20 border border-surface-800/50 hover:border-verd-900/20 group">
                <div class="w-8 h-8 rounded-lg bg-surface-800 flex items-center justify-center text-surface-500 group-hover:text-verd-400">${Icons.sized(Icons.lightbulb, 16)}</div>
                <div>
                  <p class="text-sm font-semibold text-surface-200">Related Insights</p>
                  <p class="text-xs text-surface-600">Detailed guidance</p>
                </div>
              </a>
              <a href="#/scan" class="flex items-center gap-3 p-3 rounded-xl bg-surface-900/30 hover:bg-verd-950/20 border border-surface-800/50 hover:border-verd-900/20 group">
                <div class="w-8 h-8 rounded-lg bg-surface-800 flex items-center justify-center text-surface-500 group-hover:text-verd-400">${Icons.sized(Icons.refresh, 16)}</div>
                <div>
                  <p class="text-sm font-semibold text-surface-200">Scan Another</p>
                  <p class="text-xs text-surface-600">Continuous monitoring</p>
                </div>
              </a>
            </div>

            ${!isHealthy ? `
            <div class="rounded-2xl p-5 space-y-3 severity-${result.severity === 'moderate' ? 'medium' : 'high'}">
              <h3 class="text-sm font-bold flex items-center gap-2" style="color: ${result.color}">${Icons.alertTriangle} Action Required</h3>
              <p class="text-sm text-surface-400">This condition requires attention. Follow the recommendations above or contact your local extension officer.</p>
              <button id="alert-officer-btn" class="btn w-full py-2.5 text-sm font-bold text-white" style="background: linear-gradient(135deg, ${result.color}, ${result.color}cc);">
                ${Icons.phone} Contact Extension Officer
              </button>
            </div>
            ` : `
            <div class="rounded-2xl p-5 severity-none text-center">
              <div class="w-12 h-12 rounded-full bg-verd-500/10 flex items-center justify-center text-verd-400 mx-auto mb-3">
                ${Icons.sized(Icons.checkCircle, 24)}
              </div>
              <p class="text-sm font-bold text-verd-400">Crop is Healthy</p>
              <p class="text-xs text-surface-500 mt-1">Continue regular monitoring for best results</p>
            </div>
            `}
          </div>
        </div>
      </div>
    `;
  },

  afterRender() {
    LayoutComponent.setTitle('Results', 'AI Analysis Report');
    const result = AppState.get('lastScanResult');

    document.getElementById('share-result-btn')?.addEventListener('click', () => DOM.toast('Report link copied to clipboard', 'success'));

    document.getElementById('download-report-btn')?.addEventListener('click', async () => {
      if (result && typeof ReportCard !== 'undefined') {
        DOM.toast('Generating report...', 'info');
        await ReportCard.download(result);
      }
    });

    document.getElementById('whatsapp-share-btn')?.addEventListener('click', () => {
      if (result && typeof ReportCard !== 'undefined') {
        ReportCard.shareWhatsApp(result);
      }
    });
    document.getElementById('alert-officer-btn')?.addEventListener('click', () => {
      ModalComponent.show({
        title: 'Contact Extension Officer',
        content: `
          <div class="space-y-4">
            <p class="text-surface-400 text-sm">Your nearest agricultural extension office will be notified about this diagnostic result.</p>
            <div class="p-4 rounded-xl bg-surface-900 border border-surface-800 space-y-2">
              <p class="text-sm font-semibold text-surface-200">County Agricultural Office &mdash; Nairobi</p>
              <p class="text-sm text-surface-500 flex items-center gap-2">${Icons.phone} +254 700 123 456</p>
              <p class="text-sm text-surface-500 flex items-center gap-2">${Icons.clock} Mon-Fri: 8:00 AM - 5:00 PM</p>
            </div>
          </div>
        `,
        size: 'sm'
      });
    });
  }
};
