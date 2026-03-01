// ═══════════════════════════════════════════
//  Marketplace / Insights Page
// ═══════════════════════════════════════════

window.MarketplacePage = {
  render() {
    const insights = [
      {
        icon: Icons.alertTriangle, title: 'Fall Armyworm Alert — Western Region',
        description: 'Increased Fall Armyworm activity reported across maize fields in Western Kenya. Early detection is critical. Use push-pull farming technique with Desmodium as a companion crop. Apply Bt-based biological pesticides as a first line of defense.',
        tags: ['Maize', 'Pest Control', 'Western Kenya'], severity: 'high', category: 'pest'
      },
      {
        icon: Icons.sprout, title: 'Optimal Planting Window — March 2026',
        description: 'The long rains season is approaching. Ideal planting period for maize begins mid-March. Prepare fields now with proper tillage and soil amendments. Ensure certified seed is sourced from KEPHIS-approved dealers.',
        tags: ['Seasonal', 'Maize', 'Rice', 'Planning'], severity: 'medium', category: 'seasonal'
      },
      {
        icon: Icons.beaker, title: 'Soil Health: Nitrogen Management',
        description: 'After continuous maize cultivation, many fields in the region show declining nitrogen levels. Consider rotating with legumes (beans, cowpeas) to fix nitrogen naturally. Supplement with urea at 50kg/acre during top-dressing.',
        tags: ['Soil Health', 'Fertilizer', 'Crop Rotation'], severity: 'medium', category: 'soil'
      },
      {
        icon: Icons.droplets, title: 'Water Conservation Techniques',
        description: 'With erratic rainfall patterns, implement water harvesting using tied ridges and contour planting. Mulching with crop residues reduces evaporation by up to 40%. Drip irrigation kits are available through county subsidies.',
        tags: ['Irrigation', 'Climate Adaptation', 'Water'], severity: 'low', category: 'water'
      },
      {
        icon: Icons.leaf, title: 'Tomato Early Blight Prevention',
        description: 'Preventive measures are key for early blight control. Apply copper-based fungicides every 7-10 days during wet seasons. Ensure proper spacing (60cm x 45cm) for air circulation. Stake tomatoes to keep foliage off wet soil.',
        tags: ['Tomatoes', 'Disease Prevention', 'Fungicide'], severity: 'medium', category: 'disease'
      },
      {
        icon: Icons.wheat, title: 'Cassava Best Practices for 2026',
        description: 'Plant TME 419 or NAROCASS 1 resistant varieties to combat Cassava Brown Streak Disease. Maintain 1m x 1m spacing. Harvest industrial varieties at 12 months and sweet varieties at 8-10 months for optimal starch content.',
        tags: ['Cassava', 'Varieties', 'Best Practices'], severity: 'low', category: 'guide'
      },
      {
        icon: Icons.barChart, title: 'Market Prices — Weekly Update',
        description: 'Current farm-gate prices (per 90kg bag): Maize KES 3,500 (+5%), Beans KES 8,200 (-2%), Rice KES 5,800 (+3%). Best markets this week: Nairobi, Kisumu, Mombasa. Consider timing your sales with the price uptrend.',
        tags: ['Market Prices', 'Economics', 'Sales'], severity: 'low', category: 'market'
      },
      {
        icon: Icons.sun, title: 'Climate Advisory: Heat Stress Management',
        description: 'Expected temperatures above 32 degrees C through mid-March. Irrigate early morning or late evening to reduce water loss. Consider shade netting for sensitive crops like lettuce and spinach. Monitor livestock for heat stress symptoms.',
        tags: ['Climate', 'Heat', 'Irrigation'], severity: 'high', category: 'climate'
      }
    ];

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
      <div class="space-y-6 stagger">
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

        <div class="grid md:grid-cols-2 gap-4 stagger" id="insights-grid">
          ${insights.map(i => `
            <div class="insight-card" data-category="${i.category}">
              ${CardComponent.advisory(i)}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  bindEvents() {
    LayoutComponent.setTitle('Insights', 'Agricultural advisory & market intelligence');

    DOM.on('#category-filters', 'click', '.category-btn', (e, btn) => {
      const category = btn.dataset.category;

      document.querySelectorAll('.category-btn').forEach(b => {
        b.className = 'category-btn inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium bg-surface-800 text-surface-500 hover:bg-surface-700 border border-surface-700';
      });
      btn.className = 'category-btn inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium bg-verd-600 text-white';

      document.querySelectorAll('.insight-card').forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
          card.style.display = '';
          card.classList.add('fade-in');
        } else {
          card.style.display = 'none';
        }
      });
    });
  }
};
