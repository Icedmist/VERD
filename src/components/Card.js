// ═══════════════════════════════════════════
//  Card Component
// ═══════════════════════════════════════════

window.CardComponent = {
  stat({ icon, label, value, trend, trendUp }) {
    const trendColor = trendUp ? 'text-verd-400' : 'text-red-400';
    const trendSvg = trendUp ? Icons.trendingUp : Icons.trendingDown;
    return `
      <div class="glass rounded-2xl p-5 premium-card group">
        <div class="flex items-center justify-between mb-4">
          <div class="w-10 h-10 rounded-xl bg-surface-800/50 flex items-center justify-center text-brand-cyan group-hover:bg-brand-cyan/20 group-hover:scale-110 transition-all duration-500 shadow-sm">
            ${Icons.sized(icon, 20)}
          </div>
          ${trend !== undefined ? `
            <div class="px-2 py-1 rounded-lg bg-surface-800/30 flex items-center gap-1.5 border border-surface-800/50">
              <span class="${trendColor} scale-90">${trendSvg}</span>
              <span class="text-[11px] font-bold ${trendColor}">${trend}%</span>
            </div>
          ` : ''}
        </div>
        <div class="space-y-1">
          <div class="text-3xl font-black text-white tracking-tight leading-none">${value}</div>
          <div class="text-[11px] font-bold text-surface-500 uppercase tracking-widest">${label}</div>
        </div>
      </div>
    `;
  },

  cropHealth({ id, crop, field, health, status, issues, lastScan }) {
    const statusConfig = {
      excellent: { bar: 'bg-verd-500', text: 'text-verd-400', ring: 'ring-excellent', dot: 'dot-excellent', shadow: 'shadow-verd-900/20' },
      good: { bar: 'bg-lime-500', text: 'text-lime-400', ring: 'ring-good', dot: 'dot-good', shadow: 'shadow-lime-900/20' },
      warning: { bar: 'bg-yellow-500', text: 'text-yellow-400', ring: 'ring-warning', dot: 'dot-warning', shadow: 'shadow-yellow-900/20' },
      danger: { bar: 'bg-red-500', text: 'text-red-400', ring: 'ring-danger', dot: 'dot-danger', shadow: 'shadow-red-900/20' }
    };
    const s = statusConfig[status] || statusConfig.good;
    const cropIcons = {
      'Maize': Icons.wheat, 'Cassava': Icons.sprout, 'Tomatoes': Icons.leaf,
      'Rice': Icons.wheat, 'Wheat': Icons.wheat, 'Coffee': Icons.leaf, 'Corn': Icons.wheat
    };
    const icon = cropIcons[crop] || Icons.leaf;

    return `
      <div class="glass rounded-2xl p-6 premium-card group border-l-4 ${s.ring.replace('border-', 'border-l-')}" data-crop-id="${id}">
        <div class="flex items-center justify-between mb-5">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-surface-900 flex items-center justify-center text-brand-cyan group-hover:bg-brand-cyan/10 group-hover:scale-105 transition-all duration-500 border border-surface-800/50 shadow-inner">
              ${Icons.sized(icon, 24)}
            </div>
            <div>
              <h4 class="font-black text-white text-lg tracking-tight leading-tight">${crop}</h4>
              <p class="text-xs font-medium text-surface-500 flex items-center gap-1">
                ${Icons.sized(Icons.mapPin, 10)} ${field}
              </p>
            </div>
          </div>
          <div class="text-right">
            <div class="text-3xl font-black ${s.text} tracking-tighter leading-none">${health}%</div>
            <div class="text-[10px] font-black uppercase tracking-widest ${s.text} opacity-80 mt-1">${status}</div>
          </div>
        </div>

        <div class="space-y-3">
          <div class="w-full bg-surface-950 rounded-full h-2 overflow-hidden ring-1 ring-white/5 shadow-inner">
            <div class="${s.bar} h-full rounded-full shadow-[0_0_12px_rgba(26,175,99,0.3)]" style="width: ${health}%; transition: width 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)"></div>
          </div>

          ${issues.length > 0 ? `
            <div class="flex flex-wrap gap-2 py-1">
              ${issues.map(issue => `
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-900/80 border border-surface-800/50 text-[10px] font-bold text-surface-400 group-hover:text-surface-200 transition-colors">
                  <span class="w-1 h-1 rounded-full ${s.bar}"></span>
                  ${issue}
                </span>
              `).join('')}
            </div>
          ` : `
            <div class="flex items-center gap-2 py-1 text-[11px] font-semibold text-verd-400">
               ${Icons.checkCircle} Optimal growth conditions
            </div>
          `}
        </div>

        <div class="flex items-center justify-between pt-5 mt-4 border-t border-surface-800/30">
          <div class="flex items-center gap-2 text-[10px] font-bold text-surface-600 uppercase tracking-wider">
            ${Icons.sized(Icons.clock, 12)} ${DOM.formatDate(lastScan)}
          </div>
          <a href="#/scan" class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-cyan/10 text-brand-cyan text-xs font-black hover:bg-brand-cyan/20 transition-all border border-brand-cyan/20">
            Scanner ${Icons.chevronRight}
          </a>
        </div>
      </div>
    `;
  },

  scanRow({ id, crop, date, result, confidence }) {
    const isHealthy = result === 'Healthy' || result === 'Healthy Crop Tissue';
    const status = isHealthy ? 'excellent' : confidence > 80 ? 'danger' : 'warning';
    const colors = {
      excellent: { text: 'text-verd-400', bg: 'bg-verd-950/30', border: 'border-verd-900/20', dot: 'bg-verd-500 shadow-[0_0_8px_#1aaf63]' },
      danger: { text: 'text-red-400', bg: 'bg-red-950/30', border: 'border-red-900/20', dot: 'bg-red-500 shadow-[0_0_8px_#ef4444]' },
      warning: { text: 'text-yellow-400', bg: 'bg-yellow-950/30', border: 'border-yellow-900/20', dot: 'bg-yellow-500 shadow-[0_0_8px_#eab308]' }
    };
    const c = colors[status];

    return `
      <div class="flex items-center justify-between p-4 hover:bg-surface-800/40 bg-surface-900/20 rounded-2xl border border-transparent hover:border-surface-800 group cursor-pointer transition-all duration-300" data-scan-id="${id}">
        <div class="flex items-center gap-4">
          <div class="w-3 h-3 rounded-full ${c.dot} group-hover:scale-125 transition-transform duration-500"></div>
          <div>
            <div class="text-sm font-black text-white tracking-tight">${result}</div>
            <div class="flex items-center gap-2 mt-0.5">
              <span class="text-[10px] font-bold text-surface-500 uppercase tracking-widest">${crop}</span>
              <span class="w-1 h-1 rounded-full bg-surface-700"></span>
              <span class="text-[10px] font-medium text-surface-600">${DOM.timeAgo(date)}</span>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <div class="text-right">
            <div class="text-lg font-black ${c.text} tracking-tighter">${confidence}%</div>
            <div class="text-[9px] font-black uppercase tracking-widest text-surface-700">confidence</div>
          </div>
          <div class="w-8 h-8 rounded-lg bg-surface-800/50 flex items-center justify-center text-surface-600 group-hover:text-brand-cyan group-hover:bg-brand-cyan/10 transition-all">
            ${Icons.chevronRight}
          </div>
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
