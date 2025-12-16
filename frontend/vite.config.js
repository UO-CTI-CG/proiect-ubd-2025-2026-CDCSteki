import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Frontend rulează pe 3000
    proxy: {
      // Proxy toate request-urile către /api către backend
      '/api': {
        target: 'http://localhost:3000', // Backend URL
        changeOrigin: true,
        secure: false,
      }
    }
  }
})