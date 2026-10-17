import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// Vite lee el .env de la RAIZ del repositorio; solo las variables VITE_* llegan al navegador.
export default defineConfig({
  envDir: '../..',
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // En desarrollo el navegador habla solo con Vite y este reenvia /api a la API local
    proxy: { '/api': 'http://localhost:8000' },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
})
