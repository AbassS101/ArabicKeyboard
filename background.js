// Background service worker to handle keyboard shortcut
chrome.commands.onCommand.addListener((command) => {
  if (command === 'toggle-keyboard') {
    // Get the active tab and send message to content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        const url = tabs[0].url;
        // Skip chrome:// pages
        if (url.startsWith('chrome://') || url.startsWith('chrome-extension://') || url.startsWith('edge://')) {
          return;
        }

        chrome.tabs.sendMessage(tabs[0].id, { action: 'toggle' })
          .catch((error) => {
            // If content script isn't loaded, try to inject it
            if (error.message.includes('Could not establish connection') || error.message.includes('Receiving end does not exist')) {
              chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                files: ['content.js']
              }).then(() => {
                chrome.scripting.insertCSS({
                  target: { tabId: tabs[0].id },
                  files: ['styles.css']
                }).then(() => {
                  setTimeout(() => {
                    chrome.tabs.sendMessage(tabs[0].id, { action: 'toggle' })
                      .catch(() => {
                        // Silently fail - user can reload page if needed
                      });
                  }, 200);
                });
              }).catch(() => {
                // Can't inject on this page
              });
            }
          });
      }
    });
  }
});

