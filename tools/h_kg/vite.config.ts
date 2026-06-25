import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/tools/h_kg/',
  build: {
    outDir: resolve(__dirname),
    emptyOutDir: false,
  },
  server: {
    port: 5174,
  },
})
