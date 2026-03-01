// ═══════════════════════════════════════════
//  404 Not Found Page
// ═══════════════════════════════════════════

window.NotFoundPage = {
  render() {
    return `
      <div class="min-h-[60vh] flex flex-col items-center justify-center text-center p-8 fade-in">
        <div class="w-16 h-16 rounded-2xl bg-surface-800 flex items-center justify-center text-surface-500 mb-6">${Icons.sized(Icons.search, 28)}</div>
        <h1 class="text-5xl font-black text-white tracking-tight mb-2">404</h1>
        <p class="text-lg text-surface-400 mb-1">Page Not Found</p>
        <p class="text-surface-600 mb-8 max-w-sm text-sm">The resource you're looking for doesn't exist or has been moved.</p>
        <a href="#/dashboard" class="btn btn-primary">${Icons.dashboard} Back to Dashboard</a>
      </div>
    `;
  }
};
