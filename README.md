# Arabic Keyboard Visual - Chrome Extension

A Chrome browser extension that displays a visual Arabic keyboard overlay to help you type Arabic characters anywhere on the web. Perfect for learning the Arabic keyboard layout or as a quick reference while typing.

## Description

**Arabic Keyboard Visual** is a lightweight Chrome extension that shows a floating, resizable Arabic keyboard overlay on any webpage. When you press keys on your physical keyboard, the corresponding keys on the visual keyboard highlight, showing you which Arabic character will be typed. This makes it easy to learn and reference the Arabic keyboard layout while typing in Arabic anywhere on the internet.

The keyboard overlay features a sleek, masculine dark design and can be moved, resized, and positioned anywhere on your screen. It works seamlessly on all websites including YouTube, social media platforms, and text editors.

## Features

- 🎹 **Visual Arabic keyboard layout overlay** - See the Arabic keyboard mapping at a glance
- ⌨️ **Keyboard shortcut toggle** - Press Ctrl+Shift+A (Cmd+Shift+A on Mac) to show/hide
- 🔘 **Extension popup toggle** - Click the extension icon for quick access
- 🎨 **Modern, masculine dark theme** - Sleek dark gray design that's easy on the eyes
- 📏 **Fully resizable** - Adjust size with +/- buttons or drag the corner handle
- 🖱️ **Draggable anywhere** - Move it to any position on your screen
- ✨ **Key highlighting** - Keys light up when you press them on your physical keyboard
- 💾 **Remembers preferences** - Saves your position, size, and visibility state
- 🚀 **Works everywhere** - Compatible with all websites including YouTube, Facebook, Gmail, etc.
- ⌨️ **Escape key support** - Press Escape to quickly close the keyboard
- 📱 **Responsive design** - Adapts to different screen sizes

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in the top right)
3. Click "Load unpacked"
4. Select the `ArabicKeyboard` folder
5. The extension is now installed!

## Usage

### Method 1: Keyboard Shortcut
- Press **Ctrl+Shift+A** (or **Cmd+Shift+A** on Mac) to toggle the keyboard overlay on/off

### Method 2: Extension Button
- Click the extension icon in the Chrome toolbar
- Click the "Toggle Keyboard" button

### Method 3: Close Button
- When the keyboard is visible, click the "×" button in the top right corner

## How It Works

The extension shows a visual representation of the Arabic keyboard layout. When you press keys on your physical keyboard, the corresponding keys on the visual keyboard will highlight, showing you which Arabic character will be typed.

The keyboard uses the standard Arabic keyboard layout mapping:
- Q = ض, W = ص, E = ث, etc.
- The visual keyboard helps you learn and reference the Arabic layout while typing

## Files Structure

- `manifest.json` - Extension configuration
- `content.js` - Main script that creates and manages the keyboard overlay
- `background.js` - Handles keyboard shortcut commands
- `popup.html` / `popup.js` - Extension popup interface
- `styles.css` - Styling for the keyboard overlay
- `icons/` - Extension icons (you'll need to add icon files here)

## Adding Icons

To add icons for the extension:
1. Create three icon sizes: 16x16, 48x48, and 128x128 pixels
2. Save them as `icon16.png`, `icon48.png`, and `icon128.png` in the `icons/` folder
3. You can use any image editor or online icon generator

## Notes

- The extension works on all websites
- The keyboard overlay appears as a modal on top of the page
- Your keyboard state preference is saved and restored when you reload pages

## License

Free to use and modify.

