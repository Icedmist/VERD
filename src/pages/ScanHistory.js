// ═══════════════════════════════════════════
//  Scan History — IndexedDB Storage + Timeline
// ═══════════════════════════════════════════

window.ScanHistoryDB = {
    _db: null,
    _dbName: 'verd_scans',
    _storeName: 'scans',

    async open() {
        if (this._db) return this._db;
        return new Promise((resolve, reject) => {
            const req = indexedDB.open(this._dbName, 1);
            req.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(this._storeName)) {
                    const store = db.createObjectStore(this._storeName, { keyPath: 'id' });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                }
            };
            req.onsuccess = (e) => { this._db = e.target.result; resolve(this._db); };
            req.onerror = () => reject(req.error);
        });
    },

    async save(result) {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this._storeName, 'readwrite');
            tx.objectStore(this._storeName).put(result);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    },

    async getAll() {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this._storeName, 'readonly');
            const req = tx.objectStore(this._storeName).index('timestamp').getAll();
            req.onsuccess = () => resolve(req.result.reverse()); // newest first
            req.onerror = () => reject(req.error);
        });
    },

    async get(id) {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this._storeName, 'readonly');
            const req = tx.objectStore(this._storeName).get(id);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    },

    async remove(id) {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this._storeName, 'readwrite');
            tx.objectStore(this._storeName).delete(id);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    },

    async count() {
        const all = await this.getAll();
        return all.length;
    }
};

// ═══════════════════════════════════════════
//  Scan History Page
// ═══════════════════════════════════════════

window.ScanHistoryPage = {
    _scans: [],

    async loadScans() {
        try {
            this._scans = await ScanHistoryDB.getAll();
        } catch (e) {
            this._scans = [];
        }
    },

    render() {
        return `
      <div class="space-y-6 stagger" id="history-root">
        <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">Scan History</h1>
            <p class="text-surface-500 mt-1 text-sm">View past scan results and track crop health over time</p>
          </div>
          <a href="#/scan" class="btn btn-primary">${Icons.scan} New Scan</a>
        </div>

        <div id="history-loading" class="text-center py-12">
          <div class="inline-block spin text-verd-500">${Icons.sized(Icons.refresh, 24)}</div>
          <p class="text-surface-600 text-sm mt-3">Loading scan history...</p>
        </div>

        <div id="history-list" class="hidden space-y-3"></div>
        <div id="history-empty" class="hidden"></div>
      </div>
    `;
    },

    async afterRender() {
        LayoutComponent.setTitle('History', 'Past scan results');
        await this.loadScans();
        this._renderList();
    },

    _renderList() {
        const loading = document.getElementById('history-loading');
        const list = document.getElementById('history-list');
        const empty = document.getElementById('history-empty');
        if (loading) loading.classList.add('hidden');

        if (this._scans.length === 0) {
            if (empty) {
                empty.classList.remove('hidden');
                empty.innerHTML = `
          <div class="flex flex-col items-center justify-center py-16 text-center">
            <div class="w-20 h-20 rounded-2xl bg-surface-800 flex items-center justify-center text-surface-500 mb-5 float">${Icons.sized(Icons.clock, 32)}</div>
            <h2 class="text-lg font-bold text-surface-300 mb-2">No Scans Yet</h2>
            <p class="text-surface-600 mb-6 text-sm">Your scan history will appear here after your first analysis.</p>
            <a href="#/scan" class="btn btn-primary">${Icons.scan} Start Scanning</a>
          </div>
        `;
            }
            return;
        }

        if (list) {
            list.classList.remove('hidden');

            // Stats bar
            const total = this._scans.length;
            const healthy = this._scans.filter(s => s.severity === 'none').length;
            const critical = this._scans.filter(s => s.severity === 'high').length;

            list.innerHTML = `
        <div class="grid grid-cols-3 gap-3 mb-4">
          <div class="glass rounded-xl p-4 text-center metric-card">
            <p class="text-2xl font-black text-white font-mono">${total}</p>
            <p class="text-xs text-surface-600">Total Scans</p>
          </div>
          <div class="glass rounded-xl p-4 text-center metric-card">
            <p class="text-2xl font-black text-verd-400 font-mono">${healthy}</p>
            <p class="text-xs text-surface-600">Healthy</p>
          </div>
          <div class="glass rounded-xl p-4 text-center metric-card">
            <p class="text-2xl font-black text-red-400 font-mono">${critical}</p>
            <p class="text-xs text-surface-600">Critical</p>
          </div>
        </div>

        <div class="space-y-2" id="history-items"></div>
      `;

            const items = document.getElementById('history-items');
            this._scans.forEach((scan) => {
                const sevColors = { none: '#1aaf63', moderate: '#eab308', high: '#ef4444' };
                const sevLabels = { none: 'Healthy', moderate: 'Moderate', high: 'Critical' };
                const color = sevColors[scan.severity] || '#737373';
                const label = sevLabels[scan.severity] || 'Unknown';
                const date = new Date(scan.timestamp).toLocaleDateString('en-GB', {
                    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                });

                const card = document.createElement('div');
                card.className = 'glass rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:border-verd-500/20 group scan-tip-card';
                card.innerHTML = `
          <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style="background: ${color}15; color: ${color};">
            ${scan.severity === 'none' ? Icons.sized(Icons.checkCircle, 20) : Icons.sized(Icons.alertTriangle, 20)}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-bold text-surface-200 truncate">${scan.condition || 'Unknown'}</p>
            <p class="text-xs text-surface-600">${date} &middot; ${scan.fileName || 'Image'}</p>
          </div>
          <div class="text-right flex-shrink-0">
            <p class="text-sm font-black font-mono" style="color: ${color};">${scan.confidence || 0}%</p>
            <p class="text-xs" style="color: ${color};">${label}</p>
          </div>
          <div class="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100" style="transition: opacity 0.2s;">
            <button class="history-download w-8 h-8 rounded-lg bg-surface-800 hover:bg-verd-950/30 flex items-center justify-center text-surface-500 hover:text-verd-400" data-id="${scan.id}" title="Download report">${Icons.sized(Icons.download, 14)}</button>
            <button class="history-delete w-8 h-8 rounded-lg bg-surface-800 hover:bg-red-950/30 flex items-center justify-center text-surface-500 hover:text-red-400" data-id="${scan.id}" title="Delete">${Icons.sized(Icons.x, 14)}</button>
          </div>
        `;

                // Click card to view result
                card.addEventListener('click', (e) => {
                    if (e.target.closest('.history-download') || e.target.closest('.history-delete')) return;
                    AppState.set('lastScanResult', scan);
                    window.location.hash = '#/results';
                });

                items.appendChild(card);
            });

            // Download buttons
            items.querySelectorAll('.history-download').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const id = btn.dataset.id;
                    const scan = this._scans.find(s => s.id === id);
                    if (scan && typeof ReportCard !== 'undefined') {
                        await ReportCard.download(scan);
                        DOM.toast('Report downloaded', 'success');
                    }
                });
            });

            // Delete buttons
            items.querySelectorAll('.history-delete').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const id = btn.dataset.id;
                    await ScanHistoryDB.remove(id);
                    this._scans = this._scans.filter(s => s.id !== id);
                    this._renderList();
                    DOM.toast('Scan removed', 'success');
                });
            });
        }
    }
};
