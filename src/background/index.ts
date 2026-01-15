console.log('ScribbleFlow Background Service Worker Loaded');

// Placeholder for Auth and Sync logic
chrome.runtime.onInstalled.addListener(() => {
  console.log('ScribbleFlow installed');
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'openDashboard') {
        chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html') });
    }
});

export {};
