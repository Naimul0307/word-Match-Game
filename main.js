const {
  app,
  BrowserWindow,
  ipcMain,
  globalShortcut
} = require('electron');

const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');
const { pathToFileURL } = require('url');


/* =========================================================
   WINDOWS
   ========================================================= */

let mainWindow = null;
let settingsWindow = null;


/* =========================================================
   APPLICATION DIRECTORIES
   ========================================================= */

/*
 * IMPORTANT:
 *
 * __dirname points inside app.asar after packaging.
 *
 * Therefore:
 *
 *     __dirname/public
 *
 * is READ ONLY when the application is installed.
 *
 * We use APP_PUBLIC_DIR for files that are shipped
 * with the application and USER_DATA_DIR for files
 * that the application needs to modify.
 */

const APP_PUBLIC_DIR =
  path.join(__dirname, 'public');


/*
 * Electron creates this location outside app.asar.
 *
 * Example:
 *
 * C:\Users\YourName\AppData\Roaming\Electron App
 *
 * This directory is writable.
 */

function getUserDataDir() {
  return app.getPath('userData');
}


/* =========================================================
   DEFAULT / INSTALLED FILES
   ========================================================= */

const APP_BACKGROUND_DIR =
  path.join(
    APP_PUBLIC_DIR,
    'background'
  );

const APP_FONT_DIR =
  path.join(
    APP_PUBLIC_DIR,
    'fonts'
  );

const APP_XML_DIR =
  path.join(
    APP_PUBLIC_DIR,
    'xml'
  );

const APP_WORDS_FILE =
  path.join(
    APP_XML_DIR,
    'words.xml'
  );

const APP_CONFIG_DIR =
  path.join(
    APP_PUBLIC_DIR,
    'config'
  );

const APP_SETTINGS_FILE =
  path.join(
    APP_CONFIG_DIR,
    'settings.json'
  );

const APP_RESULTS_DIR =
  path.join(
    APP_PUBLIC_DIR,
    'results'
  );

const APP_RESULTS_FILE =
  path.join(
    APP_RESULTS_DIR,
    'result.xlsx'
  );


/* =========================================================
   WRITABLE USER FILES
   ========================================================= */

function getUserBackgroundDir() {

  return path.join(
    getUserDataDir(),
    'background'
  );
}


function getUserFontDir() {

  return path.join(
    getUserDataDir(),
    'fonts'
  );
}


function getUserXmlDir() {

  return path.join(
    getUserDataDir(),
    'xml'
  );
}


function getUserConfigDir() {

  return path.join(
    getUserDataDir(),
    'config'
  );
}


function getUserSettingsFile() {

  return path.join(
    getUserConfigDir(),
    'settings.json'
  );
}


function getUserResultsDir() {

  return path.join(
    getUserDataDir(),
    'results'
  );
}


function getUserResultsFile() {

  return path.join(
    getUserResultsDir(),
    'result.xlsx'
  );
}


/* =========================================================
   EXPORTED FILES
   ========================================================= */

function getExportedResultsDir() {

  return path.join(
    app.getPath('documents'),
    'WordGame'
  );
}


function getExportedWordsDir() {

  return path.join(
    app.getPath('documents'),
    'WordGame'
  );
}


function getExportedWordsFile() {

  return path.join(
    getExportedWordsDir(),
    'words.xml'
  );
}


/* =========================================================
   DEFAULT SETTINGS
   ========================================================= */

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

  fontFile:
    'DynaPuff-VariableFont.ttf',


  backgrounds: {

    indexLandscape:
      'start-screen.jpg',

    indexPortrait:
      'start-screen-p.jpg',

    gameLandscape:
      'game-background.jpg',

    gamePortrait:
      'game-background-p.jpg',

    resultLandscape:
      'leaderboard.jpg',

    resultPortrait:
      'leaderboard-p.jpg',

    settingLandscape:
      'setting.jpg',

    settingPortrait:
      'setting-p.jpg',

    userLandscape:
      'user.jpg',

    userPortrait:
      'user-p.jpg'
  },


  /* Game settings */

  game: {

    timerDuration: 60,

    gridSize: 17,

    wordCount: 7
  }
};


/* =========================================================
   DIRECTORY SETUP
   ========================================================= */

function ensureDirectories() {

  const directories = [

    getUserBackgroundDir(),

    getUserFontDir(),

    getUserXmlDir(),

    getUserConfigDir(),

    getUserResultsDir(),

    getExportedResultsDir(),

    getExportedWordsDir()
  ];


  for (
    const directory
    of directories
  ) {

    if (
      !fs.existsSync(directory)
    ) {

      fs.mkdirSync(
        directory,
        {
          recursive: true
        }
      );
    }
  }
}


/* =========================================================
   CLONE SETTINGS
   ========================================================= */

function clone(value) {

  return JSON.parse(
    JSON.stringify(value)
  );
}


/* =========================================================
   MERGE SETTINGS
   ========================================================= */

function mergeSettings(saved) {

  const defaults =
    clone(DEFAULT_SETTINGS);


  if (
    !saved ||
    typeof saved !== 'object'
  ) {

    return defaults;
  }


  defaults.colors = {

    ...defaults.colors,

    ...(saved.colors || {})
  };


  defaults.backgrounds = {

    ...defaults.backgrounds,

    ...(saved.backgrounds || {})
  };


  defaults.game = {

    ...defaults.game,

    ...(saved.game || {})
  };


  if (
    typeof saved.fontFamily ===
      'string' &&
    saved.fontFamily.trim()
  ) {

    defaults.fontFamily =
      saved.fontFamily.trim();
  }


  if (
    typeof saved.fontFile ===
      'string'
  ) {

    defaults.fontFile =
      saved.fontFile;
  }


  return defaults;
}


/* =========================================================
   SETTINGS FILE
   ========================================================= */

function readSettings() {

  ensureDirectories();


  const settingsFile =
    getUserSettingsFile();


  /*
   * First installation:
   *
   * Create user settings from defaults.
   */

  if (
    !fs.existsSync(
      settingsFile
    )
  ) {

    return writeSettings(
      DEFAULT_SETTINGS
    );
  }


  try {

    const raw =
      fs.readFileSync(
        settingsFile,
        'utf8'
      );


    const settings =
      mergeSettings(
        JSON.parse(raw)
      );


    /*
     * Rewrite merged settings.
     *
     * This automatically adds new settings
     * when you release a newer version.
     */

    fs.writeFileSync(
      settingsFile,
      JSON.stringify(
        settings,
        null,
        2
      ),
      'utf8'
    );


    return settings;

  } catch (error) {

    console.error(
      'Error reading settings:',
      error
    );


    /*
     * If settings become corrupted,
     * restore defaults.
     */

    try {

      return writeSettings(
        DEFAULT_SETTINGS
      );

    } catch (writeError) {

      console.error(
        'Error restoring settings:',
        writeError
      );

      return clone(
        DEFAULT_SETTINGS
      );
    }
  }
}


/* =========================================================
   WRITE SETTINGS
   ========================================================= */

function writeSettings(settings) {

  ensureDirectories();


  const merged =
    mergeSettings(settings);


  const settingsFile =
    getUserSettingsFile();


  fs.writeFileSync(
    settingsFile,
    JSON.stringify(
      merged,
      null,
      2
    ),
    'utf8'
  );


  return merged;
}


/* =========================================================
   SAFE FILE NAME
   ========================================================= */

function safeFileName(fileName) {

  const base =
    path.basename(
      String(fileName || '')
    );


  if (
    !base ||
    base === '.' ||
    base === '..'
  ) {

    throw new Error(
      'Invalid file name.'
    );
  }


  return base;
}


/* =========================================================
   ASSET DIRECTORIES
   ========================================================= */

function getUserAssetDirectory(type) {

  if (
    type === 'background'
  ) {

    return getUserBackgroundDir();
  }


  if (
    type === 'font'
  ) {

    return getUserFontDir();
  }


  throw new Error(
    'Invalid asset type.'
  );
}


function getAppAssetDirectory(type) {

  if (
    type === 'background'
  ) {

    return APP_BACKGROUND_DIR;
  }


  if (
    type === 'font'
  ) {

    return APP_FONT_DIR;
  }


  throw new Error(
    'Invalid asset type.'
  );
}


/* =========================================================
   RESOLVE ASSET
   ========================================================= */

/*
 * User-uploaded files have priority.
 *
 * Example:
 *
 * User uploads:
 *
 *     start-screen.jpg
 *
 * Then that file overrides the packaged
 * start-screen.jpg.
 *
 * If the user file is deleted,
 * the packaged default automatically returns.
 */

function resolveAssetPath(
  type,
  fileName
) {

  const file =
    safeFileName(fileName);


  const userPath =
    path.join(
      getUserAssetDirectory(type),
      file
    );


  if (
    fs.existsSync(userPath)
  ) {

    return userPath;
  }


  const appPath =
    path.join(
      getAppAssetDirectory(type),
      file
    );


  if (
    fs.existsSync(appPath)
  ) {

    return appPath;
  }


  return null;
}


/* =========================================================
   LIST ASSETS
   ========================================================= */

function listFiles(type) {

  const userDirectory =
    getUserAssetDirectory(type);


  const appDirectory =
    getAppAssetDirectory(type);


  ensureDirectories();


  const names =
    new Set();


  /*
   * Add packaged/default files.
   */

  if (
    fs.existsSync(appDirectory)
  ) {

    for (
      const entry
      of fs.readdirSync(
        appDirectory,
        {
          withFileTypes: true
        }
      )
    ) {

      if (
        entry.isFile()
      ) {

        names.add(
          entry.name
        );
      }
    }
  }


  /*
   * Add user files.
   *
   * User files override default files
   * with the same name.
   */

  if (
    fs.existsSync(userDirectory)
  ) {

    for (
      const entry
      of fs.readdirSync(
        userDirectory,
        {
          withFileTypes: true
        }
      )
    ) {

      if (
        entry.isFile()
      ) {

        names.add(
          entry.name
        );
      }
    }
  }


  return Array.from(names)
    .sort(
      (a, b) =>
        a.localeCompare(b)
    );
}


/* =========================================================
   ASSET URL
   ========================================================= */

function assetFileUrl(
  type,
  fileName
) {

  const file =
    safeFileName(fileName);


  const fullPath =
    resolveAssetPath(
      type,
      file
    );


  if (
    !fullPath
  ) {

    return null;
  }


  return pathToFileURL(
    fullPath
  ).href;
}


/* =========================================================
   CSS HELPERS
   ========================================================= */

function cssSafe(value) {

  return String(value || '')
    .replace(
      /\\/g,
      '/'
    )
    .replace(
      /"/g,
      '\\"'
    );
}


/*
 * Escape a CSS URL.
 */

function cssFileUrl(filePath) {

  if (
    !filePath ||
    !fs.existsSync(filePath)
  ) {

    return 'none';
  }


  const url =
    pathToFileURL(
      filePath
    ).href;


  return `url("${cssSafe(url)}")`;
}


/* =========================================================
   BUILD DYNAMIC CSS
   ========================================================= */

/*
 * IMPORTANT:
 *
 * We DO NOT modify:
 *
 *     public/css/global.css
 *
 * because that file is inside app.asar after packaging.
 *
 * Instead we create a CSS override and inject it
 * into the BrowserWindow.
 */

function buildDynamicCss(settings) {

  let css = '';


  /* -------------------------------------------------------
     Font
     ------------------------------------------------------- */

  const fontFile =
    settings.fontFile &&
    resolveAssetPath(
      'font',
      settings.fontFile
    );


  const fontFamily =
    settings.fontFamily ||
    'sans-serif';


  if (
    fontFile
  ) {

    const extension =
      path.extname(
        fontFile
      ).toLowerCase();


    const format =
      extension === '.ttf'
        ? 'truetype'
        : extension === '.otf'
          ? 'opentype'
          : extension === '.woff2'
            ? 'woff2'
            : extension === '.woff'
              ? 'woff'
              : '';


    css += `
@font-face {
  font-family: "${cssSafe(fontFamily)}";
  src: url("${cssSafe(
    pathToFileURL(fontFile).href
  )}")${format ? ` format("${format}")` : ''};
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}
`;
  }


  /* -------------------------------------------------------
     Font variable
     ------------------------------------------------------- */

  css += `
:root {
`;


  css +=
    `  --font-family: "${cssSafe(fontFamily)}", sans-serif;\n`;


  /* -------------------------------------------------------
     Colors
     ------------------------------------------------------- */

  for (
    const [name, value]
    of Object.entries(
      settings.colors || {}
    )
  ) {

    css +=
      `  ${name}: ${value};\n`;
  }


  /* -------------------------------------------------------
     Backgrounds
     ------------------------------------------------------- */

  const backgroundMap = {

    '--bg-index-landscape':
      settings.backgrounds.indexLandscape,

    '--bg-index-portrait':
      settings.backgrounds.indexPortrait,

    '--bg-game-landscape':
      settings.backgrounds.gameLandscape,

    '--bg-game-portrait':
      settings.backgrounds.gamePortrait,

    '--bg-result-landscape':
      settings.backgrounds.resultLandscape,

    '--bg-result-portrait':
      settings.backgrounds.resultPortrait,

    '--bg-setting-landscape':
      settings.backgrounds.settingLandscape,

    '--bg-setting-portrait':
      settings.backgrounds.settingPortrait,

    '--bg-user-landscape':
      settings.backgrounds.userLandscape,

    '--bg-user-portrait':
      settings.backgrounds.userPortrait
  };


  for (
    const [name, file]
    of Object.entries(
      backgroundMap
    )
  ) {

    const backgroundPath =
      file
        ? resolveAssetPath(
            'background',
            file
          )
        : null;


    const value =
      cssFileUrl(
        backgroundPath
      );


    css +=
      `  ${name}: ${value};\n`;
  }


  css += `
}

body {
  font-family: "${cssSafe(fontFamily)}", sans-serif;
}
`;


  return css;
}


/* =========================================================
   APPLY DYNAMIC CSS
   ========================================================= */

async function applyDynamicCss(
  win,
  settings
) {

  if (
    !win ||
    win.isDestroyed()
  ) {

    return;
  }


  try {

    /*
     * Remove previous dynamic CSS.
     */

    if (
      win.__dynamicCssKey
    ) {

      try {

        await win.webContents.removeInsertedCSS(
          win.__dynamicCssKey
        );

      } catch (error) {

        /*
         * Ignore because the window may
         * have navigated/reloaded.
         */
      }

      win.__dynamicCssKey = null;
    }


    const css =
      buildDynamicCss(
        settings
      );


    win.__dynamicCssKey =
      await win.webContents.insertCSS(
        css
      );

  } catch (error) {

    console.error(
      'Error applying dynamic CSS:',
      error
    );
  }
}


/* =========================================================
   APPLY CSS TO ALL WINDOWS
   ========================================================= */

async function applyDynamicCssToAllWindows(
  settings
) {

  const windows =
    BrowserWindow.getAllWindows();


  for (
    const win
    of windows
  ) {

    await applyDynamicCss(
      win,
      settings
    );
  }
}


/* =========================================================
   BROADCAST SETTINGS
   ========================================================= */

function broadcastSettings(settings) {

  for (
    const win
    of BrowserWindow.getAllWindows()
  ) {

    if (
      !win.isDestroyed()
    ) {

      win.webContents.send(
        'settings-updated',
        settings
      );
    }
  }
}


/* =========================================================
   CREATE MAIN WINDOW
   ========================================================= */

function createWindow() {

  mainWindow =
    new BrowserWindow({

      width: 800,

      height: 600,

      fullscreen: true,

      autoHideMenuBar: true,

      icon:
        path.join(
          APP_BACKGROUND_DIR,
          'icon.ico'
        ),

      webPreferences: {

        preload:
          path.join(
            __dirname,
            'preload.js'
          ),

        contextIsolation: true,

        nodeIntegration: false
      }
    });


  mainWindow.loadFile(
    path.join(
      __dirname,
      'templates',
      'index.html'
    )
  );


  /*
   * Apply user settings after
   * the page has loaded.
   */

  mainWindow.webContents.once(
    'did-finish-load',
    async () => {

      const settings =
        readSettings();


      await applyDynamicCss(
        mainWindow,
        settings
      );
    }
  );


  mainWindow.on(
    'closed',
    () => {

      mainWindow = null;
    }
  );
}


/* =========================================================
   SETTINGS WINDOW
   ========================================================= */

function openSettingsWindow() {

  if (
    settingsWindow &&
    !settingsWindow.isDestroyed()
  ) {

    settingsWindow.focus();

    return;
  }


  settingsWindow =
    new BrowserWindow({

      width: 1100,

      height: 850,

      minWidth: 900,

      minHeight: 650,

      icon:
        path.join(
          APP_BACKGROUND_DIR,
          'icon.ico'
        ),

      autoHideMenuBar: true,

      webPreferences: {

        preload:
          path.join(
            __dirname,
            'preload.js'
          ),

        contextIsolation: true,

        nodeIntegration: false
      }
    });


  settingsWindow.loadFile(
    path.join(
      __dirname,
      'templates',
      'settings.html'
    )
  );


  settingsWindow.webContents.once(
    'did-finish-load',
    async () => {

      const settings =
        readSettings();


      await applyDynamicCss(
        settingsWindow,
        settings
      );
    }
  );


  settingsWindow.on(
    'closed',
    () => {

      settingsWindow = null;
    }
  );
}


/* =========================================================
   APPLICATION START
   ========================================================= */

app.whenReady().then(async () => {

  /*
   * Create all writable directories.
   */

  ensureDirectories();


  /*
   * Load/create user settings.
   */

  const settings =
    readSettings();


  /*
   * Create main window.
   */

  createWindow();


  /*
   * F2 opens settings.
   */

  globalShortcut.register(
    'F2',
    () => {

      openSettingsWindow();
    }
  );


  app.on(
    'activate',
    () => {

      if (
        mainWindow === null
      ) {

        createWindow();
      }
    }
  );


  /*
   * Make sure settings CSS is available
   * after application startup.
   */

  await applyDynamicCssToAllWindows(
    settings
  );
});


/* =========================================================
   APPLICATION EXIT
   ========================================================= */

app.on(
  'will-quit',
  () => {

    globalShortcut.unregisterAll();
  }
);


app.on(
  'window-all-closed',
  () => {

    if (
      process.platform !== 'darwin'
    ) {

      app.quit();
    }
  }
);


/* =========================================================
   SETTINGS IPC
   ========================================================= */

ipcMain.handle(
  'get-settings',
  () => {

    try {

      return readSettings();

    } catch (error) {

      console.error(
        'Error getting settings:',
        error
      );


      return clone(
        DEFAULT_SETTINGS
      );
    }
  }
);


ipcMain.handle(
  'save-settings',
  async (_event, settings) => {

    try {

      const saved =
        writeSettings(
          settings
        );


      /*
       * Apply CSS without modifying
       * files inside app.asar.
       */

      await applyDynamicCssToAllWindows(
        saved
      );


      broadcastSettings(
        saved
      );


      return {

        success: true,

        settings: saved
      };

    } catch (error) {

      console.error(
        'Error saving settings:',
        error
      );


      return {

        success: false,

        message:
          error.message
      };
    }
  }
);


/* =========================================================
   ASSET IPC
   ========================================================= */

ipcMain.handle(
  'list-assets',
  (_event, type) => {

    try {

      return {

        success: true,

        files:
          listFiles(type)
      };

    } catch (error) {

      console.error(
        'Error listing assets:',
        error
      );


      return {

        success: false,

        files: [],

        message:
          error.message
      };
    }
  }
);


ipcMain.handle(
  'asset-url',
  (_event, payload) => {

    try {

      if (
        !payload ||
        !payload.type ||
        !payload.fileName
      ) {

        throw new Error(
          'Missing asset data.'
        );
      }


      return {

        success: true,

        url:
          assetFileUrl(
            payload.type,
            payload.fileName
          )
      };

    } catch (error) {

      return {

        success: false,

        url: null,

        message:
          error.message
      };
    }
  }
);


/* =========================================================
   UPLOAD ASSET
   ========================================================= */

ipcMain.handle(
  'upload-asset',
  async (_event, payload) => {

    try {

      if (
        !payload ||
        !payload.type ||
        !payload.fileName ||
        !payload.data
      ) {

        throw new Error(
          'Missing upload data.'
        );
      }


      const type =
        payload.type;


      const targetName =
        safeFileName(
          payload.fileName
        );


      /*
       * ALWAYS write uploads to userData.
       *
       * NEVER write to app.asar.
       */

      const directory =
        getUserAssetDirectory(
          type
        );


      ensureDirectories();


      const buffer =
        Buffer.from(
          payload.data
        );


      const targetPath =
        path.join(
          directory,
          targetName
        );


      fs.writeFileSync(
        targetPath,
        buffer
      );


      /*
       * If this asset is currently selected
       * in settings, refresh the CSS.
       */

      const currentSettings =
        readSettings();


      await applyDynamicCssToAllWindows(
        currentSettings
      );


      broadcastSettings(
        currentSettings
      );


      return {

        success: true,

        fileName:
          targetName,

        files:
          listFiles(type)
      };

    } catch (error) {

      console.error(
        'Error uploading asset:',
        error
      );


      return {

        success: false,

        message:
          error.message
      };
    }
  }
);


/* =========================================================
   DELETE ASSET
   ========================================================= */

ipcMain.handle(
  'delete-asset',
  async (_event, payload) => {

    try {

      if (
        !payload ||
        !payload.type ||
        !payload.fileName
      ) {

        throw new Error(
          'Missing delete data.'
        );
      }


      const fileName =
        safeFileName(
          payload.fileName
        );


      /*
       * Only delete the USER copy.
       *
       * Never delete files from app.asar.
       */

      const userPath =
        path.join(
          getUserAssetDirectory(
            payload.type
          ),
          fileName
        );


      if (
        !fs.existsSync(
          userPath
        )
      ) {

        const appPath =
          path.join(
            getAppAssetDirectory(
              payload.type
            ),
            fileName
          );


        if (
          fs.existsSync(appPath)
        ) {

          throw new Error(
            'This is a default application asset and cannot be deleted. Upload a replacement if you want to override it.'
          );
        }


        throw new Error(
          'File does not exist.'
        );
      }


      fs.unlinkSync(
        userPath
      );


      /*
       * If a packaged default with the same
       * filename exists, it will automatically
       * become visible again.
       */

      const currentSettings =
        readSettings();


      await applyDynamicCssToAllWindows(
        currentSettings
      );


      broadcastSettings(
        currentSettings
      );


      return {

        success: true,

        files:
          listFiles(
            payload.type
          )
      };

    } catch (error) {

      console.error(
        'Error deleting asset:',
        error
      );


      return {

        success: false,

        message:
          error.message
      };
    }
  }
);


/* =========================================================
   WORDS XML
   ========================================================= */

/*
 * Returns the USER words.xml if it exists.
 *
 * Otherwise returns the packaged default.
 */

function getActiveWordsFile() {

  const userFile =
    path.join(
      getUserXmlDir(),
      'words.xml'
    );


  if (
    fs.existsSync(userFile)
  ) {

    return userFile;
  }


  if (
    fs.existsSync(APP_WORDS_FILE)
  ) {

    return APP_WORDS_FILE;
  }


  return null;
}


/*
 * Returns the status of words.xml.
 */

ipcMain.handle(
  'get-words-xml-info',
  () => {

    try {

      ensureDirectories();


      const activeFile =
        getActiveWordsFile();


      return {

        success: true,

        exists:
          !!activeFile,

        fileName:
          'words.xml',

        projectPath:
          activeFile
      };

    } catch (error) {

      console.error(
        'Error checking words.xml:',
        error
      );


      return {

        success: false,

        exists: false,

        fileName:
          'words.xml',

        message:
          error.message
      };
    }
  }
);


/* =========================================================
   UPLOAD WORDS XML
   ========================================================= */

ipcMain.handle(
  'upload-words-xml',
  (_event, data) => {

    try {

      if (!data) {

        throw new Error(
          'No XML file data received.'
        );
      }


      ensureDirectories();


      const buffer =
        Buffer.from(data);


      /*
       * Upload to USER DATA.
       */

      const userWordsFile =
        path.join(
          getUserXmlDir(),
          'words.xml'
        );


      fs.writeFileSync(
        userWordsFile,
        buffer
      );


      return {

        success: true,

        fileName:
          'words.xml',

        path:
          userWordsFile
      };

    } catch (error) {

      console.error(
        'Error uploading words.xml:',
        error
      );


      return {

        success: false,

        message:
          error.message
      };
    }
  }
);


/* =========================================================
   DELETE WORDS XML
   ========================================================= */

ipcMain.handle(
  'delete-words-xml',
  () => {

    try {

      const userWordsFile =
        path.join(
          getUserXmlDir(),
          'words.xml'
        );


      /*
       * Only delete the writable USER copy.
       */

      if (
        fs.existsSync(
          userWordsFile
        )
      ) {

        fs.unlinkSync(
          userWordsFile
        );


        return {
          success: true
        };
      }


      /*
       * Do not delete the packaged
       * default words.xml.
       */

      if (
        fs.existsSync(
          APP_WORDS_FILE
        )
      ) {

        throw new Error(
          'The default words.xml cannot be deleted.'
        );
      }


      throw new Error(
        'words.xml does not exist.'
      );

    } catch (error) {

      console.error(
        'Error deleting words.xml:',
        error
      );


      return {

        success: false,

        message:
          error.message
      };
    }
  }
);


/* =========================================================
   EXPORT WORDS XML
   ========================================================= */

ipcMain.handle(
  'export-words-xml',
  () => {

    try {

      const source =
        getActiveWordsFile();


      if (
        !source
      ) {

        return {

          success: false,

          message:
            'No words.xml file exists to export.'
        };
      }


      ensureDirectories();


      const destination =
        getExportedWordsFile();


      fs.copyFileSync(
        source,
        destination
      );


      return {

        success: true,

        path:
          destination
      };

    } catch (error) {

      console.error(
        'Error exporting words.xml:',
        error
      );


      return {

        success: false,

        message:
          error.message
      };
    }
  }
);


/* =========================================================
   RESULTS
   ========================================================= */

/*
 * Results are always USER data.
 *
 * Never write result.xlsx into app.asar.
 */

function getActiveResultsFile() {

  const userFile =
    getUserResultsFile();


  if (
    fs.existsSync(userFile)
  ) {

    return userFile;
  }


  /*
   * A packaged result file can be used as
   * a read-only starting point if one exists.
   */

  if (
    fs.existsSync(APP_RESULTS_FILE)
  ) {

    return APP_RESULTS_FILE;
  }


  return null;
}


/* =========================================================
   RESULTS EXPORT
   ========================================================= */

ipcMain.handle(
  'export-results-excel',
  () => {

    try {

      const source =
        getActiveResultsFile();


      if (
        !source
      ) {

        return {

          success: false,

          message:
            'No result.xlsx file exists yet.'
        };
      }


      ensureDirectories();


      const stamp =
        new Date()
          .toISOString()
          .replace(
            /[:.]/g,
            '-'
          );


      const destination =
        path.join(
          getExportedResultsDir(),
          `result-${stamp}.xlsx`
        );


      fs.copyFileSync(
        source,
        destination
      );


      return {

        success: true,

        path:
          destination
      };

    } catch (error) {

      console.error(
        'Error exporting results:',
        error
      );


      return {

        success: false,

        message:
          error.message
      };
    }
  }
);


/* =========================================================
   DELETE EXPORTED RESULTS
   ========================================================= */

ipcMain.handle(
  'delete-results-excel',
  () => {

    try {

      ensureDirectories();


      let deleted = 0;


      for (
        const entry
        of fs.readdirSync(
          getExportedResultsDir(),
          {
            withFileTypes: true
          }
        )
      ) {

        if (
          entry.isFile() &&
          /\.xlsx$/i.test(
            entry.name
          )
        ) {

          fs.unlinkSync(
            path.join(
              getExportedResultsDir(),
              entry.name
            )
          );


          deleted++;
        }
      }


      return {

        success: true,

        deleted
      };

    } catch (error) {

      console.error(
        'Error deleting exported results:',
        error
      );


      return {

        success: false,

        message:
          error.message
      };
    }
  }
);


/* =========================================================
   SAVE RESULT
   ========================================================= */

ipcMain.handle(
  'save-result',
  async (_event, latestResult) => {

    try {

      ensureDirectories();


      /*
       * IMPORTANT:
       *
       * This is now outside app.asar.
       */

      const resultDir =
        getUserResultsDir();


      const filePath =
        getUserResultsFile();


      let existingData = [];

      let workbook;


      if (
        fs.existsSync(filePath)
      ) {

        workbook =
          XLSX.readFile(
            filePath
          );


        if (
          workbook.Sheets.Results
        ) {

          existingData =
            XLSX.utils.sheet_to_json(
              workbook.Sheets.Results
            );
        }

      } else {

        /*
         * If there is a packaged result.xlsx,
         * start from it.
         */

        if (
          fs.existsSync(
            APP_RESULTS_FILE
          )
        ) {

          workbook =
            XLSX.readFile(
              APP_RESULTS_FILE
            );


          if (
            workbook.Sheets.Results
          ) {

            existingData =
              XLSX.utils.sheet_to_json(
                workbook.Sheets.Results
              );
          }

        } else {

          workbook =
            XLSX.utils.book_new();
        }
      }


      existingData.push(
        latestResult
      );


      const worksheet =
        XLSX.utils.json_to_sheet(
          existingData
        );


      if (
        workbook.Sheets.Results
      ) {

        workbook.Sheets.Results =
          worksheet;

      } else {

        XLSX.utils.book_append_sheet(
          workbook,
          worksheet,
          'Results'
        );
      }


      /*
       * Writes to:
       *
       * AppData/Roaming/Electron App/results/result.xlsx
       *
       * NOT app.asar.
       */

      XLSX.writeFile(
        workbook,
        filePath
      );


      return {

        success: true,

        message:
          'Result saved successfully.'
      };

    } catch (error) {

      console.error(
        'Error saving result:',
        error
      );


      return {

        success: false,

        message:
          error.message
      };
    }
  }
);


/* =========================================================
   GET RESULTS
   ========================================================= */

ipcMain.handle(
  'get-results',
  async () => {

    try {

      const filePath =
        getActiveResultsFile();


      if (
        !filePath ||
        !fs.existsSync(filePath)
      ) {

        return [];
      }


      const workbook =
        XLSX.readFile(
          filePath
        );


      const worksheet =
        workbook.Sheets.Results;


      if (
        !worksheet
      ) {

        return [];
      }


      return XLSX.utils.sheet_to_json(
        worksheet
      );

    } catch (error) {

      console.error(
        'Error reading results:',
        error
      );


      return [];
    }
  }
);
