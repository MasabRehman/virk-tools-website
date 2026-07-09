import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import sri from '@small-tech/vite-plugin-sri';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), sri()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
