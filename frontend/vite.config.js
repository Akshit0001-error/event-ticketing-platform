import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// FIX: export a function so we can read env vars for backend proxy target
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          // In dev: proxy to Spring Boot. In prod: VITE_API_BASE handles it.
          target: env.VITE_DEV_BACKEND || 'http://localhost:8080',
          changeOrigin: true,
        },
      },
    },
    build: {
      // Generate source maps for production error tracking
      sourcemap: false,
      // Chunk splitting for better caching
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
          },
        },
      },
    },
  }
})
