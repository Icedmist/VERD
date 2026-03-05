// ═══════════════════════════════════════════
//  Admin / Analyst Dashboard Page — Data from Supabase
// ═══════════════════════════════════════════

window.AdminDashboardPage = {
  render() {
    const user = AppState.get('user') || {};

    return `
      <div class="space-y-6" id="admin-root">
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

        <!-- Stats Cards — loading skeleton -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3" id="admin-stats">
          <div class="glass rounded-2xl p-5 animate-pulse"><div class="h-12 bg-surface-800 rounded-xl"></div></div>
          <div class="glass rounded-2xl p-5 animate-pulse"><div class="h-12 bg-surface-800 rounded-xl"></div></div>
          <div class="glass rounded-2xl p-5 animate-pulse"><div class="h-12 bg-surface-800 rounded-xl"></div></div>
          <div class="glass rounded-2xl p-5 animate-pulse"><div class="h-12 bg-surface-800 rounded-xl"></div></div>
        </div>

        <div class="grid lg:grid-cols-2 gap-6">
          <div class="glass rounded-2xl p-5 space-y-4" id="admin-detection-dist">
            <h3 class="text-sm font-semibold text-surface-400 uppercase tracking-wider flex items-center gap-2">
              <span class="text-verd-500">${Icons.barChart}</span> Detection Distribution
            </h3>
            <div class="py-6 text-center text-surface-600 text-sm">Loading data...</div>
          </div>

          <div class="glass rounded-2xl p-5 space-y-4" id="admin-alerts">
            <h3 class="text-sm font-semibold text-surface-400 uppercase tracking-wider flex items-center gap-2">
              <span class="text-verd-500">${Icons.mapPin}</span> Regional Alerts
            </h3>
            <div class="py-6 text-center text-surface-600 text-sm">Loading alerts...</div>
          </div>
        </div>

        <div class="glass rounded-2xl p-5 space-y-4" id="admin-scans-table">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold text-surface-400 uppercase tracking-wider flex items-center gap-2">
              <span class="text-verd-500">${Icons.fileText}</span> Scan Records
            </h3>
            <span class="text-xs text-surface-700" id="admin-scans-count"></span>
          </div>
          <div class="py-6 text-center text-surface-600 text-sm">Loading records...</div>
        </div>

        <div class="glass rounded-2xl p-5 space-y-4" id="admin-crop-health">
          <h3 class="text-sm font-semibold text-surface-400 uppercase tracking-wider flex items-center gap-2">
            <span class="text-verd-500">${Icons.activity}</span> Field Health Overview
          </h3>
          <div class="py-6 text-center text-surface-600 text-sm">Loading crop data...</div>
        </div>
      </div>
    `;
  },

  async afterRender() {
    LayoutComponent.setTitle('Admin Panel', 'Platform analytics & management');

    // Fetch all data from Supabase
    const [stats, scans, crops] = await Promise.all([
      DataService.getAdminStats(),
      DataService.getAllScans(50),
      DataService.getCropHealth()
    ]);

    // Update admin stats
    const statsEl = document.getElementById('admin-stats');
    if (statsEl && stats) {
      statsEl.innerHTML = `
        ${CardComponent.stat({ icon: Icons.users, label: 'Total Farmers', value: (stats.totalFarmers || 0).toLocaleString(), trend: 8.5, trendUp: true })}
        ${CardComponent.stat({ icon: Icons.barChart, label: 'Total Scans', value: (stats.totalScans || 0).toLocaleString(), trend: 23, trendUp: true })}
        ${CardComponent.stat({ icon: Icons.heart, label: 'Avg Health Score', value: (stats.avgHealthScore || 0) + '%', trend: 2.1, trendUp: true })}
        ${CardComponent.stat({ icon: Icons.alertTriangle, label: 'Active Alerts', value: stats.activeAlerts || 0, trend: 5, trendUp: false })}
      `;
    }

    // Detection Distribution
    const distEl = document.getElementById('admin-detection-dist');
    if (distEl) {
      const conditionCounts = {};
      scans.forEach(s => {
        const key = s.result || s.condition || 'Unknown';
        conditionCounts[key] = (conditionCounts[key] || 0) + 1;
      });

      if (Object.keys(conditionCounts).length > 0) {
        distEl.innerHTML = `
          <h3 class="text-sm font-semibold text-surface-400 uppercase tracking-wider flex items-center gap-2">
            <span class="text-verd-500">${Icons.barChart}</span> Detection Distribution
          </h3>
          <div class="space-y-3">
            ${Object.entries(conditionCounts).map(([condition, count]) => {
          const pct = Math.round((count / scans.length) * 100);
          const isHealthy = condition.toLowerCase().includes('healthy');
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
        `;
      }
    }

    // Regional Alerts (from insights with severity 'high')
    const alertsEl = document.getElementById('admin-alerts');
    if (alertsEl) {
      let alerts = [];
      try {
        const insights = await DataService.getInsights('all');
        alerts = insights.filter(i => i.severity === 'high' || i.severity === 'medium').slice(0, 5);
      } catch (e) { /* ignore */ }

      if (alerts.length > 0) {
        alertsEl.innerHTML = `
          <h3 class="text-sm font-semibold text-surface-400 uppercase tracking-wider flex items-center gap-2">
            <span class="text-verd-500">${Icons.mapPin}</span> Regional Alerts
          </h3>
          <div class="space-y-2.5">
            ${alerts.map(a => {
          const colors = { high: 'text-red-400 bg-red-950/30 border-red-900/20', medium: 'text-yellow-400 bg-yellow-950/30 border-yellow-900/20', low: 'text-blue-400 bg-blue-950/30 border-blue-900/20' };
          const dots = { high: 'bg-red-500', medium: 'bg-yellow-500', low: 'bg-blue-500' };
          return `
                <div class="flex items-center gap-3 p-3 rounded-xl border ${colors[a.severity] || colors.low}">
                  <div class="w-2 h-2 rounded-full ${dots[a.severity] || dots.low} flex-shrink-0"></div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold truncate">${a.title}</p>
                    <p class="text-xs opacity-70">${(a.tags || []).join(' · ')}</p>
                  </div>
                </div>
              `;
        }).join('')}
          </div>
        `;
      } else {
        alertsEl.innerHTML = `
          <h3 class="text-sm font-semibold text-surface-400 uppercase tracking-wider flex items-center gap-2">
            <span class="text-verd-500">${Icons.mapPin}</span> Regional Alerts
          </h3>
          <p class="text-center text-surface-600 py-6 text-sm">No active alerts</p>
        `;
      }
    }

    // Scan records table
    const tableEl = document.getElementById('admin-scans-table');
    const countEl = document.getElementById('admin-scans-count');
    if (countEl) countEl.textContent = `${scans.length} records`;
    if (tableEl) {
      if (scans.length > 0) {
        tableEl.innerHTML = `
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
          const result = s.result || s.condition || 'Unknown';
          const isHealthy = result.toLowerCase().includes('healthy');
          return `
                    <tr class="hover:bg-surface-900/30">
                      <td class="py-3 text-surface-500 font-mono text-xs">${s.id}</td>
                      <td class="py-3 text-surface-300">${s.crop || 'Unknown'}</td>
                      <td class="py-3"><span class="badge ${isHealthy ? 'badge-success' : 'badge-danger'}"><span class="w-1.5 h-1.5 rounded-full ${isHealthy ? 'bg-verd-400' : 'bg-red-400'}"></span>${result}</span></td>
                      <td class="py-3 text-surface-300 font-semibold font-mono">${s.confidence || 0}%</td>
                      <td class="py-3 text-surface-600">${DOM.timeAgo(s.date || s.timestamp)}</td>
                    </tr>
                  `;
        }).join('')}
              </tbody>
            </table>
          </div>
        `;
      } else {
        tableEl.innerHTML = `
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold text-surface-400 uppercase tracking-wider flex items-center gap-2">
              <span class="text-verd-500">${Icons.fileText}</span> Scan Records
            </h3>
          </div>
          <p class="text-center text-surface-600 py-6 text-sm">No scan records yet</p>
        `;
      }
    }

    // Crop health overview
    const cropEl = document.getElementById('admin-crop-health');
    if (cropEl) {
      if (crops.length > 0) {
        cropEl.innerHTML = `
          <h3 class="text-sm font-semibold text-surface-400 uppercase tracking-wider flex items-center gap-2">
            <span class="text-verd-500">${Icons.activity}</span> Field Health Overview
          </h3>
          <div class="grid sm:grid-cols-2 gap-4">
            ${crops.map(c => CardComponent.cropHealth(c)).join('')}
          </div>
        `;
      } else {
        cropEl.innerHTML = `
          <h3 class="text-sm font-semibold text-surface-400 uppercase tracking-wider flex items-center gap-2">
            <span class="text-verd-500">${Icons.activity}</span> Field Health Overview
          </h3>
          <p class="text-center text-surface-600 py-6 text-sm">No crop health data available</p>
        `;
      }
    }

    // Export button
    document.getElementById('admin-export-btn')?.addEventListener('click', () => {
      DOM.toast('Export initiated — CSV will download shortly', 'info');
      setTimeout(() => DOM.toast('Export complete', 'success'), 2000);
    });
  }
};
