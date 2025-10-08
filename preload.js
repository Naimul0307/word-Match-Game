// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('myAPI', {
    showAlert: (message) => {
        alert(message);
    },
    getAppVersion: () => {
        const electronApp = require('electron').app;
        return electronApp ? electronApp.getVersion() : 'unknown';
    },
    saveResult: (data) => {
        return ipcRenderer.invoke('save-result', data);
    },
    getResults: () => {
        return ipcRenderer.invoke('get-results');
    }
});
