/***********************
 * NkMagnifier v1.3
 * Storyline 360 Safe
 ***********************/

/* ---------- CSS ---------- */
function addCssToHead(cssRules) {
  const styleElement = document.createElement('style');
  styleElement.textContent = cssRules;
  document.head.appendChild(styleElement);
}

addCssToHead(`
  #magnifier {
    position: fixed;
    display: none;
    width: 250px;
    height: 250px;
    border: 2px solid #000;
    overflow: hidden;
    box-shadow: 0 0 15px rgba(0,0,0,0.25);
    pointer-events: none;
    z-index: 999999;
    background: #fff no-repeat;
  }
`);

/* ---------- MAIN FUNCTION ---------- */
function nklMagnify(imageAccText, zoomLevel = 3, magnifierSize = 250, borderRadius = 0) {

  let magnifier = document.getElementById('magnifier');
  if (!magnifier) {
    magnifier = document.createElement('div');
    magnifier.id = 'magnifier';
    document.body.appendChild(magnifier);
  }

  let targetElement = null;
  let imageWidth = 0;
  let imageHeight = 0;

  /* ---------- EVENTS ---------- */
  document.addEventListener('mousemove', e => {
    if (targetElement) updateMagnifierPosition(e.clientX, e.clientY);
  });

  document.addEventListener('touchmove', e => {
    if (!targetElement) return;
    const t = e.touches[0];
    updateMagnifierPosition(t.clientX, t.clientY);
    e.preventDefault();
  }, { passive: false });

  document
    .querySelectorAll(`[data-acc-text='${imageAccText}']`)
    .forEach(el => {
      el.addEventListener('mouseenter', startMagnifierEvent);
      el.addEventListener('mouseleave', stopMagnifier);
      el.addEventListener('touchstart', startMagnifierEvent, { passive: true });
      el.addEventListener('touchend', stopMagnifier);
    });

  /* ---------- START ---------- */
  function startMagnifierEvent(e) {
    targetElement = this;

    const img = targetElement.querySelector('svg image');
    if (!img) {
      console.error('Magnifier: image not found');
      return;
    }

    const imgSrc =
      img.getAttribute('href') ||
      img.getAttribute('xlink:href');

    imageWidth = targetElement.offsetWidth;
    imageHeight = targetElement.offsetHeight;

    magnifier.style.display = 'block';
    magnifier.style.width = magnifierSize + 'px';
    magnifier.style.height = magnifierSize + 'px';
    magnifier.style.borderRadius =
      borderRadius === 'circle' ? '50%' : borderRadius + 'px';

    magnifier.style.backgroundImage = `url('${imgSrc}')`;
    magnifier.style.backgroundRepeat = 'no-repeat';
    magnifier.style.backgroundSize =
      imageWidth * zoomLevel + 'px ' +
      imageHeight * zoomLevel + 'px';

    document.body.style.cursor = 'none';

    if (e.type === 'touchstart') {
      const t = e.touches[0];
      updateMagnifierPosition(t.clientX, t.clientY);
    }
  }

  /* ---------- STOP ---------- */
  function stopMagnifier() {
    targetElement = null;
    magnifier.style.display = 'none';
    document.body.style.cursor = 'auto';
  }

  /* ---------- POSITION + CLAMP ---------- */
  function updateMagnifierPosition(clientX, clientY) {
    if (!targetElement) return;

    const rect = targetElement.getBoundingClientRect();

    // Magnifier follows cursor
    magnifier.style.left = clientX - magnifierSize / 2 + 'px';
    magnifier.style.top  = clientY - magnifierSize / 2 + 'px';

    // Cursor relative to image
    let x = clientX - rect.left;
    let y = clientY - rect.top;

    // Clamp inside image (CRITICAL FIX)
    x = Math.max(0, Math.min(x, rect.width));
    y = Math.max(0, Math.min(y, rect.height));

    // Background position
    const bgX = -(x * zoomLevel - magnifierSize / 2);
    const bgY = -(y * zoomLevel - magnifierSize / 2);

    magnifier.style.backgroundPosition = `${bgX}px ${bgY}px`;
  }
}
