import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/pi-api': {
        target: 'http://10.185.135.135:5001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/pi-api/, ''),
      }
    }
  }
})