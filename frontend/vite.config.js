import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/analyze': { target: 'http://localhost:5000', changeOrigin: true },
      '/decide': { target: 'http://localhost:5000', changeOrigin: true },
      '/simulate': { target: 'http://localhost:5000', changeOrigin: true },
      '/audit': { target: 'http://localhost:5000', changeOrigin: true },
      '/health': { target: 'http://localhost:5000', changeOrigin: true },
    },
  },
})
