/*************************
 * NkMagnifier v1.4
 * Border-stacking FIX
 *************************/

/* ---------- CSS (ONCE ONLY) ---------- */
(function () {
  if (document.getElementById('nk-magnifier-style')) return;

  const style = document.createElement('style');
  style.id = 'nk-magnifier-style';
  style.textContent = `
    #magnifier {
      position: fixed;
      display: none;
      width: 250px;
      height: 250px;
      border: 2px solid #000; /* SET ONCE */
      box-sizing: border-box; /* IMPORTANT */
      overflow: hidden;
      pointer-events: none;
      z-index: 999999;
      background: #fff no-repeat;
      box-shadow: 0 0 15px rgba(0,0,0,0.25);
    }
  `;
  document.head.appendChild(style);
})();

/* ---------- MAIN FUNCTION ---------- */
function nklMagnify(imageAccText, zoomLevel = 3, magnifierSize = 250, borderRadius = 0) {

  let magnifier = document.getElementById('magnifier');
  if (!magnifier) {
    magnifier = document.createElement('div');
    magnifier.id = 'magnifier';
    document.body.appendChild(magnifier);
  }

  let targetElement = null;

  /* ---------- EVENTS (ONCE) ---------- */
  if (!window.__nkMagnifierEventsAttached) {
    window.__nkMagnifierEventsAttached = true;

    document.addEventListener('mousemove', e => {
      if (window.__nkActiveMagnifier)
        window.__nkActiveMagnifier.move(e.clientX, e.clientY);
    });

    document.addEventListener('touchmove', e => {
      if (!window.__nkActiveMagnifier) return;
      const t = e.touches[0];
      window.__nkActiveMagnifier.move(t.clientX, t.clientY);
      e.preventDefault();
    }, { passive: false });
  }

  /* ---------- TARGET BINDING ---------- */
  document
    .querySelectorAll(`[data-acc-text='${imageAccText}']`)
    .forEach(el => {
      if (el.__nkBound) return;
      el.__nkBound = true;

      el.addEventListener('mouseenter', start);
      el.addEventListener('mouseleave', stop);
      el.addEventListener('touchstart', start, { passive: true });
      el.addEventListener('touchend', stop);
    });

  /* ---------- START ---------- */
  function start(e) {
    targetElement = this;
    window.__nkActiveMagnifier = api;

    const img = targetElement.querySelector('svg image');
    if (!img) return;

    const src =
      img.getAttribute('href') ||
      img.getAttribute('xlink:href');

    const w = targetElement.offsetWidth;
    const h = targetElement.offsetHeight;

    magnifier.style.width = magnifierSize + 'px';
    magnifier.style.height = magnifierSize + 'px';
    magnifier.style.borderRadius =
      borderRadius === 'circle' ? '50%' : borderRadius + 'px';

    magnifier.style.backgroundImage = `url('${src}')`;
    magnifier.style.backgroundSize =
      w * zoomLevel + 'px ' +
      h * zoomLevel + 'px';
    magnifier.style.display = 'block';

    document.body.style.cursor = 'none';

    if (e.type === 'touchstart') {
      const t = e.touches[0];
      move(t.clientX, t.clientY);
    }
  }

  /* ---------- STOP ---------- */
  function stop() {
    targetElement = null;
    magnifier.style.display = 'none';
    document.body.style.cursor = 'auto';
    window.__nkActiveMagnifier = null;
  }

  /* ---------- MOVE ---------- */
  function move(x, y) {
    if (!targetElement) return;

    const rect = targetElement.getBoundingClientRect();

    magnifier.style.left = x - magnifierSize / 2 + 'px';
    magnifier.style.top  = y - magnifierSize / 2 + 'px';

    let mx = x - rect.left;
    let my = y - rect.top;

    mx = Math.max(0, Math.min(mx, rect.width));
    my = Math.max(0, Math.min(my, rect.height));

    const bgX = -(mx * zoomLevel - magnifierSize / 2);
    const bgY = -(my * zoomLevel - magnifierSize / 2);

    magnifier.style.backgroundPosition = `${bgX}px ${bgY}px`;
  }

  /* ---------- API ---------- */
  const api = { move };
}
