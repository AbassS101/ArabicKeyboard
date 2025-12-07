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
  // Remove any existing containers first
  const existingContainers = document.querySelectorAll('.keyboard-container');
  existingContainers.forEach(container => {
    try {
      container.remove();
    } catch (e) {
      container.style.display = 'none';
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    }
  });
  keyboardOverlay = null;

  // Create container directly (no overlay wrapper)
  const container = document.createElement('div');
  container.className = 'keyboard-container';
  container.innerHTML = `
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
      <!-- Row 1: QWERTY (left to right) -->
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
      <!-- Row 2: ASDF (left to right) -->
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
      <!-- Row 3: ZXCV (left to right) -->
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
        <p>QWERTY layout - English letters with Arabic equivalents</p>
      </div>
      <div style="font-size: 9px; color: rgba(255,255,255,0.7); text-align: center; margin-top: 6px;">
        Drag to move
      </div>
    </div>
  `;

  // Set initial display and position before appending
  container.style.display = 'block';
  container.style.visibility = 'visible';
  container.style.left = '50%';
  container.style.top = '50%';
  container.style.transform = 'translate(-50%, -50%) scale(1)';
  container.style.zIndex = '2147483647';
  
  // Append container directly to body (no overlay wrapper)
  const parentElement = document.body || document.documentElement;
  try {
    parentElement.appendChild(container);
  } catch (e) {
    if (document.body) {
      document.body.appendChild(container);
    }
  }

  // Get references
  const header = container.querySelector('.keyboard-header');
  const resizeHandle = container.querySelector('#resize-handle');
  
  // Overlay is now just the container (for compatibility with existing code)
  const overlay = container;
  
  // Store reference for cleanup
  overlay.id = 'arabic-keyboard-overlay-container';
  
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
  
  // Apply saved position and scale immediately - use left/top for fixed positioning
  function setTranslate(xPos, yPos, el, scale = currentScale) {
    el.style.left = xPos + 'px';
    el.style.top = yPos + 'px';
    el.style.transform = `scale(${scale})`;
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
    // Ensure container is visible
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
    
    // Update position using left/top for fixed positioning
    container.style.left = xOffset + 'px';
    container.style.top = yOffset + 'px';
    container.style.transform = `scale(${currentScale})`;
    container.style.transformOrigin = 'top left';
    
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

  // Ensure pointer events are set up correctly - container is already auto
  container.style.pointerEvents = 'auto';
  if (header) {
    header.style.pointerEvents = 'auto';
    header.style.cursor = 'move';
  }
  if (resizeHandle) {
    resizeHandle.style.pointerEvents = 'auto';
    resizeHandle.style.zIndex = '2147483648';
    resizeHandle.style.cursor = 'nwse-resize';
  }

  // Add click handler for close button
  container.querySelector('#close-keyboard').addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    toggleKeyboard();
  }, true);

  container.querySelector('#size-down').addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    if (currentScale > minScale) {
      currentScale = Math.max(minScale, currentScale - scaleStep);
      updateScale();
    }
  }, true);

  container.querySelector('#size-up').addEventListener('click', (e) => {
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

  // Manual resize handle - already got reference above
  let isResizing = false;
  let startX, startY, startWidth, startHeight;

  const resizeStartHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    isResizing = true;
    startX = e.clientX;
    startY = e.clientY;
    const rect = container.getBoundingClientRect();
    startWidth = rect.width;
    startHeight = rect.height;
    // Ensure resize handle is on top
    if (resizeHandle) {
      resizeHandle.style.zIndex = '2147483648';
      resizeHandle.style.pointerEvents = 'auto';
    }
    // Add global listeners for resize
    document.addEventListener('mousemove', handleResize, true);
    document.addEventListener('mouseup', stopResize, true);
    window.addEventListener('mousemove', handleResize, true);
    window.addEventListener('mouseup', stopResize, true);
    return false;
  };
  
  if (resizeHandle) {
    resizeHandle.addEventListener('mousedown', resizeStartHandler, true);
    // Also allow touch events for mobile
    resizeHandle.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        resizeStartHandler({
          preventDefault: () => e.preventDefault(),
          stopPropagation: () => e.stopPropagation(),
          stopImmediatePropagation: () => e.stopImmediatePropagation(),
          clientX: e.touches[0].clientX,
          clientY: e.touches[0].clientY
        });
      }
    }, true);
  }

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
    if (!isResizing) return;
    
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    isResizing = false;
    
    // Remove global listeners
    document.removeEventListener('mousemove', handleResize, true);
    document.removeEventListener('mouseup', stopResize, true);
    window.removeEventListener('mousemove', handleResize, true);
    window.removeEventListener('mouseup', stopResize, true);
  }

  // Make keyboard draggable
  let isDragging = false;
  let currentX;
  let currentY;
  let initialX;
  let initialY;

  // Simplified drag handler - allow dragging from header area
  const dragStartHandler = (e) => {
    // Check if we should allow dragging
    const target = e.target;
    if (!target) return;
    
    // Don't drag if clicking on buttons, resize handle, or keys
    if (target.classList.contains('close-btn') || 
        target.classList.contains('size-btn') ||
        target.classList.contains('key') ||
        target.closest('.size-controls') ||
        target.closest('#resize-handle') ||
        target.closest('.key') ||
        target.closest('.keyboard-layout')) {
      return;
    }
    
    // Only allow drag from header area
    if (target === header || 
        header.contains(target) || 
        target.closest('.keyboard-header') ||
        target.classList.contains('keyboard-title')) {
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
      container.style.zIndex = '2147483647';
      
      // Add global listeners
      document.addEventListener('mousemove', drag, true);
      document.addEventListener('mouseup', dragEnd, true);
      window.addEventListener('mousemove', drag, true);
      window.addEventListener('mouseup', dragEnd, true);
      
      return false;
    }
  };
  
  // Attach drag handlers with capture phase
  if (header) {
    header.addEventListener('mousedown', dragStartHandler, true);
  }
  
  // Also try attaching to container for better coverage
  if (container) {
    container.addEventListener('mousedown', (e) => {
      // Only handle if it's the container itself or header
      if (e.target === container || e.target.closest('.keyboard-header')) {
        dragStartHandler(e);
      }
    }, true);
  }

  function drag(e) {
    if (!isDragging) return;
    
    e.preventDefault();
    e.stopPropagation();
    
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

    // Update position using left/top for fixed positioning
    container.style.left = xOffset + 'px';
    container.style.top = yOffset + 'px';
    container.style.transform = `scale(${currentScale})`;
    container.style.transformOrigin = 'top left';
    
    // Keep keyboard on top during drag
    container.style.zIndex = '2147483647';
  }

  function dragEnd(e) {
    if (!isDragging) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Remove global listeners
    document.removeEventListener('mousemove', drag, true);
    document.removeEventListener('mouseup', dragEnd, true);
    window.removeEventListener('mousemove', drag, true);
    window.removeEventListener('mouseup', dragEnd, true);
    
    isDragging = false;
    container.style.cursor = 'move';
    
    // Validate position before saving
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    
    // Ensure position is within reasonable bounds before saving
    const validX = Math.max(-viewportWidth * 0.3, Math.min(xOffset, viewportWidth * 1.3));
    const validY = Math.max(-viewportHeight * 0.3, Math.min(yOffset, viewportHeight * 1.3));
    
    xOffset = validX;
    yOffset = validY;
    
    // Save position
    try {
      chrome.storage.local.set({ 
        keyboardX: validX, 
        keyboardY: validY 
      }, () => {
        if (chrome.runtime && chrome.runtime.lastError) {
          console.log('Storage error:', chrome.runtime.lastError);
        }
      });
    } catch (err) {
      console.log('Error saving position:', err);
    }
    
    // Ensure container stays visible
    container.style.display = 'block';
    container.style.zIndex = '2147483647';
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

  return container;
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
  
  // Remove ALL existing containers first
  const existingContainers = document.querySelectorAll('.keyboard-container');
  existingContainers.forEach(container => {
    try {
      container.remove();
    } catch (e) {
      container.style.display = 'none';
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    }
  });
  keyboardOverlay = null;
  
  keyboardVisible = !keyboardVisible;

  if (keyboardVisible) {
    // Load settings first, then create and show
    loadSavedSettings((settings) => {
      savedPosition = settings;
      
      // Double-check no containers exist before creating
      const checkContainers = document.querySelectorAll('.keyboard-container');
      if (checkContainers.length > 0) {
        checkContainers.forEach(cont => cont.remove());
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
    // Hide all containers
    const allContainers = document.querySelectorAll('.keyboard-container');
    allContainers.forEach(container => {
      container.style.display = 'none';
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

