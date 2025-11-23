const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { net } = require('electron');

const KeySystem = require('./key-system');
const AIModel = require('./ai-model');

let mainWindow;
let keySystem = new KeySystem();
let aiModel = new AIModel();

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, 'assets/icon.png'),
    show: false,
    backgroundColor: '#0c0c0c',
    titleBarStyle: 'default',
    autoHideMenuBar: true
  });

  mainWindow.loadFile('index.html');
  
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Проверяем обновления через 3 секунды после запуска
    setTimeout(() => {
      checkForUpdates();
    }, 3000);
  });

  // Открываем DevTools в development режиме
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Проверка обновлений
function checkForUpdates() {
  const version = app.getVersion();
  const repo = 'pirokan/impulse-ai-app';
  
  const request = net.request({
    method: 'GET',
    protocol: 'https:',
    hostname: 'api.github.com',
    path: `/repos/${repo}/releases/latest`
  });
  
  request.setHeader('User-Agent', 'Impulse-AI-App');
  request.on('response', (response) => {
    let data = '';
    response.on('data', (chunk) => {
      data += chunk;
    });
    response.on('end', () => {
      try {
        const release = JSON.parse(data);
        const latestVersion = release.tag_name.replace('v', '');
        
        if (compareVersions(latestVersion, version) > 0) {
          dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: 'Доступно обновление',
            message: `Доступна новая версия Impulse AI ${latestVersion}\n\nЧто нового:\n${release.body || 'Улучшения и исправления ошибок'}`,
            detail: 'Хотите скачать новую версию?',
            buttons: ['Скачать', 'Позже'],
            defaultId: 0
          }).then(result => {
            if (result.response === 0) {
              require('electron').shell.openExternal(release.html_url);
            }
          });
        }
      } catch (error) {
        console.log('Ошибка проверки обновлений:', error);
      }
    });
  });
  
  request.on('error', (error) => {
    console.log('Ошибка сети:', error);
  });
  
  request.end();
}

function compareVersions(a, b) {
  const aParts = a.split('.').map(Number);
  const bParts = b.split('.').map(Number);
  
  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const aPart = aParts[i] || 0;
    const bPart = bParts[i] || 0;
    if (aPart !== bPart) {
      return aPart - bPart;
    }
  }
  return 0;
}

// IPC обработчики
ipcMain.handle('check-activation', async () => {
  return keySystem.isActivated();
});

ipcMain.handle('activate-app', async (event, key) => {
  const result = keySystem.validateKey(key);
  if (result) {
    keySystem.setActivated(key);
  }
  return result;
});

ipcMain.handle('generate-usernames', async (event, style, count = 6) => {
  try {
    const usernames = [];
    
    for (let i = 0; i < count; i++) {
      const username = await aiModel.generateUsername(style);
      if (username) {
        usernames.push(username);
      }
    }
    
    return { success: true, usernames };
  } catch (error) {
    console.error('Generation error:', error);
    return { success: false, error: 'Ошибка генерации' };
  }
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('check-updates', () => {
  checkForUpdates();
});

ipcMain.handle('open-github', () => {
  require('electron').shell.openExternal('https://github.com/pirokan/impulse-ai-app');
});

ipcMain.handle('reset-app', () => {
  keySystem.clearActivation();
  app.relaunch();
  app.exit();
});

// Запуск приложения
app.whenReady().then(() => {
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
