document.addEventListener('DOMContentLoaded', () => {
  const sleepTimeInput = document.getElementById('sleepTime');
  const wakeTimeInput = document.getElementById('wakeTime');
  const saveButton = document.getElementById('saveButton');
  const statusElement = document.getElementById('status');
  const sleepDurationElement = document.getElementById('sleepDuration');

  chrome.storage.sync.get(['sleepTime', 'wakeTime'], (result) => {
    if (result.sleepTime) {
      sleepTimeInput.value = result.sleepTime;
    }
    if (result.wakeTime) {
      wakeTimeInput.value = result.wakeTime;
    }
    updateSleepDuration();
  });

  function calculateSleepDuration(sleepTime, wakeTime) {
    if (!sleepTime || !wakeTime) return '--:--';

    const sleep = new Date(`2000/01/01 ${sleepTime}`);
    let wake = new Date(`2000/01/01 ${wakeTime}`);
    
    if (wake < sleep) {
      wake = new Date(`2000/01/02 ${wakeTime}`);
    }

    const diff = wake - sleep;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  }

  function updateSleepDuration() {
    const duration = calculateSleepDuration(sleepTimeInput.value, wakeTimeInput.value);
    sleepDurationElement.textContent = `Sleep Duration: ${duration}`;
  }

  function validateTimes() {
    if (!sleepTimeInput.value || !wakeTimeInput.value) {
      statusElement.textContent = 'Please set both sleep and wake times';
      statusElement.classList.add('error');
      return false;
    }
    return true;
  }

  sleepTimeInput.addEventListener('change', updateSleepDuration);
  wakeTimeInput.addEventListener('change', updateSleepDuration);

  saveButton.addEventListener('click', () => {
    if (!validateTimes()) return;

    const sleepTime = sleepTimeInput.value;
    const wakeTime = wakeTimeInput.value;

    chrome.storage.sync.set({ sleepTime, wakeTime }, () => {
      statusElement.classList.remove('error');
      statusElement.textContent = 'Settings saved!';
      setTimeout(() => {
        statusElement.textContent = '';
      }, 2000);
    });
  });
});