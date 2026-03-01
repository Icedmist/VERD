// ═══════════════════════════════════════════
//  DOM Utility Helpers
// ═══════════════════════════════════════════

window.DOM = {
  create(tag, attrs = {}, ...children) {
    const el = document.createElement(tag);
    for (const [key, val] of Object.entries(attrs)) {
      if (key === 'className') el.className = val;
      else if (key === 'innerHTML') el.innerHTML = val;
      else if (key.startsWith('on')) el.addEventListener(key.slice(2).toLowerCase(), val);
      else if (key === 'style' && typeof val === 'object') Object.assign(el.style, val);
      else el.setAttribute(key, val);
    }
    for (const child of children) {
      if (typeof child === 'string') el.appendChild(document.createTextNode(child));
      else if (child instanceof Node) el.appendChild(child);
    }
    return el;
  },

  html(container, htmlStr) {
    if (typeof container === 'string') container = document.querySelector(container);
    if (container) container.innerHTML = htmlStr;
    return container;
  },

  $(selector, parent = document) { return parent.querySelector(selector); },
  $$(selector, parent = document) { return [...parent.querySelectorAll(selector)]; },

  on(parent, event, selector, handler) {
    const el = typeof parent === 'string' ? document.querySelector(parent) : parent;
    if (!el) return;
    el.addEventListener(event, (e) => {
      const target = e.target.closest(selector);
      if (target && el.contains(target)) handler(e, target);
    });
  },

  toast(message, type = 'info', duration = 3500) {
    const colors = {
      info: 'border-blue-500/30 bg-surface-900', success: 'border-verd-600/30 bg-surface-900',
      error: 'border-red-500/30 bg-surface-900', warning: 'border-yellow-500/30 bg-surface-900'
    };
    const iconMap = {
      info: Icons.info, success: Icons.checkCircle,
      error: Icons.xCircle, warning: Icons.alertTriangle
    };
    const iconColor = {
      info: 'text-blue-400', success: 'text-verd-400',
      error: 'text-red-400', warning: 'text-yellow-400'
    };
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 ${colors[type]} border rounded-xl px-4 py-3 shadow-2xl shadow-black/50 flex items-center gap-3 fade-in max-w-sm`;
    toast.innerHTML = `<span class="${iconColor[type]}">${iconMap[type]}</span><span class="text-sm text-surface-200 font-medium">${message}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-8px)';
      setTimeout(() => toast.remove(), 250);
    }, duration);
  },

  formatDate(date) {
    if (!date) return 'N/A';
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  },

  timeAgo(date) {
    const d = date instanceof Date ? date : new Date(date);
    const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }
};
