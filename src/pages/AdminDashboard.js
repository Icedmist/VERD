// ═══════════════════════════════════════════
//  Admin / Analyst Dashboard Page
// ═══════════════════════════════════════════

window.AdminDashboardPage = {
  render() {
    const user = AppState.get('user') || {};
    const stats = AppState.get('adminStats');
    const scans = AppState.get('recentScans') || [];
    const crops = AppState.get('cropHealthData') || [];

    const conditionCounts = {};
    scans.forEach(s => {
      const key = s.result || 'Unknown';
      conditionCounts[key] = (conditionCounts[key] || 0) + 1;
    });

    return `
      <div class="space-y-6 stagger">
        <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">Admin Panel</h1>
            <p class="text-surface-500 mt-1 text-sm">System overview and analytics</p>
          </div>
          <div class="flex gap-3">
            <a href="#/scan" class="btn btn-secondary">${Icons.scan} New Scan</a>
            <button id="admin-export-btn" class="btn btn-primary">${Icons.download} Export</button>
          </div>
        </div>

        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
          ${CardComponent.stat({ icon: Icons.users, label: 'Total Farmers', value: stats.totalFarmers.toLocaleString(), trend: 8.5, trendUp: true })}
          ${CardComponent.stat({ icon: Icons.barChart, label: 'Total Scans', value: stats.totalScans.toLocaleString(), trend: 23, trendUp: true })}
          ${CardComponent.stat({ icon: Icons.heart, label: 'Avg Health Score', value: stats.avgHealthScore + '%', trend: 2.1, trendUp: true })}
          ${CardComponent.stat({ icon: Icons.alertTriangle, label: 'Active Alerts', value: stats.activeAlerts, trend: 5, trendUp: false })}
        </div>

        <div class="grid lg:grid-cols-2 gap-6">
          <div class="glass rounded-2xl p-5 space-y-4">
            <h3 class="text-sm font-semibold text-surface-400 uppercase tracking-wider flex items-center gap-2">
              <span class="text-verd-500">${Icons.barChart}</span> Detection Distribution
            </h3>
            <div class="space-y-3">
              ${Object.entries(conditionCounts).map(([condition, count]) => {
      const pct = Math.round((count / scans.length) * 100);
      const isHealthy = condition === 'Healthy';
      const barColor = isHealthy ? 'bg-verd-500' : 'bg-yellow-500';
      return `
                  <div>
                    <div class="flex items-center justify-between mb-1.5">
                      <span class="text-sm text-surface-300">${condition}</span>
                      <span class="text-sm font-bold text-surface-500 font-mono">${count} (${pct}%)</span>
                    </div>
                    <div class="w-full bg-surface-800 rounded-full h-2">
                      <div class="${barColor} h-2 rounded-full" style="width: ${pct}%; transition: width 1s"></div>
                    </div>
                  </div>
                `;
    }).join('')}
            </div>
          </div>

          <div class="glass rounded-2xl p-5 space-y-4">
            <h3 class="text-sm font-semibold text-surface-400 uppercase tracking-wider flex items-center gap-2">
              <span class="text-verd-500">${Icons.mapPin}</span> Regional Alerts
            </h3>
            <div class="space-y-2.5">
              ${[
        { region: 'Western Kenya', alert: 'Fall Armyworm outbreak', severity: 'high', farmers: 234 },
        { region: 'Rift Valley', alert: 'Drought advisory', severity: 'high', farmers: 189 },
        { region: 'Central Nigeria', alert: 'Cassava Mosaic spread', severity: 'medium', farmers: 456 },
        { region: 'Eastern Uganda', alert: 'Low soil nitrogen', severity: 'low', farmers: 87 },
        { region: 'Northern Tanzania', alert: 'Coffee rust detected', severity: 'medium', farmers: 132 }
      ].map(a => {
        const colors = { high: 'text-red-400 bg-red-950/30 border-red-900/20', medium: 'text-yellow-400 bg-yellow-950/30 border-yellow-900/20', low: 'text-blue-400 bg-blue-950/30 border-blue-900/20' };
        const dots = { high: 'bg-red-500', medium: 'bg-yellow-500', low: 'bg-blue-500' };
        return `
                  <div class="flex items-center gap-3 p-3 rounded-xl border ${colors[a.severity]}">
                    <div class="w-2 h-2 rounded-full ${dots[a.severity]} flex-shrink-0"></div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-semibold truncate">${a.alert}</p>
                      <p class="text-xs opacity-70">${a.region} &middot; ${a.farmers} farmers affected</p>
                    </div>
                  </div>
                `;
      }).join('')}
            </div>
          </div>
        </div>

        <div class="glass rounded-2xl p-5 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold text-surface-400 uppercase tracking-wider flex items-center gap-2">
              <span class="text-verd-500">${Icons.fileText}</span> Scan Records
            </h3>
            <span class="text-xs text-surface-700">${scans.length} records</span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-surface-800 text-left">
                  <th class="pb-3 text-surface-600 font-medium text-xs uppercase tracking-wider">ID</th>
                  <th class="pb-3 text-surface-600 font-medium text-xs uppercase tracking-wider">Crop</th>
                  <th class="pb-3 text-surface-600 font-medium text-xs uppercase tracking-wider">Result</th>
                  <th class="pb-3 text-surface-600 font-medium text-xs uppercase tracking-wider">Confidence</th>
                  <th class="pb-3 text-surface-600 font-medium text-xs uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-surface-800/30">
                ${scans.map(s => {
        const isHealthy = s.result === 'Healthy' || s.result === 'Healthy Crop Tissue';
        return `
                    <tr class="hover:bg-surface-900/30">
                      <td class="py-3 text-surface-500 font-mono text-xs">${s.id}</td>
                      <td class="py-3 text-surface-300">${s.crop}</td>
                      <td class="py-3"><span class="badge ${isHealthy ? 'badge-success' : 'badge-danger'}"><span class="w-1.5 h-1.5 rounded-full ${isHealthy ? 'bg-verd-400' : 'bg-red-400'}"></span>${s.result}</span></td>
                      <td class="py-3 text-surface-300 font-semibold font-mono">${s.confidence}%</td>
                      <td class="py-3 text-surface-600">${DOM.timeAgo(s.date)}</td>
                    </tr>
                  `;
      }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="glass rounded-2xl p-5 space-y-4">
          <h3 class="text-sm font-semibold text-surface-400 uppercase tracking-wider flex items-center gap-2">
            <span class="text-verd-500">${Icons.activity}</span> Field Health Overview
          </h3>
          <div class="grid sm:grid-cols-2 gap-4">
            ${crops.map(c => CardComponent.cropHealth(c)).join('')}
          </div>
        </div>
      </div>
    `;
  },

  afterRender() {
    LayoutComponent.setTitle('Admin Panel', 'Platform analytics & management');
    document.getElementById('admin-export-btn')?.addEventListener('click', () => {
      DOM.toast('Export initiated — CSV will download shortly', 'info');
      setTimeout(() => DOM.toast('Export complete', 'success'), 2000);
    });
  }
};
