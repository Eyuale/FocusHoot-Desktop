const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const config = require('./utils/config');
const logger = require('./utils/logger');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    icon: path.join(__dirname, '../assets/icons/icon.png')
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}


function registerIpcHandlers() {
  ipcMain.handle('get-settings', async() => {
    try {
      logger.info('Getting settings');
      return {
        apiKey: config.getApiKey() ? '••••••••••••••••' : '',
        lockdownActive: config.getLockdownStatus(),
        currentGoal: config.getCurrentGoal()
      };

    } catch (error) {
       logger.error('Error getting settings', error);
      throw error;
    }
  })

  ipcMain.handle('set-api-key', async(event, apiKey) => {
    try {
      logger.info('Setting API key');
      config.setApiKey(apiKey);
      return { success: true}
    } catch (error) {
      logger.error('Error setting API key', error);
      throw error;
    }
  })

  ipcMain.handle('start-lockdown', async(event, goal) => {
    try {
      logger.info('Starting lockdown:', { goal});

      const apiKey = config.getApiKey();
      if (!apiKey) {
        return { success: false, error: 'API key not set'}
      }  

      config.setLockdownStatus(true);
      config.setCurrentGoal(goal);
      
      if (mainWindow) {
        mainWindow.webContents.send('lockdown-status-changed', {
          active: true,
          goal: goal
        })
      }  

      logger.info('Lockdown started successfully');
      return { success: true };
    } catch (error) {
      logger.error('Error starting lockdown', error);
      return { success: false, error: error.message };
    }
  })

  ipcMain.handle('stop-lockdown', async() => {
    try {
      logger.info('Stopping lockdown');

      config.setLockdownStatus(false);
      config.setCurrentGoal('');

      if (mainWindow) {
        mainWindow.webContents.send('lockdown-status-changed', {
          active: false,
          goal: ''
        })
      }

      // TODO: Stop app monitoring (we'll implement this next)
      logger.info('Lockdown stopped successfully');

      return { success: true };
    } catch (error) {
      logger.error('Error stopping lockdown', error);
      throw error;
    }
  })  

  ipcMain.handle('get-running-apps', async () => {
    try {
      logger.info('Getting running apps');
      // TODO: Implement actual app monitoring
      return [];
    } catch (error) {
      logger.error('Error getting running apps', error);
      throw error;
    }
  });

  logger.info('IPC handlers registered successfully');
}

app.whenReady().then(() => {
  registerIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Global error handling
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', error);
});

process.on('unhandledRejection', (error) => {
  logger.error('Unhandled rejection', error);
});


console.log('Focus Guardian started successfully!');