import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        // Use the HTTP profile so local development does not depend on a developer SSL certificate.
        target: 'http://localhost:5064',
        changeOrigin: true,
      }
    }
  }
})
