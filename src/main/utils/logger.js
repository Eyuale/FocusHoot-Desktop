const fs = require('fs');
const path = require('path');
const { app } = require('electron');

const logDir = path.join(app.getPath('userData'), 'logs');
const logFile = path.join(logDir, 'app.log');

// Create logs directory if it doesn't exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

function log(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    data
  };

  const logString = `[${timestamp}] ${level.toUpperCase()}: ${message}${
    data ? ' | ' + JSON.stringify(data) : ''
  }\n`;

  // Write to file
  fs.appendFileSync(logFile, logString);

  // Also log to console
  console.log(logString.trim());
}

module.exports = {
  info: (message, data) => log('info', message, data),
  error: (message, data) => log('error', message, data),
  warn: (message, data) => log('warn', message, data),
  debug: (message, data) => log('debug', message, data)
};