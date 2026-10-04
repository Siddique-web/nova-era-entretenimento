import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Em desenvolvimento, a API (npm run server) responde em /api
    proxy: { '/api': { target: 'http://localhost:3001', changeOrigin: true } },
  },
});
