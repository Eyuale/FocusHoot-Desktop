const Store = require('electron-store');

const schema = {
  geminiApiKey: {
    type: 'string',
    default: ''
  },
  lockdownActive: {
    type: 'boolean',
    default: false
  },
  currentGoal: {
    type: 'string',
    default: ''
  },
  blockedApps: {
    type: 'array',
    default: []
  },
  allowedApps: {
    type: 'array',
    default: []
  }
};

const store = new Store({ schema });

module.exports = {
  getApiKey: () => store.get('geminiApiKey'),
  setApiKey: (key) => store.set('geminiApiKey', key),
  
  getLockdownStatus: () => store.get('lockdownActive'),
  setLockdownStatus: (status) => store.set('lockdownActive', status),
  
  getCurrentGoal: () => store.get('currentGoal'),
  setCurrentGoal: (goal) => store.set('currentGoal', goal),
  
  getBlockedApps: () => store.get('blockedApps'),
  addBlockedApp: (app) => {
    const blocked = store.get('blockedApps');
    if (!blocked.includes(app)) {
      blocked.push(app);
      store.set('blockedApps', blocked);
    }
  },
  
  getAllowedApps: () => store.get('allowedApps'),
  addAllowedApp: (app) => {
    const allowed = store.get('allowedApps');
    if (!allowed.includes(app)) {
      allowed.push(app);
      store.set('allowedApps', allowed);
    }
  },
  
  clearSession: () => {
    store.set('lockdownActive', false);
    store.set('currentGoal', '');
    store.set('blockedApps', []);
    store.set('allowedApps', []);
  }
};