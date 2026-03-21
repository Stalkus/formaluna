import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // String so client code can compare with === 'true' (boolean define would inline true/false)
    'import.meta.env.VITE_DEPLOY_VERCEL': JSON.stringify(
      process.env.VERCEL === '1' ? 'true' : 'false',
    ),
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
