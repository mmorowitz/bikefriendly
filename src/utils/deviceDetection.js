// Utility functions for device detection and responsive behavior
export function isMobile() {
  return window.innerWidth < 768;
}

export function isTablet() {
  return window.innerWidth >= 768 && window.innerWidth < 1024;
}

export function isDesktop() {
  return window.innerWidth >= 1024;
}

export function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

export function getViewportSize() {
  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
}

// Debounced resize handler
export function onResize(callback, delay = 250) {
  let timeoutId;
  return function() {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(callback, delay);
  };
}