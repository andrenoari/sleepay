let overlay = null;
let isInitialized = false;
let initializationAttempts = 0;
const MAX_ATTEMPTS = 5;
const RETRY_DELAY = 1000;

function initializeOverlay() {
  if (isInitialized) return;
  
  try {
    // Set up message listener first to ensure we don't miss any messages
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'showOverlay') {
        try {
          if (!overlay) {
            createOverlay();
          }
          overlay.classList.add('visible');
          sendResponse({success: true});
        } catch (error) {
          console.error('Error showing overlay:', error);
          sendResponse({success: false, error: error.message});
        }
      } else if (request.action === 'hideOverlay') {
        try {
          if (overlay) {
            overlay.classList.remove('visible');
          }
          sendResponse({success: true});
        } catch (error) {
          console.error('Error hiding overlay:', error);
          sendResponse({success: false, error: error.message});
        }
      }
      return true; // Keep the message channel open for async response
    });

    // Create a promise to track initialization
    const initPromise = new Promise((resolve, reject) => {
      const attemptInitialization = () => {
        if (initializationAttempts >= MAX_ATTEMPTS) {
          console.error('Max initialization attempts reached');
          reject(new Error('Max initialization attempts reached'));
          return;
        }

        initializationAttempts++;
        console.log(`Initialization attempt ${initializationAttempts}`);

        try {
          chrome.runtime.sendMessage({action: 'contentScriptReady'}, (response) => {
            if (chrome.runtime.lastError) {
              console.log(`Attempt ${initializationAttempts} failed:`, chrome.runtime.lastError);
              setTimeout(attemptInitialization, RETRY_DELAY);
            } else if (response && response.status === 'registered') {
              console.log('Content script successfully registered');
              resolve();
            } else {
              console.log(`Unexpected response:`, response);
              setTimeout(attemptInitialization, RETRY_DELAY);
            }
          });
        } catch (error) {
          console.error(`Error in attempt ${initializationAttempts}:`, error);
          setTimeout(attemptInitialization, RETRY_DELAY);
        }
      };

      attemptInitialization();
    });

    initPromise.catch(error => {
      console.error('Failed to initialize after all attempts:', error);
      isInitialized = false;
      initializationAttempts = 0;
      setTimeout(initializeOverlay, RETRY_DELAY * 2);
    });
    
    isInitialized = true;
    console.log('Sleepay: Content script initialized');
  } catch (error) {
    console.error('Error initializing content script:', error);
    isInitialized = false;
    initializationAttempts = 0;
    setTimeout(initializeOverlay, RETRY_DELAY * 2);
  }
}

function createOverlay() {
  overlay = document.createElement('div');
  overlay.id = 'sleepTimeOverlay';
  overlay.className = 'sleep-time-overlay';
  
  const image = document.createElement('img');
  image.src = chrome.runtime.getURL('sleep.jpg');
  image.alt = 'Sleepay';
  image.onerror = () => {
    console.error('Failed to load sleep time image');
    image.style.display = 'none';
    // Show text message as fallback
    const message = document.createElement('div');
    message.className = 'sleep-time-message';
    message.textContent = "It's past your bedtime! Time to rest.";
    overlay.appendChild(message);
  };
  
  overlay.appendChild(image);
  document.body.appendChild(overlay);
}

// Initialize when the content script loads
initializeOverlay();