const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Lockdown controls
  startLockdown: (goal) => ipcRenderer.invoke('start-lockdown', goal),
  stopLockdown: () => ipcRenderer.invoke('stop-lockdown'),
  
  // App monitoring
  getRunningApps: () => ipcRenderer.invoke('get-running-apps'),
  onAppBlocked: (callback) => ipcRenderer.on('app-blocked', callback),
  
  // Settings
  setApiKey: (key) => ipcRenderer.invoke('set-api-key', key),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  
  // Listeners
  onLockdownStatusChange: (callback) => {
    ipcRenderer.on('lockdown-status-changed', (event, status) => callback(status));
  }
});