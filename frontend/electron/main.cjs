const path = require('node:path');
const { app, BrowserWindow, dialog, shell } = require('electron');
const { createApp } = require('../dist-desktop/backend.cjs');

const APP_PORT = 3210;
let mainWindow;
let server;
let quitting = false;

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(async () => {
    try {
      process.env.DATABASE_PATH = path.join(app.getPath('userData'), 'carbonvision.sqlite');
      const staticDirectory = path.join(__dirname, '..', 'dist');
      const api = createApp({ staticDirectory, production: false });
      server = api.listen(APP_PORT, '127.0.0.1');
      await new Promise((resolve, reject) => {
        server.once('listening', resolve);
        server.once('error', reject);
      });

      mainWindow = new BrowserWindow({
        width: 1440,
        height: 960,
        minWidth: 900,
        minHeight: 650,
        show: false,
        backgroundColor: '#f4f8f8',
        autoHideMenuBar: true,
        webPreferences: {
          contextIsolation: true,
          nodeIntegration: false,
          sandbox: true,
          webSecurity: true
        }
      });

      mainWindow.once('ready-to-show', () => mainWindow.show());
      mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('https://')) shell.openExternal(url);
        return { action: 'deny' };
      });
      mainWindow.webContents.on('will-navigate', (event, url) => {
        if (url !== `http://127.0.0.1:${APP_PORT}/`) event.preventDefault();
      });
      mainWindow.on('closed', () => {
        mainWindow = null;
        if (!quitting) app.quit();
      });
      await mainWindow.loadURL(`http://127.0.0.1:${APP_PORT}/`);
    } catch (error) {
      if (server) server.close();
      dialog.showErrorBox(
        'CarbonVision AI could not start',
        `The local app service could not start on port ${APP_PORT}.\n\n${error.message}`
      );
      app.quit();
    }
  });

  app.on('before-quit', event => {
    quitting = true;
    if (server?.listening) {
      event.preventDefault();
      server.close(() => {
        server = null;
        app.quit();
      });
    }
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
}
