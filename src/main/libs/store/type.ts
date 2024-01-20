import { BrowserPage, BrowserStates } from '@src/main/browser/type';

export type ElectronStoreValues = {
  system: {
    isInitializedPythonEnv: boolean;
  };
  browser: BrowserStates;
};
