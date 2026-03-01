// ═══════════════════════════════════════════
//  Register Page
// ═══════════════════════════════════════════

window.RegisterPage = {
  render() {
    return `
      <div class="min-h-screen flex items-center justify-center bg-surface-950 p-4">
        <div class="w-full max-w-md">
          <div class="text-center mb-10 fade-in">
            <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-verd-600 mb-5 pulse-ring">
              <span class="text-white">${Icons.sized(Icons.leaf, 22)}</span>
            </div>
            <h1 class="text-3xl font-black tracking-tight text-white">VERD</h1>
            <p class="text-surface-500 mt-1.5 text-sm tracking-wide">Join the platform</p>
          </div>

          <div class="glass-elevated rounded-2xl p-7 fade-in" style="animation-delay: 0.08s">
            <h2 class="text-lg font-bold text-white mb-6">Create Account</h2>

            <form id="register-form" class="space-y-5">
              <div>
                <label for="reg-name" class="block text-sm font-medium text-surface-400 mb-2">Full Name</label>
                <input id="reg-name" type="text" required
                  class="w-full px-4 py-3 rounded-xl text-sm placeholder-surface-600"
                  placeholder="John Okoye" />
              </div>

              <div>
                <label for="reg-email" class="block text-sm font-medium text-surface-400 mb-2">Email</label>
                <input id="reg-email" type="email" required autocomplete="email"
                  class="w-full px-4 py-3 rounded-xl text-sm placeholder-surface-600"
                  placeholder="john@farm.com" />
              </div>

              <div>
                <label for="reg-password" class="block text-sm font-medium text-surface-400 mb-2">Password</label>
                <input id="reg-password" type="password" required minlength="6"
                  class="w-full px-4 py-3 rounded-xl text-sm placeholder-surface-600"
                  placeholder="Min. 6 characters" />
              </div>

              <div>
                <label for="reg-role" class="block text-sm font-medium text-surface-400 mb-2">Role</label>
                <select id="reg-role"
                  class="w-full px-4 py-3 rounded-xl text-sm">
                  <option value="farmer">Farmer</option>
                  <option value="admin">Admin / Analyst</option>
                </select>
              </div>

              <div id="register-error" class="hidden text-red-400 text-sm bg-red-950/30 border border-red-900/20 rounded-xl p-3"></div>

              <button type="submit" id="register-submit-btn" class="btn btn-primary w-full py-3">
                Create Account
              </button>
            </form>

            <div class="mt-6 text-center">
              <p class="text-surface-500 text-sm">Already registered?
                <a href="#/login" class="text-verd-500 hover:text-verd-400 font-semibold"> Sign in</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  bindEvents() {
    const form = document.getElementById('register-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('reg-name').value.trim();
      const email = document.getElementById('reg-email').value.trim();
      const password = document.getElementById('reg-password').value;
      const role = document.getElementById('reg-role').value;
      const errorEl = document.getElementById('register-error');
      const btn = document.getElementById('register-submit-btn');

      btn.disabled = true;
      btn.innerHTML = '<span class="inline-block spin">' + Icons.sized(Icons.refresh, 16) + '</span> Creating account...';
      errorEl.classList.add('hidden');

      try {
        await AuthService.register(email, password, name, role);
        DOM.toast('Account created successfully', 'success');
        window.location.hash = role === 'admin' ? '#/admin' : '#/dashboard';
      } catch (err) {
        errorEl.textContent = err.message;
        errorEl.classList.remove('hidden');
        btn.disabled = false;
        btn.textContent = 'Create Account';
      }
    });
  }
};
