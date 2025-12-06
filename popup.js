document.getElementById('toggleBtn').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      // Check if we can inject scripts on this page
      const url = tabs[0].url;
      if (url.startsWith('chrome://') || url.startsWith('chrome-extension://') || url.startsWith('edge://')) {
        alert('This extension works on regular web pages. Please navigate to a website (like google.com) and try again.');
        return;
      }

      chrome.tabs.sendMessage(tabs[0].id, { action: 'toggle' })
        .catch((error) => {
          // If content script isn't ready, try to inject it
          if (error.message.includes('Could not establish connection') || error.message.includes('Receiving end does not exist')) {
            chrome.scripting.executeScript({
              target: { tabId: tabs[0].id },
              files: ['content.js']
            }).then(() => {
              // Inject CSS too
              chrome.scripting.insertCSS({
                target: { tabId: tabs[0].id },
                files: ['styles.css']
              }).then(() => {
                // Wait a moment for script to initialize, then send message
                setTimeout(() => {
                  chrome.tabs.sendMessage(tabs[0].id, { action: 'toggle' })
                    .catch(() => {
                      // If still fails, user needs to reload the page
                      alert('Please reload this page for the extension to work.');
                    });
                }, 200);
              });
            }).catch((err) => {
              console.log('Could not inject script:', err);
              alert('This page cannot be modified. Please try on a regular website.');
            });
          } else {
            console.error('Error:', error);
          }
        });
    }
  });
});

