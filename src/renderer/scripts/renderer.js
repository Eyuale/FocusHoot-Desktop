// DOM Elements
const apiKeyInput = document.getElementById('api-key');
const saveKeyBtn = document.getElementById('save-key-btn');
const goalInput = document.getElementById('goal-input');
const startLockdownBtn = document.getElementById('start-lockdown-btn');
const stopLockdownBtn = document.getElementById('stop-lockdown-btn');
const setupSection = document.getElementById('setup-section');
const goalSection = document.getElementById('goal-section');
const statusSection = document.getElementById('status-section');
const currentGoalSpan = document.getElementById('current-goal');
const activityLog = document.getElementById('activity-log');

// State
let isLockdownActive = false;

// Initialize
async function init() {
  try {
    const settings = await window.electronAPI.getSettings();
    
    if (settings.apiKey) {
      apiKeyInput.value = '••••••••••••••••';
      enableGoalSection();
    }
    
    if (settings.lockdownActive) {
      showLockdownActive(settings.currentGoal);
    }
  } catch (error) {
    console.error('Initialization error:', error);
    addActivityLog('Error loading settings', 'error');
  }
}

// Enable goal section after API key is saved
function enableGoalSection() {
  startLockdownBtn.disabled = false;
  goalInput.disabled = false;
}

// Save API Key
saveKeyBtn.addEventListener('click', async () => {
  const apiKey = apiKeyInput.value.trim();
  
  if (!apiKey || apiKey === '••••••••••••••••') {
    alert('Please enter a valid API key');
    return;
  }
  
  try {
    saveKeyBtn.textContent = 'Saving...';
    saveKeyBtn.disabled = true;
    
    await window.electronAPI.setApiKey(apiKey);
    
    apiKeyInput.value = '••••••••••••••••';
    addActivityLog('API key saved successfully', 'success');
    enableGoalSection();
    
    saveKeyBtn.textContent = 'Save Key';
    saveKeyBtn.disabled = false;
  } catch (error) {
    console.error('Error saving API key:', error);
    alert('Failed to save API key. Please try again.');
    saveKeyBtn.textContent = 'Save Key';
    saveKeyBtn.disabled = false;
  }
});

// Start Lockdown
startLockdownBtn.addEventListener('click', async () => {
  const goal = goalInput.value.trim();
  
  if (!goal) {
    alert('Please enter your focus goal');
    return;
  }
  
  try {
    startLockdownBtn.textContent = 'Starting...';
    startLockdownBtn.disabled = true;
    
    const result = await window.electronAPI.startLockdown(goal);
    
    if (result.success) {
      showLockdownActive(goal);
      addActivityLog(`Lockdown started with goal: "${goal}"`, 'success');
      goalInput.value = '';
    } else {
      alert('Failed to start lockdown: ' + result.error);
      startLockdownBtn.textContent = 'Start Lockdown';
      startLockdownBtn.disabled = false;
    }
  } catch (error) {
    console.error('Error starting lockdown:', error);
    alert('Failed to start lockdown. Please check your API key and try again.');
    startLockdownBtn.textContent = 'Start Lockdown';
    startLockdownBtn.disabled = false;
  }
});

// Stop Lockdown
stopLockdownBtn.addEventListener('click', async () => {
  try {
    stopLockdownBtn.textContent = 'Stopping...';
    stopLockdownBtn.disabled = true;
    
    await window.electronAPI.stopLockdown();
    
    showLockdownInactive();
    addActivityLog('Lockdown stopped', 'info');
  } catch (error) {
    console.error('Error stopping lockdown:', error);
    alert('Failed to stop lockdown');
    stopLockdownBtn.textContent = 'Stop Lockdown';
    stopLockdownBtn.disabled = false;
  }
});

// Show lockdown active UI
function showLockdownActive(goal) {
  isLockdownActive = true;
  goalSection.style.display = 'none';
  statusSection.style.display = 'block';
  currentGoalSpan.textContent = goal;
  startLockdownBtn.textContent = 'Start Lockdown';
  startLockdownBtn.disabled = false;
}

// Show lockdown inactive UI
function showLockdownInactive() {
  isLockdownActive = false;
  goalSection.style.display = 'block';
  statusSection.style.display = 'none';
  stopLockdownBtn.textContent = 'Stop Lockdown';
  stopLockdownBtn.disabled = false;
}

// Add activity to log
function addActivityLog(message, type = 'info', details = null) {
  const noActivity = activityLog.querySelector('.no-activity');
  if (noActivity) {
    noActivity.remove();
  }
  
  const logItem = document.createElement('div');
  logItem.className = `activity-item ${type}`;
  
  const timestamp = new Date().toLocaleTimeString();
  
  let content = `
    <div class="timestamp">${timestamp}</div>
    <div class="app-name">${message}</div>
  `;
  
  if (details) {
    content += `<div class="reason">${details}</div>`;
  }
  
  logItem.innerHTML = content;
  
  // Add to top of log
  activityLog.insertBefore(logItem, activityLog.firstChild);
  
  // Keep only last 50 items
  const items = activityLog.querySelectorAll('.activity-item');
  if (items.length > 50) {
    items[items.length - 1].remove();
  }
}

// Listen for app blocked events
window.electronAPI.onAppBlocked((event, data) => {
  addActivityLog(
    `${data.appName} ${data.blocked ? 'BLOCKED' : 'ALLOWED'}`,
    data.blocked ? 'blocked' : 'allowed',
    data.reason
  );
});

// Listen for lockdown status changes
window.electronAPI.onLockdownStatusChange((status) => {
  if (status.active) {
    showLockdownActive(status.goal);
  } else {
    showLockdownInactive();
  }
});

// Initialize on load
init();