const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    fullscreen: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'templates', 'settings.html'));

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  if (mainWindow === null) createWindow();
});

ipcMain.handle('save-result', async (event, latestResult) => {
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
      if (workbook.Sheets['Results']) {
        existingData = XLSX.utils.sheet_to_json(workbook.Sheets['Results']);
      }
    } else {
      workbook = XLSX.utils.book_new();
    }

    existingData.push(latestResult);

    const worksheet = XLSX.utils.json_to_sheet(existingData);

    if (workbook.Sheets['Results']) {
      workbook.Sheets['Results'] = worksheet;
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

    if (!fs.existsSync(filePath)) {
      return []; // no file yet
    }

    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets['Results'];

    if (!worksheet) return [];

    const data = XLSX.utils.sheet_to_json(worksheet);
    return data;
  } catch (error) {
    console.error('Error reading results:', error);
    return [];
  }
});
