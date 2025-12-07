// Arabic keyboard layout mapping
const arabicKeyboard = {
  // Row 1
  'q': 'ض', 'w': 'ص', 'e': 'ث', 'r': 'ق', 't': 'ف', 'y': 'غ', 'u': 'ع', 'i': 'ه', 'o': 'خ', 'p': 'ح',
  '[': 'ج', ']': 'د',
  // Row 2
  'a': 'ش', 's': 'س', 'd': 'ي', 'f': 'ب', 'g': 'ل', 'h': 'ا', 'j': 'ت', 'k': 'ن', 'l': 'م',
  ';': 'ك', "'": 'ط',
  // Row 3
  'z': 'ئ', 'x': 'ء', 'c': 'ؤ', 'v': 'ر', 'b': 'لا', 'n': 'ى', 'm': 'ة',
  ',': 'و', '.': 'ز', '/': 'ظ',
  // Shift variations
  'Q': 'َ', 'W': 'ً', 'E': 'ُ', 'R': 'ٌ', 'T': 'ِ', 'Y': 'ٍ', 'U': 'ْ', 'I': 'ّ', 'O': 'ٰ', 'P': 'ٓ',
  '{': ']', '}': '[',
  'A': 'ِ', 'S': 'ٍ', 'D': 'ُ', 'F': 'ٌ', 'G': 'َ', 'H': 'ً', 'J': 'ْ', 'K': 'ّ', 'L': 'ٰ',
  ':': '؛', '"': '،',
  'Z': 'إ', 'X': 'أ', 'C': 'آ', 'V': '»', 'B': '«', 'N': 'أ', 'M': 'ة',
  '<': '>', '>': '.', '?': '/'
};

let keyboardVisible = false;
let keyboardOverlay = null;
let savedPosition = { x: 0, y: 0, scale: 1, width: null };
let isToggling = false; // Lock to prevent rapid toggling issues

// Load saved position before creating overlay
function loadSavedSettings(callback) {
  try {
    chrome.storage.local.get(['keyboardX', 'keyboardY', 'keyboardScale', 'keyboardWidth'], (result) => {
      if (chrome.runtime.lastError) {
        console.log('Storage error:', chrome.runtime.lastError);
        callback({ x: 0, y: 0, scale: 1, width: null });
        return;
      }
      callback({
        x: result.keyboardX || 0,
        y: result.keyboardY || 0,
        scale: result.keyboardScale || 1,
        width: result.keyboardWidth || null
      });
    });
  } catch (e) {
    console.log('Error loading settings:', e);
    callback({ x: 0, y: 0, scale: 1, width: null });
  }
}

// Create keyboard overlay
function createKeyboardOverlay() {
  // Remove any existing overlays first - be more aggressive
  const existingOverlays = document.querySelectorAll('#arabic-keyboard-overlay');
  existingOverlays.forEach(overlay => {
    try {
      overlay.remove();
    } catch (e) {
      // If remove fails, try to hide it and clear references
      overlay.style.display = 'none';
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    }
  });
  keyboardOverlay = null;
  
  // Wait a frame to ensure DOM is clean
  if (existingOverlays.length > 0) {
    // Force cleanup
    return null;
  }

  const overlay = document.createElement('div');
  overlay.id = 'arabic-keyboard-overlay';
  overlay.innerHTML = `
    <div class="keyboard-container">
      <div class="keyboard-header">
        <span class="keyboard-title">Arabic Keyboard</span>
        <div class="size-controls">
          <button id="size-down" class="size-btn" title="Make smaller">−</button>
          <button id="size-up" class="size-btn" title="Make larger">+</button>
        </div>
        <button id="close-keyboard" class="close-btn" title="Close (Ctrl+Shift+A)">×</button>
      </div>
      <div class="resize-handle" id="resize-handle"></div>
      <div class="keyboard-layout">
        <!-- Row 1 -->
        <div class="keyboard-row">
          <div class="key" data-en="q" data-ar="ض"><span class="en-key">q</span><span class="ar-key">ض</span></div>
          <div class="key" data-en="w" data-ar="ص"><span class="en-key">w</span><span class="ar-key">ص</span></div>
          <div class="key" data-en="e" data-ar="ث"><span class="en-key">e</span><span class="ar-key">ث</span></div>
          <div class="key" data-en="r" data-ar="ق"><span class="en-key">r</span><span class="ar-key">ق</span></div>
          <div class="key" data-en="t" data-ar="ف"><span class="en-key">t</span><span class="ar-key">ف</span></div>
          <div class="key" data-en="y" data-ar="غ"><span class="en-key">y</span><span class="ar-key">غ</span></div>
          <div class="key" data-en="u" data-ar="ع"><span class="en-key">u</span><span class="ar-key">ع</span></div>
          <div class="key" data-en="i" data-ar="ه"><span class="en-key">i</span><span class="ar-key">ه</span></div>
          <div class="key" data-en="o" data-ar="خ"><span class="en-key">o</span><span class="ar-key">خ</span></div>
          <div class="key" data-en="p" data-ar="ح"><span class="en-key">p</span><span class="ar-key">ح</span></div>
          <div class="key" data-en="[" data-ar="ج"><span class="en-key">[</span><span class="ar-key">ج</span></div>
          <div class="key" data-en="]" data-ar="د"><span class="en-key">]</span><span class="ar-key">د</span></div>
        </div>
        <!-- Row 2 -->
        <div class="keyboard-row">
          <div class="key" data-en="a" data-ar="ش"><span class="en-key">a</span><span class="ar-key">ش</span></div>
          <div class="key" data-en="s" data-ar="س"><span class="en-key">s</span><span class="ar-key">س</span></div>
          <div class="key" data-en="d" data-ar="ي"><span class="en-key">d</span><span class="ar-key">ي</span></div>
          <div class="key" data-en="f" data-ar="ب"><span class="en-key">f</span><span class="ar-key">ب</span></div>
          <div class="key" data-en="g" data-ar="ل"><span class="en-key">g</span><span class="ar-key">ل</span></div>
          <div class="key" data-en="h" data-ar="ا"><span class="en-key">h</span><span class="ar-key">ا</span></div>
          <div class="key" data-en="j" data-ar="ت"><span class="en-key">j</span><span class="ar-key">ت</span></div>
          <div class="key" data-en="k" data-ar="ن"><span class="en-key">k</span><span class="ar-key">ن</span></div>
          <div class="key" data-en="l" data-ar="م"><span class="en-key">l</span><span class="ar-key">م</span></div>
          <div class="key" data-en=";" data-ar="ك"><span class="en-key">;</span><span class="ar-key">ك</span></div>
          <div class="key" data-en="'" data-ar="ط"><span class="en-key">'</span><span class="ar-key">ط</span></div>
        </div>
        <!-- Row 3 -->
        <div class="keyboard-row">
          <div class="key" data-en="z" data-ar="ئ"><span class="en-key">z</span><span class="ar-key">ئ</span></div>
          <div class="key" data-en="x" data-ar="ء"><span class="en-key">x</span><span class="ar-key">ء</span></div>
          <div class="key" data-en="c" data-ar="ؤ"><span class="en-key">c</span><span class="ar-key">ؤ</span></div>
          <div class="key" data-en="v" data-ar="ر"><span class="en-key">v</span><span class="ar-key">ر</span></div>
          <div class="key" data-en="b" data-ar="لا"><span class="en-key">b</span><span class="ar-key">لا</span></div>
          <div class="key" data-en="n" data-ar="ى"><span class="en-key">n</span><span class="ar-key">ى</span></div>
          <div class="key" data-en="m" data-ar="ة"><span class="en-key">m</span><span class="ar-key">ة</span></div>
          <div class="key" data-en="," data-ar="و"><span class="en-key">,</span><span class="ar-key">و</span></div>
          <div class="key" data-en="." data-ar="ز"><span class="en-key">.</span><span class="ar-key">ز</span></div>
          <div class="key" data-en="/" data-ar="ظ"><span class="en-key">/</span><span class="ar-key">ظ</span></div>
        </div>
        <div class="keyboard-info">
          <p>Press keys on your keyboard to see the Arabic equivalent</p>
        </div>
        <div style="font-size: 9px; color: rgba(255,255,255,0.7); text-align: center; margin-top: 6px;">
          Drag to move
        </div>
      </div>
    </div>
  `;

  // Try to append to documentElement first (more reliable), fallback to body
  const parentElement = document.documentElement || document.body;
  try {
    parentElement.appendChild(overlay);
  } catch (e) {
    // If that fails, try body
    if (document.body) {
      document.body.appendChild(overlay);
    } else {
      // Last resort - wait for body
      const observer = new MutationObserver(() => {
        if (document.body) {
          document.body.appendChild(overlay);
          observer.disconnect();
        }
      });
      observer.observe(document.documentElement, { childList: true, subtree: true });
      if (document.body) {
        document.body.appendChild(overlay);
        observer.disconnect();
      }
    }
  }

  // Make keyboard draggable - get references first
  const container = overlay.querySelector('.keyboard-container');
  const header = overlay.querySelector('.keyboard-header');
  
  // Size controls
  let currentScale = savedPosition.scale || 1;
  const minScale = 0.6;
  const maxScale = 1.5;
  const scaleStep = 0.1;
  let xOffset = savedPosition.x || 0;
  let yOffset = savedPosition.y || 0;
  
  // Apply saved width if exists
  if (savedPosition.width) {
    container.style.width = savedPosition.width + 'px';
  }
  
  // Apply saved position and scale immediately
  function setTranslate(xPos, yPos, el, scale = currentScale) {
    el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0) scale(${scale})`;
    el.style.transformOrigin = 'top left';
    // Ensure container is always visible
    el.style.visibility = 'visible';
    el.style.opacity = '0.95';
    el.style.display = 'block';
  }
  
  // Get default center position
  function getDefaultPosition() {
    // Center on screen as default
    const overlayWidth = container.offsetWidth || 400;
    const overlayHeight = container.offsetHeight || 250;
    return {
      x: Math.max(20, (window.innerWidth - overlayWidth) / 2),
      y: Math.max(20, (window.innerHeight - overlayHeight) / 2)
    };
  }
  
  // Ensure keyboard stays on screen (but allow some overflow for better UX)
  function constrainToScreen(x, y, el) {
    const rect = el.getBoundingClientRect();
    const padding = 20; // Allow 20px overflow on each side
    const maxX = window.innerWidth - Math.min(rect.width, 600) + padding;
    const maxY = window.innerHeight - Math.min(rect.height, 400) + padding;
    return {
      x: Math.max(-padding, Math.min(x, maxX)),
      y: Math.max(-padding, Math.min(y, maxY))
    };
  }
  
  // Wait for element to be laid out before calculating position
  const initPosition = () => {
    // Ensure overlay and container are visible
    overlay.style.display = 'block';
    overlay.style.visibility = 'visible';
    container.style.visibility = 'visible';
    container.style.display = 'block';
    
    // Check if position is valid and on-screen
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const isOffScreen = xOffset < -viewportWidth * 0.5 || 
                        yOffset < -viewportHeight * 0.5 || 
                        xOffset > viewportWidth * 1.5 || 
                        yOffset > viewportHeight * 1.5;
    
    // If no saved position or way off screen, use default center position
    if ((xOffset === 0 && yOffset === 0) || isOffScreen || !xOffset || !yOffset) {
      const defaultPos = getDefaultPosition();
      xOffset = defaultPos.x;
      yOffset = defaultPos.y;
    } else {
      // Validate and constrain saved position
      const rect = container.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const constrained = constrainToScreen(xOffset, yOffset, container);
        xOffset = constrained.x;
        yOffset = constrained.y;
      }
    }
    
    setTranslate(xOffset, yOffset, container, currentScale);
    
    // Force a repaint to ensure visibility
    void container.offsetHeight;
  };
  
  // Initialize position after a brief delay to ensure layout
  const tryInitPosition = () => {
    if (container.offsetWidth > 0 && container.offsetHeight > 0) {
      initPosition();
    } else {
      // Wait for layout - try multiple times
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (container.offsetWidth > 0) {
            initPosition();
          } else {
            // Last attempt after a short delay
            setTimeout(() => {
              initPosition();
            }, 100);
          }
        });
      });
    }
  };
  
  tryInitPosition();

  // Add click handler for close button
  overlay.querySelector('#close-keyboard').addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    toggleKeyboard();
  }, true);

  overlay.querySelector('#size-down').addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    if (currentScale > minScale) {
      currentScale = Math.max(minScale, currentScale - scaleStep);
      updateScale();
    }
  }, true);

  overlay.querySelector('#size-up').addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    if (currentScale < maxScale) {
      currentScale = Math.min(maxScale, currentScale + scaleStep);
      updateScale();
    }
  }, true);

  function updateScale() {
    const baseTransform = xOffset !== 0 || yOffset !== 0 
      ? `translate3d(${xOffset}px, ${yOffset}px, 0) scale(${currentScale})`
      : `scale(${currentScale})`;
    container.style.transform = baseTransform;
    try {
      if (chrome && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ keyboardScale: currentScale }, () => {
          if (chrome.runtime && chrome.runtime.lastError) {
            console.log('Storage error:', chrome.runtime.lastError);
          }
        });
      }
    } catch (e) {
      console.log('Error saving scale:', e);
    }
  }

  // Manual resize handle
  const resizeHandle = overlay.querySelector('#resize-handle');
  let isResizing = false;
  let startX, startY, startWidth, startHeight;

  resizeHandle.addEventListener('mousedown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    isResizing = true;
    startX = e.clientX;
    startY = e.clientY;
    const rect = container.getBoundingClientRect();
    startWidth = rect.width;
    startHeight = rect.height;
    document.addEventListener('mousemove', handleResize, true);
    document.addEventListener('mouseup', stopResize, true);
  }, true);

  function handleResize(e) {
    if (!isResizing) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    const width = startWidth + (e.clientX - startX);
    const height = startHeight + (e.clientY - startY);
    const minWidth = 250;
    const minHeight = 200;
    
    if (width >= minWidth && height >= minHeight) {
      container.style.width = width + 'px';
      container.style.height = 'auto';
      // Adjust scale based on width change
      const scaleChange = width / startWidth;
      currentScale = Math.max(minScale, Math.min(maxScale, currentScale * scaleChange));
      try {
        if (chrome && chrome.storage && chrome.storage.local) {
          chrome.storage.local.set({ 
            keyboardWidth: width,
            keyboardScale: currentScale 
          }, () => {
            if (chrome.runtime && chrome.runtime.lastError) {
              console.log('Storage error:', chrome.runtime.lastError);
            }
          });
        }
      } catch (e) {
        console.log('Error saving resize:', e);
      }
    }
  }

  function stopResize(e) {
    if (isResizing) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      isResizing = false;
      document.removeEventListener('mousemove', handleResize, true);
      document.removeEventListener('mouseup', stopResize, true);
    }
  }

  // Make keyboard draggable
  let isDragging = false;
  let currentX;
  let currentY;
  let initialX;
  let initialY;

  // Use capture phase and make sure we capture events even over videos
  // Also add to window to catch events that bubble up
  header.addEventListener('mousedown', dragStart, true);
  window.addEventListener('mousemove', drag, true);
  window.addEventListener('mouseup', dragEnd, true);
  document.addEventListener('mousemove', drag, true);
  document.addEventListener('mouseup', dragEnd, true);

  function dragStart(e) {
    if (e.target.classList.contains('close-btn') || 
        e.target.classList.contains('size-btn') ||
        e.target.closest('.size-controls') ||
        e.target.closest('#resize-handle')) return;
    
    if (e.target === header || header.contains(e.target) || e.target.closest('.keyboard-header')) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      initialX = e.clientX - xOffset;
      initialY = e.clientY - yOffset;
      isDragging = true;
      container.style.cursor = 'grabbing';
      container.style.userSelect = 'none';
      container.style.pointerEvents = 'auto';
      // Force keyboard to top layer
      overlay.style.zIndex = '2147483647';
      container.style.zIndex = '2147483647';
      return false;
    }
  }

  function drag(e) {
    if (isDragging) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      currentX = e.clientX - initialX;
      currentY = e.clientY - initialY;

      // Only constrain if near screen edges (allow free movement otherwise)
      const rect = container.getBoundingClientRect();
      const padding = 20;
      const nearLeftEdge = currentX < padding;
      const nearTopEdge = currentY < padding;
      const nearRightEdge = currentX + rect.width > window.innerWidth - padding;
      const nearBottomEdge = currentY + rect.height > window.innerHeight - padding;
      
      if (nearLeftEdge || nearTopEdge || nearRightEdge || nearBottomEdge) {
        const constrained = constrainToScreen(currentX, currentY, container);
        xOffset = constrained.x;
        yOffset = constrained.y;
      } else {
        // Free movement when not near edges
        xOffset = currentX;
        yOffset = currentY;
      }

      setTranslate(xOffset, yOffset, container, currentScale);
      
      // Keep keyboard on top during drag
      overlay.style.zIndex = '2147483647';
      container.style.zIndex = '2147483647';
    }
  }

  function dragEnd(e) {
    if (isDragging) {
      e.preventDefault();
      e.stopPropagation();
      isDragging = false;
      container.style.cursor = 'move';
      
      // Use xOffset and yOffset which are the actual saved positions
      // Validate position before saving to prevent it from being way off-screen
      const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      
      // Ensure position is within reasonable bounds before saving
      const validX = Math.max(-viewportWidth * 0.3, Math.min(xOffset, viewportWidth * 1.3));
      const validY = Math.max(-viewportHeight * 0.3, Math.min(yOffset, viewportHeight * 1.3));
      
      xOffset = validX;
      yOffset = validY;
      initialX = xOffset;
      initialY = yOffset;
      
      // Save position
      try {
        chrome.storage.local.set({ 
          keyboardX: validX, 
          keyboardY: validY 
        }, () => {
          if (chrome.runtime.lastError) {
            console.log('Storage error:', chrome.runtime.lastError);
          }
        });
      } catch (e) {
        console.log('Error saving position:', e);
      }
      
      // Ensure overlay stays visible and on top
      overlay.style.display = 'block';
      overlay.style.visibility = 'visible';
      overlay.style.zIndex = '2147483647';
      container.style.visibility = 'visible';
      container.style.zIndex = '2147483647';
    }
  }

  // Highlight keys when pressed
  document.addEventListener('keydown', handleKeyPress, true);

  // Add escape key to close
  const escapeHandler = (e) => {
    if (keyboardVisible && e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      toggleKeyboard();
      return false;
    }
  };
  document.addEventListener('keydown', escapeHandler, true);

  return overlay;
}

// Handle key press to highlight keys
function handleKeyPress(event) {
  if (!keyboardVisible) return;

  // Don't highlight if it's the toggle shortcut
  if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'a') {
    return;
  }

  const key = event.key.toLowerCase();
  // Try to find the key element
  let keyElement = keyboardOverlay.querySelector(`[data-en="${key}"]`);
  if (!keyElement && event.key.length === 1) {
    keyElement = keyboardOverlay.querySelector(`[data-en="${event.key}"]`);
  }
  
  if (keyElement) {
    keyElement.classList.add('pressed');
    setTimeout(() => {
      keyElement.classList.remove('pressed');
    }, 200);
  }
}

// Toggle keyboard visibility
function toggleKeyboard() {
  // Prevent rapid toggling
  if (isToggling) {
    return;
  }
  
  isToggling = true;
  
  // Remove ALL existing overlays first (more aggressive cleanup)
  const existingOverlays = document.querySelectorAll('#arabic-keyboard-overlay');
  existingOverlays.forEach(overlay => {
    try {
      overlay.remove();
    } catch (e) {
      // Fallback cleanup
      overlay.style.display = 'none';
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    }
  });
  keyboardOverlay = null;
  
  keyboardVisible = !keyboardVisible;

  if (keyboardVisible) {
    // Load settings first, then create and show
    loadSavedSettings((settings) => {
      savedPosition = settings;
      
      // Double-check no overlays exist before creating
      const checkOverlays = document.querySelectorAll('#arabic-keyboard-overlay');
      if (checkOverlays.length > 0) {
        checkOverlays.forEach(ov => ov.remove());
      }
      
      keyboardOverlay = createKeyboardOverlay();
      
      if (keyboardOverlay) {
        // Ensure it's visible and on top
        keyboardOverlay.style.display = 'block';
        keyboardOverlay.style.zIndex = '2147483647';
        
        // Force a reflow to ensure positioning
        void keyboardOverlay.offsetHeight;
        
        isToggling = false;
      } else {
        isToggling = false;
      }
    });
  } else {
    // Hide all overlays
    const allOverlays = document.querySelectorAll('#arabic-keyboard-overlay');
    allOverlays.forEach(overlay => {
      overlay.style.display = 'none';
    });
    keyboardOverlay = null;
    isToggling = false;
  }

  // Save state
  try {
    if (chrome && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ keyboardVisible: keyboardVisible }, () => {
        if (chrome.runtime && chrome.runtime.lastError) {
          console.log('Storage error:', chrome.runtime.lastError);
        }
      });
    }
  } catch (e) {
    console.log('Error saving state:', e);
  }
}

// Load saved state on page load
try {
  chrome.storage.local.get(['keyboardVisible'], (result) => {
    if (chrome.runtime.lastError) {
      console.log('Storage error:', chrome.runtime.lastError);
      return;
    }
    if (result.keyboardVisible) {
      keyboardVisible = true;
      loadSavedSettings((settings) => {
        savedPosition = settings;
        keyboardOverlay = createKeyboardOverlay();
        keyboardOverlay.style.display = 'block';
      });
    }
  });
} catch (e) {
  console.log('Error loading state:', e);
}

// Listen for toggle messages from popup or background script
try {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggle') {
      toggleKeyboard();
      sendResponse({ success: true });
    }
    return true; // Keep the message channel open for async response
  });
} catch (e) {
  console.log('Error setting up message listener:', e);
}

