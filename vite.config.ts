import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['scripts']
  },
  build: {
    rollupOptions: {
      // Let Rollup decide optimal chunking to avoid circular chunk imports
    },
    chunkSizeWarningLimit: 1000,
    target: 'esnext',
    minify: 'esbuild',
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/fhir/R4': {
        target: 'https://api.medplum.com',
        changeOrigin: true,
        secure: true,
      },
      '/oauth2': {
        target: 'https://api.medplum.com',
        changeOrigin: true,
        secure: true,
      },
      '/storage': {
        target: 'https://api.medplum.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
