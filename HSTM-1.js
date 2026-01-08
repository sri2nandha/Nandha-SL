function addCssToHead(cssRules) {
  var styleElement = document.createElement('style');
  styleElement.textContent = cssRules;
  document.head.appendChild(styleElement);
}

var css = `
#magnifier {
  position: absolute;
  display: none;
  width: 250px;
  height: 250px;
  border: 2px solid #000;
  overflow: hidden;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
  pointer-events: none;
  z-index: 1000;
  background: #fff no-repeat;
  cursor: none;
} `;

addCssToHead(css);

function nklMagnify(image_, zoomLevel = 4, magnifierSize = 250, borderRadius = 0) {
  const magnifier = document.createElement('div');
  magnifier.id = 'magnifier';
  document.body.appendChild(magnifier);

  let targetElement;

  document.addEventListener('mousemove', (event) => {
    if (targetElement) {
      updateMagnifierPosition(event.pageX, event.pageY);
    }
  });

  document.addEventListener('touchmove', (event) => {
    if (targetElement) {
      const touch = event.touches[0];
      updateMagnifierPosition(touch.pageX, touch.pageY);
      event.preventDefault();
    }
  }, { passive: false });

  document.querySelectorAll(`[data-acc-text='${image_}']`).forEach(element => {
    element.addEventListener('mouseenter', startMagnifierEvent);
    element.addEventListener('mouseleave', stopMagnifier);
    element.addEventListener('touchstart', startMagnifierEvent, { passive: true });
    element.addEventListener('touchend', stopMagnifier);
  });

  function startMagnifierEvent(event) {
    if (event.type === 'touchstart') {
      const touch = event.touches[0];
      updateMagnifierPosition(touch.pageX, touch.pageY);
    }
    targetElement = this;
    startMagnifier(targetElement);
  }

  function startMagnifier(element) {
    const image = element.querySelector('svg image');
    if (image) {
      const imagePath = image.getAttribute('xlink:href') || image.getAttribute('href');
      magnifier.style.backgroundImage = `url('${imagePath}')`;
      magnifier.style.display = 'block';
      magnifier.style.width = `${magnifierSize}px`;
      magnifier.style.height = `${magnifierSize}px`;
      magnifier.style.borderRadius = borderRadius === 'circle' ? '50%' : `${borderRadius}px`;
      magnifier.style.backgroundRepeat = 'no-repeat';
      magnifier.style.backgroundSize = `${element.offsetWidth * zoomLevel}px ${element.offsetHeight * zoomLevel}px`;
      document.body.style.cursor = 'none';
    } else {
      console.error("Image not found within the specified element.");
    }
  }

  function stopMagnifier() {
    targetElement = null;
    magnifier.style.display = 'none';
    document.body.style.cursor = 'auto';
  }

  function updateMagnifierPosition(clientX, clientY) {
  if (!targetElement) return;

  const rect = targetElement.getBoundingClientRect();

  // Magnifier position (viewport-based)
  let left = clientX - magnifierSize / 2;
  let top  = clientY - magnifierSize / 2;

  magnifier.style.left = `${left}px`;
  magnifier.style.top  = `${top}px`;

  // Mouse position relative to image
  let x = clientX - rect.left;
  let y = clientY - rect.top;

  // Clamp inside image
  x = Math.max(0, Math.min(x, rect.width));
  y = Math.max(0, Math.min(y, rect.height));

  // Background position
  const bgX = -(x * zoomLevel - magnifierSize / 2);
  const bgY = -(y * zoomLevel - magnifierSize / 2);

  magnifier.style.backgroundPosition = `${bgX}px ${bgY}px`;
}

}
