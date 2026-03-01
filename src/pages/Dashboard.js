// ═══════════════════════════════════════════
//  Farmer Dashboard Page
// ═══════════════════════════════════════════

window.DashboardPage = {
  render() {
    const user = AppState.get('user') || {};
    const crops = AppState.get('cropHealthData') || [];
    const scans = AppState.get('recentScans') || [];
    const avgHealth = crops.length ? Math.round(crops.reduce((a, c) => a + c.health, 0) / crops.length) : 0;

    const greeting = (() => {
      const h = new Date().getHours();
      if (h < 12) return 'Good morning';
      if (h < 17) return 'Good afternoon';
      return 'Good evening';
    })();

    return `
      <div class="space-y-6 stagger">
        <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">${greeting}, ${user.displayName || 'Farmer'}</h1>
            <p class="text-surface-500 mt-1 text-sm">Here's your farm overview for today</p>
          </div>
          <a href="#/scan" class="btn btn-primary">
            ${Icons.scan} New Scan
          </a>
        </div>

        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
          ${CardComponent.stat({ icon: Icons.heart, label: 'Avg Crop Health', value: avgHealth + '%', trend: 3.2, trendUp: true })}
          ${CardComponent.stat({ icon: Icons.barChart, label: 'Total Scans', value: scans.length, trend: 12, trendUp: true })}
          ${CardComponent.stat({ icon: Icons.sprout, label: 'Active Fields', value: crops.length })}
          ${CardComponent.stat({ icon: Icons.alertTriangle, label: 'Active Alerts', value: crops.filter(c => c.status === 'danger' || c.status === 'warning').length, trend: 1, trendUp: false })}
        </div>

        <div class="grid lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-sm font-semibold text-surface-400 uppercase tracking-wider flex items-center gap-2">
                <span class="text-verd-500">${Icons.activity}</span> Crop Health Monitor
              </h2>
              <span class="text-xs text-surface-700">${crops.length} fields</span>
            </div>
            <div class="grid sm:grid-cols-2 gap-4 stagger">
              ${crops.map(c => CardComponent.cropHealth(c)).join('')}
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
            <a href="#/scan" class="text-xs text-verd-500 hover:text-verd-400 font-semibold inline-flex items-center gap-1">View all ${Icons.chevronRight}</a>
          </div>
          <div class="divide-y divide-surface-800/30">
            ${scans.slice(0, 5).map(s => CardComponent.scanRow(s)).join('')}
          </div>
          ${scans.length === 0 ? `<p class="text-center text-surface-600 py-8 text-sm">No scans yet. Start by analyzing your first crop.</p>` : ''}
        </div>
      </div>
    `;
  },

  async afterRender() {
    LayoutComponent.setTitle('Dashboard', 'Farm overview & crop health');
    const w = document.getElementById('weather-widget');
    if (w) await WeatherWidget.render(w);
  }
};
