const PROXY_LIFETIME_MS = 1000;

export function holdKeyboardOpen() {
  if (!window.matchMedia('(pointer: coarse)').matches) return;

  const proxy = document.createElement('input');

  proxy.type = 'text';
  proxy.tabIndex = -1;
  proxy.setAttribute('aria-hidden', 'true');
  Object.assign(proxy.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '1px',
    height: '1px',
    opacity: '0',
    fontSize: '16px',
    pointerEvents: 'none',
  });

  document.body.appendChild(proxy);
  proxy.focus({ preventScroll: true });
  setTimeout(() => proxy.remove(), PROXY_LIFETIME_MS);
}
