/**
 * DOM utility functions for creating elements cleanly in vanilla TypeScript
 */

export function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string> = {},
  children: (HTMLElement | string)[] = []
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [key, val] of Object.entries(attrs)) {
    if (key === 'className') {
      el.className = val;
    } else {
      el.setAttribute(key, val);
    }
  }
  for (const child of children) {
    if (typeof child === 'string') {
      el.appendChild(document.createTextNode(child));
    } else {
      el.appendChild(child);
    }
  }
  return el;
}

export function createAlert(message: string, type: 'error' | 'info' | 'success' = 'error'): HTMLElement {
  const alertEl = createElement('div', { className: `ui-alert alert-${type}` });
  const icon = type === 'error' ? '⚠️ ' : type === 'success' ? '✓ ' : 'ℹ️ ';
  alertEl.innerHTML = `<strong>${icon}</strong><span>${escapeHtml(message)}</span>`;
  return alertEl;
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
