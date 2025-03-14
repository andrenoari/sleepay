# Sleepay - Sleep Time Reminder

Sleepay - A reminder you really need.

## Installation

1. Download or clone this repository to your local machine
2. Open Google Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" by toggling the switch in the top right corner
4. Click "Load unpacked" and select the directory containing the extension files
5. The Sleepay extension icon should now appear in your Chrome toolbar

## Usage

1. Click the extension icon in the Chrome toolbar to open the settings popup
2. Set your desired sleep time using the "Sleep Time" input
3. Set your target wake time using the "Wake Time" input
4. Click "Save Settings" to store your preferences
5. The extension will automatically calculate your sleep duration
6. When it's time to sleep, you'll receive a gentle reminder overlay

## Configuration

The extension stores your sleep schedule preferences using Chrome's storage API. Your settings will persist across browser sessions and can be updated at any time by clicking the extension icon and adjusting the times.

## Files Description

- `manifest.json`: Extension configuration and permissions
- `popup.html`: User interface for setting sleep/wake times
- `popup.js`: Handles user interactions and settings management
- `background.js`: Manages background processes and notifications
- `content.js`: Handles the display of sleep reminders
- `styles.css`: Styling for the popup and notifications

## Permissions

The extension requires the following permissions:
- Storage: To save your sleep schedule preferences
- Tabs: To display sleep reminders
- Active Tab: To interact with the current browser tab