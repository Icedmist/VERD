// ═══════════════════════════════════════════
//  Marketplace / Insights Page — Data from Supabase
// ═══════════════════════════════════════════

window.MarketplacePage = {
  _insights: [],
  _loaded: false,

  render() {
    const categories = [
      { id: 'all', label: 'All', icon: Icons.sized(Icons.activity, 14) },
      { id: 'pest', label: 'Pest Alerts', icon: Icons.sized(Icons.alertTriangle, 14) },
      { id: 'disease', label: 'Diseases', icon: Icons.sized(Icons.shieldCheck, 14) },
      { id: 'soil', label: 'Soil Health', icon: Icons.sized(Icons.beaker, 14) },
      { id: 'seasonal', label: 'Seasonal', icon: Icons.sized(Icons.sprout, 14) },
      { id: 'market', label: 'Market', icon: Icons.sized(Icons.barChart, 14) },
      { id: 'climate', label: 'Climate', icon: Icons.sized(Icons.sun, 14) },
    ];

    return `
      <div class="space-y-6" id="marketplace-root">
        <div>
          <h1 class="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">Insights & Advisory</h1>
          <p class="text-surface-500 mt-1 text-sm">Localized agricultural intelligence and market data</p>
        </div>

        <div class="flex flex-wrap gap-2" id="category-filters">
          ${categories.map(c => `
            <button data-category="${c.id}" class="category-btn inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium ${c.id === 'all' ? 'bg-verd-600 text-white' : 'bg-surface-800 text-surface-500 hover:bg-surface-700 border border-surface-700'}">
              ${c.icon} ${c.label}
            </button>
          `).join('')}
        </div>

        <div class="grid md:grid-cols-2 gap-4" id="insights-grid">
          <div class="glass rounded-2xl p-5 animate-pulse"><div class="h-24 bg-surface-800 rounded-xl"></div></div>
          <div class="glass rounded-2xl p-5 animate-pulse"><div class="h-24 bg-surface-800 rounded-xl"></div></div>
          <div class="glass rounded-2xl p-5 animate-pulse"><div class="h-24 bg-surface-800 rounded-xl"></div></div>
          <div class="glass rounded-2xl p-5 animate-pulse"><div class="h-24 bg-surface-800 rounded-xl"></div></div>
        </div>
      </div>
    `;
  },

  async bindEvents() {
    LayoutComponent.setTitle('Insights', 'Agricultural advisory & market intelligence');

    // Fetch insights from Supabase
    try {
      this._insights = await DataService.getInsights('all');
      this._loaded = true;
    } catch (e) {
      console.warn('Failed to load insights:', e);
      this._insights = [];
      this._loaded = true;
    }

    // Render insights
    this._renderInsights(this._insights);

    // Category filter events
    DOM.on('#category-filters', 'click', '.category-btn', async (e, btn) => {
      const category = btn.dataset.category;

      document.querySelectorAll('.category-btn').forEach(b => {
        b.className = 'category-btn inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium bg-surface-800 text-surface-500 hover:bg-surface-700 border border-surface-700';
      });
      btn.className = 'category-btn inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium bg-verd-600 text-white';

      // Filter from already loaded data or re-fetch
      if (category === 'all') {
        this._renderInsights(this._insights);
      } else {
        const filtered = this._insights.filter(i => i.category === category);
        this._renderInsights(filtered);
      }
    });
  },

  _renderInsights(insights) {
    const grid = document.getElementById('insights-grid');
    if (!grid) return;

    if (insights.length === 0) {
      grid.innerHTML = `
        <div class="md:col-span-2 glass rounded-2xl p-12 text-center">
          <div class="w-16 h-16 rounded-2xl bg-surface-800 flex items-center justify-center text-surface-500 mx-auto mb-4">${Icons.sized(Icons.lightbulb, 28)}</div>
          <h3 class="text-lg font-bold text-surface-300 mb-2">No Insights Available</h3>
          <p class="text-surface-600 text-sm">Agricultural insights and advisory data will appear here once published.</p>
        </div>
      `;
      return;
    }

    // Map icon names from DB to actual icon SVGs
    const iconMap = {
      'alertTriangle': Icons.alertTriangle,
      'sprout': Icons.sprout,
      'beaker': Icons.beaker,
      'droplets': Icons.droplets,
      'leaf': Icons.leaf,
      'wheat': Icons.wheat,
      'barChart': Icons.barChart,
      'sun': Icons.sun,
      'heart': Icons.heart,
      'shieldCheck': Icons.shieldCheck,
    };

    grid.innerHTML = insights.map(i => {
      const icon = (typeof i.icon === 'string') ? (iconMap[i.icon] || Icons.leaf) : (i.icon || Icons.leaf);
      return `
        <div class="insight-card" data-category="${i.category}">
          ${CardComponent.advisory({
        icon,
        title: i.title,
        description: i.description,
        tags: i.tags || [],
        severity: i.severity
      })}
        </div>
      `;
    }).join('');
  }
};
