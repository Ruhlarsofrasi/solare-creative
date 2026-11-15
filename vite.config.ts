import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Set `base` if the site is served from a sub-path (e.g. '/orbit/').
export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 1400,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          r3f: ['@react-three/fiber', '@react-three/drei', '@react-three/postprocessing', 'postprocessing'],
        },
      },
    },
  },
  server: { port: 5173, host: true },
  preview: { port: 4173 },
});
