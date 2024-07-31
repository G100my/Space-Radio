import { fileURLToPath, URL } from 'node:url'
import svgLoader from 'vite-svg-loader'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueDevTools from 'vite-plugin-vue-devtools'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  optimizeDeps: {
    include: ['firebase/app', 'firebase/database', 'firebase/analytics'],
    exclude: ['firebase'],
  },
  base: './',
  build: {
    outDir: './dist/',
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [vue(), svgLoader(), VueDevTools()],
  server: {
    port: 3000,
  },
}))
