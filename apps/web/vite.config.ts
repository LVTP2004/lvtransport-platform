import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
    // Local development only: the browser calls /api on Vite,
    // which forwards requests to the Minisforum API, not the VPS.
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:4010',
        changeOrigin: false
      }
    }
  }
});
