import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      input: {
        host: resolve(__dirname, 'host/index.html'),
        customer: resolve(__dirname, 'customer/index.html'),
      },
      output: {
        dir: 'dist',
        entryFileNames: chunkInfo => `${chunkInfo.name}/index.js`,
      },
    },
  },
})
