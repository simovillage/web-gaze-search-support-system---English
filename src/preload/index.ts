import { electronAPI } from '@electron-toolkit/preload';
import { contextBridge, ipcRenderer } from 'electron';

// Custom APIs for renderer
export const api = {
  launchBrowser: async () => await ipcRenderer.invoke('launch-browser'),
  closeBrowser: async () => await ipcRenderer.invoke('close-browser'),
  suggestKeywords: async () => await ipcRenderer.invoke('suggest-keywords'),
  openKeywordsModal: async () =>
    await ipcRenderer.invoke('open-keywords-modal'),
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
}
