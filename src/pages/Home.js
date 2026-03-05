// ═══════════════════════════════════════════
//  Landing / Home Page (Introductory)
// ═══════════════════════════════════════════

window.HomePage = {
    render() {
        return `
      <div class="min-h-screen bg-surface-950 text-surface-200 overflow-hidden relative" id="landing-page">
        <!-- Background Orbs -->
        <div class="absolute top-0 left-1/4 w-96 h-96 bg-brand-cyan/20 rounded-full blur-[120px] mix-blend-screen opacity-50 animate-pulse-slow"></div>
        <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-blue/20 rounded-full blur-[120px] mix-blend-screen opacity-30"></div>

        <!-- Navigation -->
        <nav class="relative z-20 flex items-center justify-between px-6 py-4 lg:px-12 border-b border-surface-800/50 backdrop-blur-md">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-cyan to-brand-blue flex items-center justify-center text-white shadow-lg shadow-brand-cyan/20">
              ${Icons.leaf}
            </div>
            <span class="text-xl font-black text-white tracking-tight">VERD<span class="text-brand-cyan">.</span></span>
          </div>
          <div class="flex items-center gap-4">
            <button id="theme-toggle-landing" class="w-10 h-10 rounded-full bg-surface-800 flex items-center justify-center text-surface-400 hover:text-brand-cyan transition-colors">
              ${Icons.sun}
            </button>
            <a href="#/login" class="text-sm font-semibold text-surface-300 hover:text-white transition-colors hidden sm:block">Sign In</a>
            <a href="#/register" class="btn btn-primary text-sm px-5 py-2">Get Started</a>
          </div>
        </nav>

        <!-- Hero Section -->
        <main class="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-6 py-12 text-center stagger">
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan text-xs font-bold uppercase tracking-wider mb-8 fade-in">
            <span class="w-2 h-2 rounded-full bg-brand-cyan pulse-ring"></span>
            AI-Powered Agricultural Intelligence
          </div>
          
          <h1 class="text-5xl md:text-7xl font-black text-white tracking-tight leading-[1.1] max-w-4xl mb-6 fade-scale">
            Detect Plant Diseases with <span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-brand-blue">Clinical Precision</span>
          </h1>
          
          <p class="text-lg md:text-xl text-surface-400 max-w-2xl mb-10 leading-relaxed fade-in" style="animation-delay: 0.1s">
            Empowering modern farmers with instant ML diagnostics, real-time market data, and actionable field advisory to maximize harvest yield.
          </p>
          
          <div class="flex flex-col sm:flex-row items-center gap-4 fade-in" style="animation-delay: 0.2s">
            <a href="#/register" class="btn btn-primary text-base px-8 py-4 shadow-xl shadow-brand-cyan/20 w-full sm:w-auto">
              Start Scanning Now ${Icons.chevronRight}
            </a>
            <a href="#/login" class="btn btn-secondary text-base px-8 py-4 w-full sm:w-auto">
              Access Dashboard
            </a>
          </div>

          <!-- Feature Highlights -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-5xl w-full fade-in" style="animation-delay: 0.3s">
            <div class="glass rounded-2xl p-6 text-left hover:-translate-y-2 transition-transform duration-300">
              <div class="w-12 h-12 rounded-xl bg-surface-800 flex items-center justify-center text-brand-cyan mb-4">
                ${Icons.sized(Icons.scan, 24)}
              </div>
              <h3 class="text-lg font-bold text-white mb-2">49+ Disease Classes</h3>
              <p class="text-sm text-surface-500 leading-relaxed">Advanced Convolutional Neural Network trained on Sub-Saharan crop data for industry-leading accuracy.</p>
            </div>
            <div class="glass rounded-2xl p-6 text-left hover:-translate-y-2 transition-transform duration-300">
              <div class="w-12 h-12 rounded-xl bg-surface-800 flex items-center justify-center text-brand-cyan mb-4">
                ${Icons.sized(Icons.activity, 24)}
              </div>
              <h3 class="text-lg font-bold text-white mb-2">Offline-First Inference</h3>
              <p class="text-sm text-surface-500 leading-relaxed">Heavy ML models run directly on your device using TensorFlow.js. Reliable even in remote farmlands.</p>
            </div>
            <div class="glass rounded-2xl p-6 text-left hover:-translate-y-2 transition-transform duration-300">
              <div class="w-12 h-12 rounded-xl bg-surface-800 flex items-center justify-center text-brand-cyan mb-4">
                ${Icons.sized(Icons.cloud, 24)}
              </div>
              <h3 class="text-lg font-bold text-white mb-2">Supabase Sync</h3>
              <p class="text-sm text-surface-500 leading-relaxed">All diagnostic records, field history, and telemetry perfectly synchronized with a robust cloud backend.</p>
            </div>
          </div>
        </main>
      </div>
    `;
    },

    bindEvents() {
        document.getElementById('theme-toggle-landing')?.addEventListener('click', () => {
            const isLight = document.documentElement.getAttribute('data-theme') === 'light';
            document.documentElement.setAttribute('data-theme', isLight ? 'dark' : 'light');
            localStorage.setItem('verd-theme', isLight ? 'dark' : 'light');
        });
    }
};
