// ═══════════════════════════════════════════
//  Modal Component
// ═══════════════════════════════════════════

window.ModalComponent = {
  show({ title, content, size = 'md' }) {
    const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' };

    const backdrop = document.createElement('div');
    backdrop.className = 'fixed inset-0 z-50 flex items-center justify-center p-4';
    backdrop.innerHTML = `
      <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" id="modal-backdrop"></div>
      <div class="relative glass-elevated rounded-2xl w-full ${sizes[size]} shadow-2xl shadow-black/50 fade-in z-10">
        <div class="flex items-center justify-between p-5 border-b border-surface-800/50">
          <h3 class="text-base font-bold text-white">${title}</h3>
          <button id="modal-close" class="text-surface-500 hover:text-white p-1 rounded-lg hover:bg-surface-800">${Icons.x}</button>
        </div>
        <div class="p-5">${content}</div>
      </div>
    `;

    document.body.appendChild(backdrop);

    const close = () => {
      backdrop.style.opacity = '0';
      setTimeout(() => backdrop.remove(), 200);
    };

    backdrop.querySelector('#modal-backdrop').addEventListener('click', close);
    backdrop.querySelector('#modal-close').addEventListener('click', close);
    document.addEventListener('keydown', function handler(e) {
      if (e.key === 'Escape') { close(); document.removeEventListener('keydown', handler); }
    });

    return { close };
  },

  confirm({ title, message, confirmText = 'Confirm', confirmClass = 'btn-primary' }) {
    return new Promise((resolve) => {
      const { close } = this.show({
        title,
        content: `
          <p class="text-surface-400 text-sm mb-5">${message}</p>
          <div class="flex justify-end gap-3">
            <button class="btn btn-secondary" id="modal-cancel">Cancel</button>
            <button class="btn ${confirmClass}" id="modal-confirm">${confirmText}</button>
          </div>
        `,
        size: 'sm'
      });

      setTimeout(() => {
        document.getElementById('modal-cancel')?.addEventListener('click', () => { close(); resolve(false); });
        document.getElementById('modal-confirm')?.addEventListener('click', () => { close(); resolve(true); });
      }, 50);
    });
  }
};
