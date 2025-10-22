import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['scripts']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'mantine-core': ['@mantine/core'],
          'mantine-hooks': ['@mantine/hooks'],
          'mantine-notifications': ['@mantine/notifications'],
          'mantine-modals': ['@mantine/modals'],
          'mantine-dates': ['@mantine/dates'],
          'medplum': ['@medplum/core'],
          'icons': ['lucide-react', '@tabler/icons-react'],
          'routing': ['react-router-dom'],
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    target: 'esnext',
    minify: 'esbuild',
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