// ═══════════════════════════════════════════
//  Landing / Home Page (Premium Redesign Phase 2)
// ═══════════════════════════════════════════

window.HomePage = {
  render() {
    return `
      <div class="min-h-screen bg-brand-dark text-surface-200 overflow-hidden relative" id="landing-page">
        <!-- Background Premium Effects -->
        <div class="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
          <!-- Large Background Neural Canvas (Strong/Solid) -->
          <canvas id="homepage-bg-anim-canvas" class="absolute inset-0 w-full h-full opacity-40 mix-blend-screen"></canvas>
          
          <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-cyan/15 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow"></div>
          <div class="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-blue/15 rounded-full blur-[150px] mix-blend-screen"></div>
        </div>

        <!-- Navigation -->
        <nav class="relative z-50 px-6 py-6 lg:px-12 flex items-center justify-between border-b border-surface-800/30 backdrop-blur-xl bg-brand-dark/60">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-brand-blue flex items-center justify-center text-white shadow-xl shadow-brand-blue/20 rotate-3 transition-transform hover:rotate-0">
              ${Icons.leaf}
            </div>
            <div class="flex flex-col">
              <span class="text-2xl font-black text-white tracking-tighter leading-none">VERD<span class="text-brand-cyan">.</span></span>
              <span class="text-[10px] uppercase tracking-[0.2em] text-surface-500 font-bold">Crop Intelligence</span>
            </div>
          </div>
          <div class="flex items-center gap-8">
            <div class="hidden lg:flex items-center gap-10">
              <a href="#/home" class="text-xs font-black uppercase tracking-widest text-white hover:text-brand-cyan transition-colors">Vision</a>
              <a href="#features" class="text-xs font-black uppercase tracking-widest text-surface-400 hover:text-white transition-colors">Features</a>
              <a href="https://github.com/Icedmist/VERD" target="_blank" class="text-xs font-black uppercase tracking-widest text-surface-400 hover:text-white transition-colors">Open Source</a>
            </div>
            <div class="flex items-center gap-4">
              <a href="#/login" class="text-sm font-bold text-surface-400 hover:text-white transition-all">Sign In</a>
              <a href="#/register" class="bg-brand-cyan hover:bg-brand-cyan/90 text-brand-dark font-black px-8 py-3 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-brand-cyan/25">
                Join Network
              </a>
            </div>
          </div>
        </nav>

        <!-- Hero Section -->
        <main class="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-20">
          <div class="flex flex-col lg:flex-row items-center gap-20">
            <!-- Left: Text Content -->
            <div class="flex-1 text-center lg:text-left stagger">
              <div class="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-brand-cyan/5 border border-brand-cyan/10 text-brand-cyan text-[10px] font-black uppercase tracking-[0.15em] mb-10 fade-in">
                <span class="w-2 h-2 rounded-full bg-brand-cyan pulse-ring"></span>
                Inference Protocol v4.2 Active
              </div>
              
              <h1 class="text-6xl md:text-[5.5rem] font-black text-white tracking-tighter leading-[0.85] mb-8 fade-scale">
                Scale Your <br/>
                <span id="typewriter-prefix" class="text-white">Professional</span><br/>
                <span id="typewriter-text" class="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-brand-blue" style="min-height: 1.2em; display: inline-block;">Agri-AI.</span>
              </h1>
              
              <p class="text-xl md:text-2xl text-surface-400 max-w-xl mb-12 leading-relaxed font-medium fade-in" style="animation-delay: 0.1s">
                The world's most advanced open-source agricultural intelligence suite. Real-time neural diagnostics tailored for the next generation of farmers.
              </p>
              
              <div class="flex flex-col sm:flex-row items-center gap-6 fade-in" style="animation-delay: 0.2s">
                <a href="#/register" class="group bg-brand-cyan text-brand-dark font-black px-10 py-5 rounded-2xl shadow-2xl shadow-brand-cyan/10 w-full sm:w-auto hover:bg-white transition-all hover:-translate-y-1 flex items-center justify-center gap-3">
                  Start Scanning <span class="group-hover:translate-x-1 transition-transform">${Icons.chevronRight}</span>
                </a>
                <a href="#features" class="glass-elevated text-white font-black px-10 py-5 rounded-2xl w-full sm:w-auto hover:bg-surface-800 transition-all flex items-center justify-center gap-3">
                  Check Features
                </a>
              </div>
            </div>

            <!-- Right: Premium Visuals -->
            <div class="flex-1 w-full relative fade-in" style="animation-delay: 0.4s">
              <div class="relative group animate-float">
                <div class="absolute -inset-1 bg-gradient-to-r from-brand-cyan to-brand-blue rounded-[3rem] blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
                <div class="relative bg-surface-950 rounded-[2.8rem] border border-surface-800/50 overflow-hidden shadow-2xl">
                  <img src="hero_agriculture_ai.png" alt="AI Agriculture" class="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-1000">
                  
                  <!-- Internal Animation overlay (Solid) -->
                  <div class="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent pointer-events-none"></div>
                  
                  <div class="absolute inset-0 pointer-events-none">
                    <canvas id="homepage-detail-anim-canvas" class="w-full h-full opacity-60 mix-blend-screen"></canvas>
                  </div>

                  <!-- HUD elements -->
                  <div class="absolute top-10 left-10 glass p-5 rounded-2xl border-brand-cyan/30 backdrop-blur-2xl">
                    <div class="text-[10px] font-black text-brand-cyan uppercase tracking-widest mb-1">Inference Accuracy</div>
                    <div class="text-2xl font-mono text-white">99.82 <small class="text-xs">%</small></div>
                  </div>

                  <div class="absolute bottom-10 right-10 glass p-5 rounded-2xl border-brand-blue/30 backdrop-blur-2xl">
                    <div class="flex items-center gap-4">
                      <div class="w-10 h-10 rounded-xl bg-brand-blue/20 flex items-center justify-center text-brand-blue">
                        ${Icons.brain}
                      </div>
                      <div>
                        <div class="text-[10px] font-black text-surface-400 uppercase tracking-widest">Neural Link</div>
                        <div class="text-sm font-bold text-white">STABLE_CONNECTION</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <!-- Features Section (Newly Added) -->
        <section id="features" class="relative z-10 max-w-7xl mx-auto px-6 py-32 border-t border-surface-800/50">
          <div class="text-center mb-24">
            <h2 class="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">Powerful Core Capabilities</h2>
            <p class="text-surface-500 max-w-2xl mx-auto text-lg">Every feature is designed to bridge the gap between advanced technology and practical farming.</p>
          </div>

          <div class="grid md:grid-cols-3 gap-10">
            <!-- Feature 1 -->
            <div class="glass-elevated rounded-[2.5rem] overflow-hidden group hover:-translate-y-2 transition-all duration-500">
              <div class="h-64 relative overflow-hidden">
                <img src="feature_disease.png" alt="Disease Analysis" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000">
                <div class="absolute inset-0 bg-gradient-to-t from-surface-950 to-transparent"></div>
              </div>
              <div class="p-10">
                <div class="w-12 h-12 rounded-xl bg-brand-cyan/10 flex items-center justify-center text-brand-cyan mb-6">
                  ${Icons.scan}
                </div>
                <h3 class="text-2xl font-black text-white mb-4 tracking-tight">Disease Analysis</h3>
                <p class="text-surface-500 leading-relaxed font-medium">Identify 49+ disease classes across 14 species with sub-second neural inference running directly on hardware.</p>
              </div>
            </div>

            <!-- Feature 2 -->
            <div class="glass-elevated rounded-[2.5rem] overflow-hidden group hover:-translate-y-2 transition-all duration-500">
              <div class="h-64 relative overflow-hidden">
                <img src="feature_market.png" alt="Market Intelligence" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000">
                <div class="absolute inset-0 bg-gradient-to-t from-surface-950 to-transparent"></div>
              </div>
              <div class="p-10">
                <div class="w-12 h-12 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue mb-6">
                  ${Icons.barChart}
                </div>
                <h3 class="text-2xl font-black text-white mb-4 tracking-tight">Market Analytics</h3>
                <p class="text-surface-500 leading-relaxed font-medium">Real-time agricultural market data and price fluctuations, helping you make data-driven sales decisions.</p>
              </div>
            </div>

            <!-- Feature 3 -->
            <div class="glass-elevated rounded-[2.5rem] overflow-hidden group hover:-translate-y-2 transition-all duration-500">
              <div class="h-64 relative overflow-hidden">
                <img src="feature_climate.png" alt="Climate Prediction" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000">
                <div class="absolute inset-0 bg-gradient-to-t from-surface-950 to-transparent"></div>
              </div>
              <div class="p-10">
                <div class="w-12 h-12 rounded-xl bg-brand-gold/10 flex items-center justify-center text-brand-gold mb-6">
                  ${Icons.sun}
                </div>
                <h3 class="text-2xl font-black text-white mb-4 tracking-tight">Precision Advisory</h3>
                <p class="text-surface-500 leading-relaxed font-medium">Customized planting calendars and climate alerts based on localized field metrics and history.</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Brand Footer -->
        <div class="relative z-10 border-t border-surface-800/20 bg-brand-dark/80 backdrop-blur-md py-16 px-6">
          <div class="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-10">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-surface-800 flex items-center justify-center text-surface-400">
                ${Icons.leaf}
              </div>
              <div class="text-xl font-black tracking-tighter text-white">VERD<span class="text-brand-cyan">.</span></div>
            </div>
            <div class="flex gap-20 opacity-30 grayscale hover:grayscale-0 transition-opacity duration-1000 text-[10px] font-black tracking-[0.3em] uppercase">
               <span>SUPABASE_STORAGE</span>
               <span>TENSORFLOW_JS</span>
               <span>VANILLA_SYSTEM</span>
            </div>
            <div class="text-[10px] uppercase font-bold tracking-widest text-surface-600">
              &copy; 2026 VERD INTELLIGENCE PROTOCOL
            </div>
          </div>
        </div>
      </div>
    `;
  },

  bindEvents() {
    // Theme Toggler
    document.getElementById('theme-toggle-landing')?.addEventListener('click', () => {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      document.documentElement.setAttribute('data-theme', isLight ? 'dark' : 'light');
      localStorage.setItem('verd-theme', isLight ? 'dark' : 'light');
    });

    // Initialize Neural Net Animations (Background & Detail) - Solid
    if (window.NeuralNetAnim) {
      const bgCanvas = document.getElementById('homepage-bg-anim-canvas');
      const detailCanvas = document.getElementById('homepage-detail-anim-canvas');

      if (this._anims) {
        this._anims.forEach(a => a.destroy());
      }
      this._anims = [];

      if (bgCanvas) {
        const bgAnim = new NeuralNetAnim(bgCanvas);
        bgAnim.start();
        this._anims.push(bgAnim);
      }

      if (detailCanvas) {
        const detailAnim = new NeuralNetAnim(detailCanvas);
        detailAnim.start();
        this._anims.push(detailAnim);
      }

      // Infinite slow scanning pulse for all animations (Solid)
      let progress = 0;
      if (this._animInterval) clearInterval(this._animInterval);
      this._animInterval = setInterval(() => {
        progress = (progress + 0.1) % 100;
        this._anims.forEach(a => a.setProgress(progress));
      }, 50);
    }

    // Two-Color Typewriter Effect
    this._initTypewriter();
  },

  _initTypewriter() {
    const typewriterText = document.getElementById('typewriter-text');
    const typewriterPrefix = document.getElementById('typewriter-prefix');
    if (!typewriterText || !typewriterPrefix) return;

    const phrases = [
      { prefix: 'Professional', text: 'Agri-AI.', color: 'white', textClass: 'text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-brand-blue' },
      { prefix: 'Intelligent', text: 'Diagnostics.', color: 'white', textClass: 'text-[#1aaf63]' },
      { prefix: 'Sustainable', text: 'Farming.', color: 'white', textClass: 'text-brand-cyan' },
      { prefix: 'Real-time', text: 'Inference.', color: 'white', textClass: 'text-[#1aaf63]' }
    ];

    let currentIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let typeSpeed = 100;

    const type = () => {
      const current = phrases[currentIdx];
      const fullText = current.text;

      typewriterPrefix.textContent = current.prefix;
      typewriterText.className = current.textClass;

      if (isDeleting) {
        typewriterText.textContent = fullText.substring(0, charIdx - 1);
        charIdx--;
        typeSpeed = 50;
      } else {
        typewriterText.textContent = fullText.substring(0, charIdx + 1);
        charIdx++;
        typeSpeed = 100;
      }

      if (!isDeleting && charIdx === fullText.length) {
        isDeleting = true;
        typeSpeed = 2000; // Pause at end
      } else if (isDeleting && charIdx === 0) {
        isDeleting = false;
        currentIdx = (currentIdx + 1) % phrases.length;
        typeSpeed = 500;
      }

      this._typeTimeout = setTimeout(type, typeSpeed);
    };

    type();
  },

  destroy() {
    if (this._anims) {
      this._anims.forEach(a => a.destroy());
    }
    if (this._animInterval) clearInterval(this._animInterval);
    if (this._typeTimeout) clearTimeout(this._typeTimeout);
  }
};
