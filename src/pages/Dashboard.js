// ═══════════════════════════════════════════
//  Farmer Dashboard Page — Data from Supabase
// ═══════════════════════════════════════════

window.DashboardPage = {
  _crops: [],
  _scans: [],
  _loaded: false,

  render() {
    const user = AppState.get('user') || {};

    const greeting = (() => {
      const h = new Date().getHours();
      if (h < 12) return 'Good morning';
      if (h < 17) return 'Good afternoon';
      return 'Good evening';
    })();

    return `
      <div class="space-y-6" id="dashboard-root">
        <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">${greeting}, ${user.displayName || 'Farmer'}</h1>
            <p class="text-surface-500 mt-1 text-sm">Here's your farm overview for today</p>
          </div>
          <a href="#/scan" class="btn btn-primary">
            ${Icons.scan} New Scan
          </a>
        </div>

        <!-- Stats Cards — populated after data load -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3" id="dashboard-stats">
          <div class="glass rounded-2xl p-5 animate-pulse"><div class="h-12 bg-surface-800 rounded-xl"></div></div>
          <div class="glass rounded-2xl p-5 animate-pulse"><div class="h-12 bg-surface-800 rounded-xl"></div></div>
          <div class="glass rounded-2xl p-5 animate-pulse"><div class="h-12 bg-surface-800 rounded-xl"></div></div>
          <div class="glass rounded-2xl p-5 animate-pulse"><div class="h-12 bg-surface-800 rounded-xl"></div></div>
        </div>

        <div class="grid lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-sm font-semibold text-surface-400 uppercase tracking-wider flex items-center gap-2">
                <span class="text-verd-500">${Icons.activity}</span> Crop Health Monitor
              </h2>
              <span class="text-xs text-surface-700" id="fields-count"></span>
            </div>
            <div class="grid sm:grid-cols-2 gap-4" id="crop-health-grid">
              <div class="glass rounded-2xl p-5 animate-pulse"><div class="h-24 bg-surface-800 rounded-xl"></div></div>
              <div class="glass rounded-2xl p-5 animate-pulse"><div class="h-24 bg-surface-800 rounded-xl"></div></div>
            </div>
          </div>

          <div class="space-y-4">
            <div id="weather-widget"></div>
            <div class="glass rounded-2xl p-5 space-y-2.5">
              <h3 class="text-sm font-semibold text-surface-400 uppercase tracking-wider flex items-center gap-2">
                <span class="text-verd-500">${Icons.zap}</span> Quick Actions
              </h3>
              <a href="#/scan" class="flex items-center gap-3 p-3 rounded-xl bg-surface-900/50 hover:bg-verd-950/30 border border-surface-800/50 hover:border-verd-900/30 group">
                <div class="w-9 h-9 rounded-xl bg-surface-800 flex items-center justify-center text-surface-400 group-hover:text-verd-400 group-hover:bg-verd-950/50">${Icons.scan}</div>
                <div>
                  <p class="text-sm font-semibold text-surface-200">Scan Crop</p>
                  <p class="text-xs text-surface-600">Upload or capture image</p>
                </div>
              </a>
              <a href="#/marketplace" class="flex items-center gap-3 p-3 rounded-xl bg-surface-900/50 hover:bg-verd-950/30 border border-surface-800/50 hover:border-verd-900/30 group">
                <div class="w-9 h-9 rounded-xl bg-surface-800 flex items-center justify-center text-surface-400 group-hover:text-verd-400 group-hover:bg-verd-950/50">${Icons.lightbulb}</div>
                <div>
                  <p class="text-sm font-semibold text-surface-200">View Insights</p>
                  <p class="text-xs text-surface-600">Actionable farming advice</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        <div class="glass rounded-2xl p-5 space-y-3">
          <div class="flex items-center justify-between">
            <h2 class="text-sm font-semibold text-surface-400 uppercase tracking-wider flex items-center gap-2">
              <span class="text-verd-500">${Icons.fileText}</span> Recent Scans
            </h2>
            <a href="#/history" class="text-xs text-verd-500 hover:text-verd-400 font-semibold inline-flex items-center gap-1">View all ${Icons.chevronRight}</a>
          </div>
          <div class="divide-y divide-surface-800/30" id="recent-scans-list">
            <div class="py-6 text-center text-surface-600 text-sm">Loading scans...</div>
          </div>
        </div>
      </div>
    `;
  },

  async afterRender() {
    LayoutComponent.setTitle('Dashboard', 'Farm overview & crop health');

    // Load data from Supabase
    const [crops, scans] = await Promise.all([
      DataService.getCropHealth(),
      DataService.getRecentScans(10)
    ]);

    this._crops = crops;
    this._scans = scans;
    this._loaded = true;

    // Update state for other components
    if (crops.length > 0) AppState.set('cropHealthData', crops);
    if (scans.length > 0) AppState.set('recentScans', scans);

    // Render stats
    const avgHealth = crops.length ? Math.round(crops.reduce((a, c) => a + c.health, 0) / crops.length) : 0;
    const statsEl = document.getElementById('dashboard-stats');
    if (statsEl) {
      statsEl.innerHTML = `
        ${CardComponent.stat({ icon: Icons.heart, label: 'Avg Crop Health', value: avgHealth + '%', trend: 3.2, trendUp: true })}
        ${CardComponent.stat({ icon: Icons.barChart, label: 'Total Scans', value: scans.length, trend: 12, trendUp: true })}
        ${CardComponent.stat({ icon: Icons.sprout, label: 'Active Fields', value: crops.length })}
        ${CardComponent.stat({ icon: Icons.alertTriangle, label: 'Active Alerts', value: crops.filter(c => c.status === 'danger' || c.status === 'warning').length, trend: 1, trendUp: false })}
      `;
    }

    // Render crop health cards
    const cropGrid = document.getElementById('crop-health-grid');
    const fieldsCount = document.getElementById('fields-count');
    if (fieldsCount) fieldsCount.textContent = `${crops.length} fields`;
    if (cropGrid) {
      if (crops.length > 0) {
        cropGrid.innerHTML = crops.map(c => CardComponent.cropHealth(c)).join('');
      } else {
        cropGrid.innerHTML = `
          <div class="glass rounded-2xl p-8 text-center sm:col-span-2">
            <div class="w-12 h-12 rounded-xl bg-surface-800 flex items-center justify-center text-surface-500 mx-auto mb-3">${Icons.sized(Icons.sprout, 24)}</div>
            <p class="text-surface-400 text-sm">No crop health data yet. Start scanning your fields to track health.</p>
          </div>
        `;
      }
    }

    // Render recent scans
    const scansList = document.getElementById('recent-scans-list');
    if (scansList) {
      if (scans.length > 0) {
        scansList.innerHTML = scans.slice(0, 5).map(s => CardComponent.scanRow(s)).join('');
      } else {
        scansList.innerHTML = '<p class="text-center text-surface-600 py-8 text-sm">No scans yet. Start by analyzing your first crop.</p>';
      }
    }

    // Load weather
    const w = document.getElementById('weather-widget');
    if (w) await WeatherWidget.render(w);
  }
};
