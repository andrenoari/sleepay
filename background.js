// Wait for content scripts to load before first check
chrome.runtime.onInstalled.addListener(() => {
  setTimeout(() => {
    checkTime();
    // Check every minute after initial delay
    setInterval(checkTime, 60000);
  }, 2000);
});

let isInSleepWindow = false;
let readyTabs = new Set();

// Listen for content script ready messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'contentScriptReady' && sender.tab) {
    console.log(`Content script ready in tab ${sender.tab.id}`);
    readyTabs.add(sender.tab.id);
    sendResponse({status: 'registered'});
    
    if (isInSleepWindow) {
      chrome.tabs.sendMessage(sender.tab.id, {action: 'showOverlay'})
        .catch(error => console.log(`Failed to show overlay on ready tab ${sender.tab.id}:`, error));
    }
  }
  return true; // Keep the message channel open for async response
});

// Clean up removed tabs
chrome.tabs.onRemoved.addListener((tabId) => {
  readyTabs.delete(tabId);
});

function checkTime() {
  chrome.storage.sync.get(['sleepTime', 'wakeTime'], (result) => {
    if (!result.sleepTime || !result.wakeTime) return;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [sleepHours, sleepMinutes] = result.sleepTime.split(':');
    const sleepTimeMinutes = parseInt(sleepHours) * 60 + parseInt(sleepMinutes);
    
    const [wakeHours, wakeMinutes] = result.wakeTime.split(':');
    const wakeTimeMinutes = parseInt(wakeHours) * 60 + parseInt(wakeMinutes);

    const wasInSleepWindow = isInSleepWindow;
    
    if (sleepTimeMinutes <= wakeTimeMinutes) {
      // Normal case: sleep time is before wake time
      isInSleepWindow = currentTime >= sleepTimeMinutes && currentTime < wakeTimeMinutes;
    } else {
      // Edge case: sleep time is after wake time (crosses midnight)
      isInSleepWindow = currentTime >= sleepTimeMinutes || currentTime < wakeTimeMinutes;
    }

    if (isInSleepWindow && !wasInSleepWindow) {
      showOverlayOnAllTabs();
    } else if (!isInSleepWindow && wasInSleepWindow) {
      hideOverlayOnAllTabs();
    }
  });
}

function showOverlayOnAllTabs() {
  chrome.tabs.query({}, async (tabs) => {
    for (const tab of tabs) {
      if (readyTabs.has(tab.id)) {
        try {
          await chrome.tabs.sendMessage(tab.id, {action: 'showOverlay'});
          console.log(`Successfully sent message to tab ${tab.id}`);
        } catch (error) {
          console.log(`Failed to show overlay on tab ${tab.id}:`, error);
          readyTabs.delete(tab.id); // Remove tab if message fails
        }
      }
    }
  });
}

function hideOverlayOnAllTabs() {
  chrome.tabs.query({}, async (tabs) => {
    for (const tab of tabs) {
      if (readyTabs.has(tab.id)) {
        try {
          await chrome.tabs.sendMessage(tab.id, {action: 'hideOverlay'});
          console.log(`Successfully hidden overlay on tab ${tab.id}`);
        } catch (error) {
          console.log(`Failed to hide overlay on tab ${tab.id}:`, error);
          readyTabs.delete(tab.id);
        }
      }
    }
  });
}

// Listen for new tabs being created
chrome.tabs.onCreated.addListener((tab) => {
  if (isInSleepWindow) {
    // The content script will send a ready message when initialized
    // We'll show the overlay in the onMessage listener above
  }
});