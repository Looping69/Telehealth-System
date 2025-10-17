import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['scripts']
  },
  server: {
    proxy: {
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