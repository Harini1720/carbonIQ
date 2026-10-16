import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
const apiTarget = 'http://localhost:3001'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true,
        configure: proxy => {
          proxy.on('proxyReq', (proxyRequest, request) => {
            if (request.headers.origin && request.headers.origin === `http://${request.headers.host}`) {
              proxyRequest.setHeader('origin', apiTarget)
            }
          })
        }
      }
    }
  }
})
