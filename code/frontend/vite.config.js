
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer'; // <-- Import the plugin

export default defineConfig({
  plugins: [
    react(),
    visualizer({ open: true }), 
  ],
});