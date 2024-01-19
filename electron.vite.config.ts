import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';

export default defineConfig({
  main: {
    resolve: {
      alias: {
        '@src': resolve('src'),
        '@main': resolve('src/main'),
      },
    },
    plugins: [externalizeDepsPlugin()],
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    resolve: {
      alias: {
        '@src': resolve('src'),
        '@renderer': resolve('src/renderer/src'),
      },
    },
    plugins: [react()],
  },
});
