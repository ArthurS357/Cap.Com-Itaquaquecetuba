import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react'; 

export default defineConfig({
  // plugins: [react()], // Descomente quando for testar React
  test: {
    passWithNoTests: true,
        // environment: 'jsdom',
  },
});