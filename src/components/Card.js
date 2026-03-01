// ═══════════════════════════════════════════
//  Card Component
// ═══════════════════════════════════════════

window.CardComponent = {
  stat({ icon, label, value, trend, trendUp }) {
    const trendColor = trendUp ? 'text-verd-400' : 'text-red-400';
    const trendSvg = trendUp ? Icons.trendingUp : Icons.trendingDown;
    return `
      <div class="glass rounded-2xl p-5 group hover:border-surface-700">
        <div class="flex items-center justify-between mb-3">
          <div class="w-9 h-9 rounded-xl bg-surface-800 flex items-center justify-center text-verd-500 group-hover:bg-verd-950/50">${icon}</div>
          ${trend !== undefined ? `<span class="flex items-center gap-1 text-xs font-semibold ${trendColor}">${trendSvg} ${trend}%</span>` : ''}
        </div>
        <div class="text-2xl font-extrabold text-white tracking-tight mb-0.5">${value}</div>
        <div class="text-sm text-surface-500">${label}</div>
      </div>
    `;
  },

  cropHealth({ crop, field, health, status, issues, lastScan }) {
    const statusConfig = {
      excellent: { bar: 'bg-verd-500', text: 'text-verd-400', ring: 'ring-excellent', dot: 'dot-excellent' },
      good: { bar: 'bg-lime-500', text: 'text-lime-400', ring: 'ring-good', dot: 'dot-good' },
      warning: { bar: 'bg-yellow-500', text: 'text-yellow-400', ring: 'ring-warning', dot: 'dot-warning' },
      danger: { bar: 'bg-red-500', text: 'text-red-400', ring: 'ring-danger', dot: 'dot-danger' }
    };
    const s = statusConfig[status] || statusConfig.good;
    const cropIcons = {
      'Maize': Icons.wheat, 'Cassava': Icons.sprout, 'Tomatoes': Icons.leaf,
      'Rice': Icons.wheat, 'Wheat': Icons.wheat, 'Coffee': Icons.leaf
    };
    const icon = cropIcons[crop] || Icons.leaf;

    return `
      <div class="glass rounded-2xl p-5 border ${s.ring} hover:border-surface-600">
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-surface-800 flex items-center justify-center text-verd-500">${icon}</div>
            <div>
              <h4 class="font-bold text-white">${crop}</h4>
              <p class="text-xs text-surface-600">${field}</p>
            </div>
          </div>
          <div class="text-right">
            <div class="text-2xl font-extrabold ${s.text} tracking-tight">${health}%</div>
            <div class="text-xs text-surface-600 capitalize">${status}</div>
          </div>
        </div>

        <div class="w-full bg-surface-800 rounded-full h-1.5 mb-3">
          <div class="${s.bar} h-1.5 rounded-full" style="width: ${health}%; transition: width 1s ease-out"></div>
        </div>

        ${issues.length > 0 ? `
          <div class="space-y-1.5 mb-3">
            ${issues.map(issue => `
              <div class="flex items-center gap-2 text-xs text-surface-400">
                <span class="w-1 h-1 rounded-full ${s.bar} flex-shrink-0"></span>
                ${issue}
              </div>
            `).join('')}
          </div>
        ` : ''}

        <div class="flex items-center justify-between text-xs text-surface-600 pt-3 border-t border-surface-800/50">
          <span>Last scan: ${DOM.formatDate(lastScan)}</span>
          <a href="#/scan" class="text-verd-500 hover:text-verd-400 font-semibold inline-flex items-center gap-1">Rescan ${Icons.chevronRight}</a>
        </div>
      </div>
    `;
  },

  scanRow({ id, crop, date, result, confidence }) {
    const isHealthy = result === 'Healthy' || result === 'Healthy Crop Tissue';
    const dotColor = isHealthy ? 'bg-verd-500' : confidence > 80 ? 'bg-red-500' : 'bg-yellow-500';
    return `
      <div class="flex items-center justify-between py-3 px-4 hover:bg-surface-900/60 rounded-xl group cursor-pointer" data-scan-id="${id}">
        <div class="flex items-center gap-3">
          <div class="w-2 h-2 rounded-full ${dotColor}"></div>
          <div>
            <span class="text-sm font-semibold text-surface-200">${result}</span>
            <p class="text-xs text-surface-600">${crop} &middot; ${DOM.timeAgo(date)}</p>
          </div>
        </div>
        <div class="text-right">
          <span class="text-sm font-bold text-surface-300 font-mono">${confidence}%</span>
          <p class="text-xs text-surface-700">confidence</p>
        </div>
      </div>
    `;
  },

  advisory({ icon, title, description, tags, severity }) {
    const borderColors = { low: 'border-l-verd-600', medium: 'border-l-yellow-600', high: 'border-l-red-600' };
    return `
      <div class="glass rounded-2xl p-5 border-l-[3px] ${borderColors[severity] || 'border-l-verd-600'} hover:bg-surface-900/40">
        <div class="flex items-start gap-3 mb-3">
          <div class="w-9 h-9 rounded-xl bg-surface-800 flex items-center justify-center text-surface-400 flex-shrink-0">${icon}</div>
          <div>
            <h4 class="font-bold text-white text-sm">${title}</h4>
            <p class="text-sm text-surface-500 mt-1.5 leading-relaxed">${description}</p>
          </div>
        </div>
        ${tags ? `
          <div class="flex flex-wrap gap-1.5 mt-3 ml-12">
            ${tags.map(t => `<span class="text-xs bg-surface-800 text-surface-500 px-2 py-0.5 rounded-md">${t}</span>`).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }
};
