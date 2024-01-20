import { ElectronStoreValues } from '@src/main/libs/store/type';
import ElectronStore from 'electron-store';

const defaultValues: ElectronStoreValues = {
  system: {
    isInitializedPythonEnv: false,
  },
  browser: {
    pageHistory: [],
    pages: {},
  },
};

const store = new ElectronStore<ElectronStoreValues>();

const storeValues = store.store;
store.set({ ...defaultValues, ...storeValues });

const resetStore = () => {
  const system = store.get('system');
  store.set({ ...defaultValues, system });
};

export { store, resetStore };
