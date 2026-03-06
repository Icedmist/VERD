// ═══════════════════════════════════════════
//  Layout Component (Shell: Sidebar + Header)
// ═══════════════════════════════════════════

window.LayoutComponent = {
  render(pageContent, activeRoute = '') {
    const user = AppState.get('user') || {};
    const isAdmin = user.role === 'admin';
    const isOnline = AppState.get('isOnline');

    const navItems = [
      { path: '#/dashboard', icon: Icons.dashboard, label: 'Dashboard', roles: ['farmer', 'admin'] },
      { path: '#/scan', icon: Icons.scan, label: 'Scan', roles: ['farmer', 'admin'] },
      { path: '#/history', icon: Icons.clock, label: 'History', roles: ['farmer', 'admin'] },
      { path: '#/marketplace', icon: Icons.lightbulb, label: 'Insights', roles: ['farmer', 'admin'] },
      { path: '#/admin', icon: Icons.settings, label: 'Admin Panel', roles: ['admin'] },
    ];

    const filteredNav = navItems.filter(n => n.roles.includes(user.role || 'farmer'));

    return `
      ${!isOnline ? '<div class="offline-banner flex items-center justify-center gap-2">' + Icons.wifiOff + ' You are offline &mdash; showing cached data</div>' : ''}

      <!-- Mobile Header -->
      <header class="lg:hidden bg-surface-950/95 backdrop-blur-lg border-b border-surface-800/50 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <button id="sidebar-toggle" class="text-surface-500 hover:text-white p-2 -ml-2 rounded-lg hover:bg-surface-800" aria-label="Toggle menu">
          ${Icons.menu}
        </button>
        <div class="flex items-center gap-2.5">
          <div class="w-7 h-7 rounded-lg bg-verd-600 flex items-center justify-center">
            <span class="text-white">${Icons.sized(Icons.leaf, 14)}</span>
          </div>
          <span class="text-base font-extrabold tracking-tight text-white">VERD</span>
        </div>
        <div class="w-8 h-8 rounded-full bg-surface-800 flex items-center justify-center text-xs font-bold text-surface-300 border border-surface-700">
          ${(user.displayName || 'U')[0].toUpperCase()}
        </div>
      </header>

      <div id="sidebar-overlay" class="sidebar-overlay lg:hidden"></div>

      <div class="flex flex-1">
        <!-- Sidebar -->
        <aside id="sidebar" class="fixed lg:sticky top-0 left-0 z-40 h-screen w-60 bg-surface-950 border-r border-surface-800/30 transform -translate-x-full lg:translate-x-0 transition-transform duration-200 flex flex-col">
          <!-- Logo -->
          <div class="px-5 py-5 border-b border-surface-800/30">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-verd-600 flex items-center justify-center pulse-ring">
                <span class="text-white">${Icons.sized(Icons.leaf, 16)}</span>
              </div>
              <div>
                <h1 class="text-base font-black tracking-tight text-white">VERD</h1>
                <p class="text-[11px] text-surface-600 tracking-wide">CROP INTELLIGENCE</p>
              </div>
            </div>
          </div>

          <nav class="flex-1 px-3 py-8 overflow-y-auto custom-scrollbar">
            <div class="grid grid-cols-2 gap-3">
              ${filteredNav.map(item => {
      const isActive = activeRoute === item.path || (item.path === '#/dashboard' && activeRoute === '#/');
      return `
                  <a href="${item.path}"
                     class="flex flex-col items-center justify-center p-4 rounded-3xl transition-all duration-500 group border
                     ${isActive ? 'nav-premium-active active-glow' : 'nav-premium-inactive bg-surface-950 hover:bg-surface-900 border-surface-900 hover:border-surface-800'}"
                     data-nav-link="${item.path}"
                     title="${item.label}">
                    <div class="w-12 h-12 rounded-2xl flex items-center justify-center mb-2 transition-all duration-500
                         ${isActive ? 'text-brand-cyan scale-110' : 'text-surface-500 group-hover:text-surface-300'}">
                      ${Icons.sized(item.icon, 24)}
                    </div>
                    <span class="text-[9px] font-black uppercase tracking-[0.2em] transition-colors duration-300
                          ${isActive ? 'text-white' : 'text-surface-600 group-hover:text-surface-400'}">
                      ${item.label}
                    </span>
                    ${isActive ? '<div class="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-brand-cyan shadow-[0_0_8px_var(--brand-cyan)] animate-pulse"></div>' : ''}
                  </a>
                `;
    }).join('')}
            </div>
          </nav>

          <div class="p-4 border-t border-surface-800/30">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-8 h-8 rounded-full bg-surface-800 flex items-center justify-center text-xs font-bold text-surface-300 border border-surface-700">
                ${(user.displayName || 'U')[0].toUpperCase()}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-surface-200 truncate">${user.displayName || 'User'}</p>
                <p class="text-xs text-surface-600 capitalize flex items-center gap-1">${user.role || 'farmer'} ${isAdmin ? '<span class="text-yellow-500">' + Icons.sized(Icons.crown, 12) + '</span>' : ''}</p>
              </div>
            </div>
            <button id="logout-btn" class="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-surface-500 hover:text-red-400 hover:bg-red-950/20 border border-transparent hover:border-red-900/20">
              ${Icons.logOut} Sign Out
            </button>
          </div>
        </aside>

        <main class="flex-1 lg:min-h-screen">
          <header class="hidden lg:flex items-center justify-between px-8 py-4 border-b border-surface-800/30 bg-surface-950/80 backdrop-blur-lg sticky top-0 z-20">
            <div>
              <h2 class="text-lg font-bold text-white" id="page-title"></h2>
              <p class="text-sm text-surface-600" id="page-subtitle"></p>
            </div>
            <div class="flex items-center gap-5">
              <button id="theme-toggle-app" class="w-10 h-10 rounded-xl bg-surface-900 border border-surface-800 flex items-center justify-center text-surface-400 hover:text-brand-cyan hover:border-brand-cyan/30 transition-all" aria-label="Toggle Theme">
                ${document.documentElement.getAttribute('data-theme') === 'light' ? Icons.moon || Icons.cloud : Icons.sun}
              </button>
              <div class="flex items-center gap-2 text-xs font-medium ${isOnline ? 'text-verd-500' : 'text-red-400'}">
                <div class="w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-verd-500' : 'bg-red-400'}"></div>
                ${isOnline ? 'Online' : 'Offline'}
              </div>
              <div class="w-px h-5 bg-surface-800"></div>
              <div class="flex items-center gap-3">
                <div class="text-right">
                  <p class="text-sm font-semibold text-surface-200">${user.displayName || 'User'}</p>
                  <p class="text-xs text-surface-600 capitalize">${user.role || 'farmer'}</p>
                </div>
                <div class="w-8 h-8 rounded-full bg-surface-800 flex items-center justify-center text-xs font-bold text-surface-300 border border-surface-700">
                  ${(user.displayName || 'U')[0].toUpperCase()}
                </div>
              </div>
            </div>
          </header>

          <div id="page-content" class="p-4 lg:p-8">${pageContent}</div>
        </main>
      </div>
    `;
  },

  bindEvents() {
    const toggleBtn = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('-translate-x-full');
        overlay?.classList.toggle('active');
      });
    }

    if (overlay && sidebar) {
      overlay.addEventListener('click', () => {
        sidebar.classList.add('-translate-x-full');
        overlay.classList.remove('active');
      });
    }

    document.querySelectorAll('#sidebar a').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth < 1024) {
          sidebar?.classList.add('-translate-x-full');
          overlay?.classList.remove('active');
        }
      });
    });

    document.getElementById('logout-btn')?.addEventListener('click', async () => {
      await AuthService.logout();
      window.location.hash = '#/login';
    });

    document.getElementById('theme-toggle-app')?.addEventListener('click', (e) => {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      const newTheme = isLight ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('verd-theme', newTheme);

      // Update icon immediately
      const btn = e.currentTarget;
      if (btn) {
        btn.innerHTML = newTheme === 'light' ? (Icons.moon || Icons.cloud) : Icons.sun;
      }
    });
  },

  setTitle(title, subtitle = '') {
    const el = document.getElementById('page-title');
    const sub = document.getElementById('page-subtitle');
    if (el) el.textContent = title;
    if (sub) sub.textContent = subtitle;
  }
};
