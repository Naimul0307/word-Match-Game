const { contextBridge, ipcRenderer } = require('electron');

async function applyLiveSettings(settings) {
  if (!settings || typeof document === 'undefined') return;

  const root = document.documentElement;

  // Apply every saved color as one complete state. Never remove existing values.
  for (const [name, value] of Object.entries(settings.colors || {})) {
    if (value !== undefined && value !== null && value !== '') {
      root.style.setProperty(name, String(value));
    }
  }

  // Apply the selected font without replacing or resetting any other setting.
  if (settings.fontFamily) {
    root.style.setProperty('--font-family', `"${String(settings.fontFamily).replace(/"/g, '\\"')}", sans-serif`);
  }

  let style = document.getElementById('__live-font-style');
  if (!style) {
    style = document.createElement('style');
    style.id = '__live-font-style';
    document.head.appendChild(style);
  }

  if (settings.fontFile && settings.fontFamily) {
    const result = await ipcRenderer.invoke('asset-url', {
      type: 'font',
      fileName: settings.fontFile
    });
    if (result && result.success && result.url) {
      const ext = String(settings.fontFile).split('.').pop().toLowerCase();
      const format = ext === 'ttf' ? 'truetype' : ext === 'otf' ? 'opentype' : ext === 'woff2' ? 'woff2' : ext === 'woff' ? 'woff' : '';
      const family = String(settings.fontFamily).replace(/"/g, '\\"');
      style.textContent = `@font-face{font-family:"${family}";src:url("${result.url}?v=${Date.now()}")${format ? ` format("${format}")` : ''};font-weight:100 900;font-style:normal;font-display:swap;}`;
    }
  } else {
    style.textContent = '';
  }

  const backgroundMap = {
    indexLandscape: '--bg-index-landscape',
    indexPortrait: '--bg-index-portrait',
    gameLandscape: '--bg-game-landscape',
    gamePortrait: '--bg-game-portrait',
    resultLandscape: '--bg-result-landscape',
    resultPortrait: '--bg-result-portrait',
    settingLandscape: '--bg-setting-landscape',
    settingPortrait: '--bg-setting-portrait',
    userLandscape: '--bg-user-landscape',
    userPortrait: '--bg-user-portrait'
  };

  // Resolve actual files through Electron so the live background works immediately.
  await Promise.all(Object.entries(backgroundMap).map(async ([key, variable]) => {
    const file = settings.backgrounds && settings.backgrounds[key];
    if (!file) {
      root.style.setProperty(variable, 'none');
      return;
    }
    const result = await ipcRenderer.invoke('asset-url', { type: 'background', fileName: file });
    if (result && result.success && result.url) {
      root.style.setProperty(variable, `url("${result.url}?v=${Date.now()}")`);
    }
  }));
}

function applyCurrentSettingsOnPageLoad() {
  ipcRenderer.invoke('get-settings').then(settings => applyLiveSettings(settings)).catch(() => {});
}

document.addEventListener('DOMContentLoaded', applyCurrentSettingsOnPageLoad);

contextBridge.exposeInMainWorld('myAPI', {
  showAlert: (message) => alert(message),
  getAppVersion: () => 'unknown',
  saveResult: (data) => ipcRenderer.invoke('save-result', data),
  getResults: () => ipcRenderer.invoke('get-results'),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  listAssets: (type) => ipcRenderer.invoke('list-assets', type),
  assetUrl: (type, fileName) => ipcRenderer.invoke('asset-url', { type, fileName }),
  uploadAsset: (type, fileName, data) => ipcRenderer.invoke('upload-asset', { type, fileName, data }),
  deleteAsset: (type, fileName) => ipcRenderer.invoke('delete-asset', { type, fileName }),
  exportResultsExcel: () => ipcRenderer.invoke('export-results-excel'),
  deleteResultsExcel: () => ipcRenderer.invoke('delete-results-excel'),
  onSettingsUpdated: (callback) => {
    const listener = (_event, settings) => {
      applyLiveSettings(settings).finally(() => callback(settings));
    };
    ipcRenderer.on('settings-updated', listener);
    return () => ipcRenderer.removeListener('settings-updated', listener);
  }
});

