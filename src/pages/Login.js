// ═══════════════════════════════════════════
//  Login Page
// ═══════════════════════════════════════════

window.LoginPage = {
  render() {
    return `
      <div class="min-h-screen flex items-center justify-center bg-surface-950 p-4">
        <div class="w-full max-w-md">
          <div class="text-center mb-10 fade-in">
            <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-verd-600 mb-5 pulse-ring">
              <span class="text-white">${Icons.sized(Icons.leaf, 22)}</span>
            </div>
            <h1 class="text-3xl font-black tracking-tight text-white">VERD</h1>
            <p class="text-surface-500 mt-1.5 text-sm tracking-wide">Intelligent Crop Diagnostics</p>
          </div>

          <div class="glass-elevated rounded-2xl p-7 fade-in" style="animation-delay: 0.08s">
            <h2 class="text-lg font-bold text-white mb-6">Sign in to your account</h2>

            <form id="login-form" class="space-y-5">
              <div>
                <label for="login-email" class="block text-sm font-medium text-surface-400 mb-2">Email</label>
                <input id="login-email" type="email" required autocomplete="email"
                  class="w-full px-4 py-3 rounded-xl text-sm placeholder-surface-600 focus:ring-0"
                  placeholder="you@example.com" />
              </div>

              <div>
                <label for="login-password" class="block text-sm font-medium text-surface-400 mb-2">Password</label>
                <input id="login-password" type="password" required autocomplete="current-password" minlength="6"
                  class="w-full px-4 py-3 rounded-xl text-sm placeholder-surface-600 focus:ring-0"
                  placeholder="Min. 6 characters" />
              </div>

              <div id="login-error" class="hidden text-red-400 text-sm bg-red-950/30 border border-red-900/20 rounded-xl p-3 flex items-center gap-2">
              </div>

              <button type="submit" id="login-submit-btn" class="btn btn-primary w-full py-3">
                Sign In
              </button>
            </form>

            <div class="mt-6 text-center">
              <p class="text-surface-500 text-sm">No account?
                <a href="#/register" class="text-verd-500 hover:text-verd-400 font-semibold"> Create one</a>
              </p>
            </div>

            <div class="mt-6 p-4 rounded-xl bg-surface-900 border border-surface-800">
              <p class="text-xs text-surface-400 font-semibold mb-1 flex items-center gap-1.5">${Icons.sized(Icons.info, 14)} Demo Mode</p>
              <p class="text-xs text-surface-600 leading-relaxed">Use any email and password to sign in. Include "admin" in the email for the analyst view.</p>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  bindEvents() {
    const form = document.getElementById('login-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      const errorEl = document.getElementById('login-error');
      const btn = document.getElementById('login-submit-btn');

      btn.disabled = true;
      btn.innerHTML = '<span class="inline-block spin">' + Icons.sized(Icons.refresh, 16) + '</span> Signing in...';
      errorEl.classList.add('hidden');

      try {
        await AuthService.login(email, password);
        DOM.toast('Welcome back', 'success');
        const user = AppState.get('user');
        window.location.hash = user?.role === 'admin' ? '#/admin' : '#/dashboard';
      } catch (err) {
        errorEl.innerHTML = Icons.sized(Icons.alertCircle, 14) + ' ' + err.message;
        errorEl.classList.remove('hidden');
        btn.disabled = false;
        btn.textContent = 'Sign In';
      }
    });
  }
};
