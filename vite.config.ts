import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    pool: 'vmThreads',
    setupFiles: './src/test/setup.ts',
    css: { include: [/app\.css/] },
  },
});
