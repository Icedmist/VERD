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
      if (h < 5) return 'Night Owl';
      if (h < 12) return 'Good Morning';
      if (h < 17) return 'Good Afternoon';
      return 'Good Evening';
    })();

    return `
      <div class="space-y-8 stagger" id="dashboard-root">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 fade-in">
          <div>
            <h1 class="text-3xl lg:text-4xl font-black text-white tracking-tight">${greeting}, ${user.displayName || 'Farmer'}!</h1>
            <p class="text-surface-500 mt-2 font-medium flex items-center gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-brand-cyan shadow-[0_0_8px_var(--brand-cyan)]"></span>
              Real-time agricultural intelligence overview
            </p>
          </div>
          <div class="flex items-center gap-3">
             <button id="refresh-dashboard" class="w-11 h-11 rounded-xl bg-surface-900 border border-surface-800 flex items-center justify-center text-surface-400 hover:text-white transition-all">
                ${Icons.refresh}
             </button>
             <a href="#/scan" class="btn btn-primary px-6 py-3 h-11 shadow-lg shadow-verd-900/10">
               ${Icons.sized(Icons.camera, 18)} New Scan
             </a>
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 fade-in" style="animation-delay: 0.1s" id="dashboard-stats">
          <div class="glass rounded-2xl p-6 animate-pulse"><div class="h-16 bg-surface-800/30 rounded-xl"></div></div>
          <div class="glass rounded-2xl p-6 animate-pulse"><div class="h-16 bg-surface-800/30 rounded-xl"></div></div>
          <div class="glass rounded-2xl p-6 animate-pulse"><div class="h-16 bg-surface-800/30 rounded-xl"></div></div>
          <div class="glass rounded-2xl p-6 animate-pulse"><div class="h-16 bg-surface-800/30 rounded-xl"></div></div>
        </div>

        <div class="grid lg:grid-cols-3 gap-8 fade-in" style="animation-delay: 0.2s">
          <div class="lg:col-span-2 space-y-6">
            <div class="flex items-center justify-between">
              <h2 class="text-xs font-black text-surface-500 uppercase tracking-[0.2em] flex items-center gap-3">
                <span class="w-8 h-[1px] bg-brand-cyan/30"></span>
                Crop Health Monitor
              </h2>
              <div class="px-3 py-1 rounded-full bg-surface-900 border border-surface-800 text-[10px] font-black text-surface-400 uppercase tracking-widest" id="fields-count">...</div>
            </div>
            <div class="grid sm:grid-cols-2 gap-5" id="crop-health-grid">
              <div class="glass rounded-2xl p-6 h-40 animate-pulse"><div class="h-full bg-surface-800/20 rounded-xl"></div></div>
              <div class="glass rounded-2xl p-6 h-40 animate-pulse"><div class="h-full bg-surface-800/20 rounded-xl"></div></div>
            </div>
          </div>

          <div class="space-y-8">
            <section class="space-y-4">
              <h3 class="text-xs font-black text-surface-500 uppercase tracking-[0.2em] flex items-center gap-3">
                <span class="w-8 h-[1px] bg-brand-cyan/30"></span>
                Environment
              </h3>
              <div id="weather-widget" class="animate-scale-up"></div>
            </section>

            <section class="glass rounded-3xl p-6 premium-card">
              <h3 class="text-xs font-black text-surface-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                ${Icons.sized(Icons.zap, 14)} Quick Actions
              </h3>
              <div class="grid grid-cols-2 gap-4">
                <a href="#/scan" class="flex flex-col items-center justify-center gap-4 p-5 rounded-2xl bg-surface-950/50 hover:bg-brand-cyan/5 border border-surface-800/50 hover:border-brand-cyan/30 group transition-all duration-500">
                  <div class="w-12 h-12 rounded-2xl bg-surface-900 border border-surface-800 flex items-center justify-center text-surface-500 group-hover:text-brand-cyan group-hover:bg-brand-cyan/10 group-hover:rotate-12 transition-all duration-500 shadow-sm">${Icons.sized(Icons.scan, 24)}</div>
                  <span class="text-xs font-black text-surface-400 group-hover:text-white uppercase tracking-widest">Scanner</span>
                </a>
                <a href="#/marketplace" class="flex flex-col items-center justify-center gap-4 p-5 rounded-2xl bg-surface-950/50 hover:bg-brand-cyan/5 border border-surface-800/50 hover:border-brand-cyan/30 group transition-all duration-500">
                  <div class="w-12 h-12 rounded-2xl bg-surface-900 border border-surface-800 flex items-center justify-center text-surface-500 group-hover:text-brand-cyan group-hover:bg-brand-cyan/10 group-hover:-rotate-12 transition-all duration-500 shadow-sm">${Icons.sized(Icons.lightbulb, 24)}</div>
                  <span class="text-xs font-black text-surface-400 group-hover:text-white uppercase tracking-widest">Insights</span>
                </a>
              </div>
            </section>
          </div>
        </div>

        <section class="glass rounded-3xl p-8 space-y-8 fade-in" style="animation-delay: 0.3s">
          <div class="flex items-center justify-between">
            <h2 class="text-xs font-black text-surface-500 uppercase tracking-[0.2em] flex items-center gap-3">
              <span class="w-8 h-[1px] bg-brand-cyan/20"></span>
              Recent Diagnostics
            </h2>
            <a href="#/history" class="text-[11px] font-black text-brand-cyan hover:text-white uppercase tracking-widest inline-flex items-center gap-2 transition-colors">
              Full History ${Icons.sized(Icons.chevronRight, 14)}
            </a>
          </div>
          <div class="grid gap-4" id="recent-scans-list">
             <div class="py-12 text-center text-surface-600 text-sm font-medium italic opacity-50">Synchronizing diagnoses...</div>
          </div>
        </section>
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

    // Bind local events
    document.getElementById('refresh-dashboard')?.addEventListener('click', () => {
      DOM.toast('Refreshing dashboard data...', 'info');
      this.afterRender();
    });
  }
};
