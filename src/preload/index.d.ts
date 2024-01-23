import { ElectronAPI } from '@electron-toolkit/preload';
import { api as customApi } from '@src/preload';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: typeof customApi;
  }
}
