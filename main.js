const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');

let mainWindow;
let settingsWindow;

const PUBLIC_DIR = path.join(__dirname, 'public');
const BACKGROUND_DIR = path.join(PUBLIC_DIR, 'background');
const FONT_DIR = path.join(PUBLIC_DIR, 'fonts');
const CONFIG_DIR = path.join(PUBLIC_DIR, 'config');
const SETTINGS_FILE = path.join(CONFIG_DIR, 'settings.json');
function getExportedResultsDir() {
  return path.join(app.getPath('documents'), 'WordGame');
}

const DEFAULT_SETTINGS = {
  colors: {
    '--color-white': '#ffffff',
    '--color-black': '#000000',
    '--color-text': '#141414',
    '--color-light-text': '#fdfdfd',
    '--color-background': '#f4f4f4',
    '--color-primary': 'rgb(50, 106, 129)',
    '--color-primary-hover': 'rgb(27, 112, 148)',
    '--color-border': '#cccccc',
    '--color-border-light': '#dddddd',
    '--color-border-white': 'rgb(212, 212, 212)',
    '--color-input-background': '#ffffff',
    '--color-input-text': '#000000',
    '--color-game-gray': '#333333',
    '--color-game-border': '#cacfca',
    '--color-game-selected': 'rgb(182, 182, 180)',
    '--color-match-0': '#4caf50',
    '--color-match-1': '#2196f3',
    '--color-match-2': '#ff9800',
    '--color-match-3': '#e91e63',
    '--color-match-4': '#329cc3',
    '--color-match-5': '#d226f0',
    '--color-match-6': '#38e36e',
    '--color-match-7': '#daff07',
    '--color-match-8': '#795548',
    '--color-match-9': '#607d8b',
    '--color-time-low': 'red',
    '--color-time-up': 'rgb(243, 61, 61)',
    '--color-congrats': 'rgb(92, 243, 92)',
    '--color-word-found': 'rgb(116, 192, 222)',
    '--color-table-hover': '#f1f1f1',
    '--color-score': 'rgba(255, 255, 255, 0.878)',
    '--color-result-heading': 'whitesmoke'
  },
  fontFamily: 'DynaPuff',
  fontFile: 'DynaPuff-VariableFont.ttf',
  backgrounds: {
    indexLandscape: 'start-screen.jpg',
    indexPortrait: 'start-screen-p.jpg',
    gameLandscape: 'game-background.jpg',
    gamePortrait: 'game-background-p.jpg',
    resultLandscape: 'leaderboard.jpg',
    resultPortrait: 'leaderboard-p.jpg',
    settingLandscape: 'setting.jpg',
    settingPortrait: 'setting-p.jpg',
    userLandscape: 'user.jpg',
    userPortrait: 'user-p.jpg'
  },
};

function ensureDirectories() {
  for (const dir of [BACKGROUND_DIR, FONT_DIR, CONFIG_DIR, getExportedResultsDir()]) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function mergeSettings(saved) {
  const defaults = clone(DEFAULT_SETTINGS);
  if (!saved || typeof saved !== 'object') return defaults;

  defaults.colors = { ...defaults.colors, ...(saved.colors || {}) };
  defaults.backgrounds = { ...defaults.backgrounds, ...(saved.backgrounds || {}) };

  if (typeof saved.fontFamily === 'string' && saved.fontFamily.trim()) {
    defaults.fontFamily = saved.fontFamily.trim();
  }
  if (typeof saved.fontFile === 'string') defaults.fontFile = saved.fontFile;
  return defaults;
}

function readSettings() {
  ensureDirectories();

  if (!fs.existsSync(SETTINGS_FILE)) {
    const created = writeSettings(DEFAULT_SETTINGS);
    updateGlobalCss(created);
    return created;
  }

  try {
    const settings = mergeSettings(JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8')));
    updateGlobalCss(settings);
    return settings;
  } catch (error) {
    console.error('Error reading settings:', error);
    return clone(DEFAULT_SETTINGS);
  }
}

function writeSettings(settings) {
  ensureDirectories();
  const merged = mergeSettings(settings);
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(merged, null, 2), 'utf8');
  return merged;
}


function cssSafe(value) {
  return String(value || '').replace(/\\/g, '/').replace(/"/g, '\\"');
}

function updateGlobalCss(settings) {
  const globalCssPath = path.join(PUBLIC_DIR, 'css', 'global.css');
  if (!fs.existsSync(globalCssPath)) return;

  let css = fs.readFileSync(globalCssPath, 'utf8');
  const fontFile = settings.fontFile && fs.existsSync(path.join(FONT_DIR, settings.fontFile))
    ? settings.fontFile
    : '';
  const fontFamily = settings.fontFamily || 'sans-serif';
  const extension = path.extname(fontFile).toLowerCase();
  const format = extension === '.ttf' ? 'truetype' : extension === '.otf' ? 'opentype' : extension === '.woff2' ? 'woff2' : extension === '.woff' ? 'woff' : '';

  const fontBlock = fontFile
    ? `@font-face {\n  font-family: "${cssSafe(fontFamily)}";\n  src: url("../fonts/${encodeURIComponent(fontFile)}")${format ? ` format("${format}")` : ''};\n  font-weight: 100 900;\n  font-style: normal;\n  font-display: swap;\n}\n`
    : '';

  css = css.replace(/^@font-face\s*\{[\s\S]*?\}\s*/m, fontBlock);

  const backgroundMap = {
    '--bg-index-landscape': settings.backgrounds.indexLandscape,
    '--bg-index-portrait': settings.backgrounds.indexPortrait,
    '--bg-game-landscape': settings.backgrounds.gameLandscape,
    '--bg-game-portrait': settings.backgrounds.gamePortrait,
    '--bg-result-landscape': settings.backgrounds.resultLandscape,
    '--bg-result-portrait': settings.backgrounds.resultPortrait,
    '--bg-setting-landscape': settings.backgrounds.settingLandscape,
    '--bg-setting-portrait': settings.backgrounds.settingPortrait,
    '--bg-user-landscape': settings.backgrounds.userLandscape,
    '--bg-user-portrait': settings.backgrounds.userPortrait
  };

  for (const [name, file] of Object.entries(backgroundMap)) {
    const value = file ? `url("../background/${encodeURIComponent(file)}")` : 'none';
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp('(^\\s*' + escapedName + ':\\s*)[^;]+;', 'm');
    css = css.replace(pattern, '$1' + value + ';');
  }

  const fontPattern = /(^\s*--font-family:\s*)[^;]+;/m;
  css = css.replace(fontPattern, '$1"' + cssSafe(fontFamily) + '", sans-serif;');

  for (const [name, value] of Object.entries(settings.colors || {})) {
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp('(^\\s*' + escapedName + ':\\s*)[^;]+;', 'm');
    css = css.replace(pattern, '$1' + value + ';');
  }

  fs.writeFileSync(globalCssPath, css, 'utf8');
}

function broadcastSettings(settings) {
  for (const win of BrowserWindow.getAllWindows()) {
    if (!win.isDestroyed()) {
      win.webContents.send('settings-updated', settings);
    }
  }
}

function safeFileName(fileName) {
  const base = path.basename(String(fileName || ''));
  if (!base || base === '.' || base === '..') {
    throw new Error('Invalid file name.');
  }
  return base;
}

function getAssetDirectory(type) {
  if (type === 'background') return BACKGROUND_DIR;
  if (type === 'font') return FONT_DIR;
  throw new Error('Invalid asset type.');
}

function listFiles(type) {
  const dir = getAssetDirectory(type);
  ensureDirectories();
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter(entry => entry.isFile())
    .map(entry => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

function assetFileUrl(type, fileName) {
  const file = safeFileName(fileName);
  const fullPath = path.join(getAssetDirectory(type), file);
  if (!fs.existsSync(fullPath)) return null;
  return require('url').pathToFileURL(fullPath).href;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    fullscreen: true,
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'public', 'background', 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'templates', 'index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function openSettingsWindow() {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.focus();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: 1100,
    height: 850,
    minWidth: 900,
    minHeight: 650,
    icon: path.join(__dirname, 'public', 'background', 'icon.ico'),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  settingsWindow.loadFile(path.join(__dirname, 'templates', 'settings.html'));

  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
}

app.whenReady().then(() => {
  ensureDirectories();
  readSettings();
  createWindow();

  globalShortcut.register('F2', () => {
    openSettingsWindow();
  });

  app.on('activate', () => {
    if (mainWindow === null) createWindow();
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('get-settings', () => {
  return readSettings();
});

ipcMain.handle('save-settings', (_event, settings) => {
  try {
    const saved = writeSettings(settings);
    updateGlobalCss(saved);
    broadcastSettings(saved);
    return { success: true, settings: saved };
  } catch (error) {
    console.error('Error saving settings:', error);
    return { success: false, message: error.message };
  }
});

ipcMain.handle('list-assets', (_event, type) => {
  try {
    return { success: true, files: listFiles(type) };
  } catch (error) {
    return { success: false, files: [], message: error.message };
  }
});

ipcMain.handle('asset-url', (_event, payload) => {
  try {
    if (!payload || !payload.type || !payload.fileName) throw new Error('Missing asset data.');
    return { success: true, url: assetFileUrl(payload.type, payload.fileName) };
  } catch (error) {
    return { success: false, url: null, message: error.message };
  }
});

ipcMain.handle('upload-asset', async (_event, payload) => {
  try {
    if (!payload || !payload.type || !payload.fileName || !payload.data) {
      throw new Error('Missing upload data.');
    }

    const type = payload.type;
    const targetName = safeFileName(payload.fileName);
    const dir = getAssetDirectory(type);
    const buffer = Buffer.from(payload.data);
    const targetPath = path.join(dir, targetName);

    fs.writeFileSync(targetPath, buffer);

    return {
      success: true,
      fileName: targetName,
      files: listFiles(type)
    };
  } catch (error) {
    console.error('Error uploading asset:', error);
    return { success: false, message: error.message };
  }
});

ipcMain.handle('delete-asset', (_event, payload) => {
  try {
    if (!payload || !payload.type || !payload.fileName) {
      throw new Error('Missing delete data.');
    }

    const fileName = safeFileName(payload.fileName);
    const targetPath = path.join(getAssetDirectory(payload.type), fileName);

    if (!fs.existsSync(targetPath)) {
      throw new Error('File does not exist.');
    }

    fs.unlinkSync(targetPath);
    return { success: true, files: listFiles(payload.type) };
  } catch (error) {
    console.error('Error deleting asset:', error);
    return { success: false, message: error.message };
  }
});

ipcMain.handle('export-results-excel', () => {
  try {
    const source = path.join(PUBLIC_DIR, 'results', 'result.xlsx');
    if (!fs.existsSync(source)) return { success: false, message: 'No result.xlsx file exists yet.' };
    ensureDirectories();
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const destination = path.join(getExportedResultsDir(), `result-${stamp}.xlsx`);
    fs.copyFileSync(source, destination);
    return { success: true, path: destination };
  } catch (error) {
    console.error('Error exporting results:', error);
    return { success: false, message: error.message };
  }
});

ipcMain.handle('delete-results-excel', () => {
  try {
    ensureDirectories();
    let deleted = 0;
    for (const entry of fs.readdirSync(getExportedResultsDir(), { withFileTypes: true })) {
      if (entry.isFile() && /\.xlsx$/i.test(entry.name)) {
        fs.unlinkSync(path.join(getExportedResultsDir(), entry.name));
        deleted++;
      }
    }
    return { success: true, deleted };
  } catch (error) {
    console.error('Error deleting exported results:', error);
    return { success: false, message: error.message };
  }
});

ipcMain.handle('save-result', async (_event, latestResult) => {
  try {
    const resultDir = path.join(__dirname, 'public', 'results');
    const filePath = path.join(resultDir, 'result.xlsx');

    if (!fs.existsSync(resultDir)) {
      fs.mkdirSync(resultDir, { recursive: true });
    }

    let existingData = [];
    let workbook;

    if (fs.existsSync(filePath)) {
      workbook = XLSX.readFile(filePath);
      if (workbook.Sheets.Results) {
        existingData = XLSX.utils.sheet_to_json(workbook.Sheets.Results);
      }
    } else {
      workbook = XLSX.utils.book_new();
    }

    existingData.push(latestResult);

    const worksheet = XLSX.utils.json_to_sheet(existingData);

    if (workbook.Sheets.Results) {
      workbook.Sheets.Results = worksheet;
    } else {
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Results');
    }

    XLSX.writeFile(workbook, filePath);

    return { success: true, message: 'Result saved successfully.' };
  } catch (error) {
    console.error('Error saving result:', error);
    return { success: false, message: error.message };
  }
});

ipcMain.handle('get-results', async () => {
  try {
    const resultDir = path.join(__dirname, 'public', 'results');
    const filePath = path.join(resultDir, 'result.xlsx');

    if (!fs.existsSync(filePath)) return [];

    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets.Results;

    if (!worksheet) return [];

    return XLSX.utils.sheet_to_json(worksheet);
  } catch (error) {
    console.error('Error reading results:', error);
    return [];
  }
});
