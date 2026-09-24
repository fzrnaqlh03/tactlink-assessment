import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Enable React's JSX syntax and development updates in Vite.
  plugins: [react()],
});
