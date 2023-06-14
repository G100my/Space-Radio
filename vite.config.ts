import { fileURLToPath, URL } from 'node:url'
import svgLoader from 'vite-svg-loader'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

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
  plugins: [
    vue(),
    svgLoader(),
    VueI18nPlugin({
      defaultSFCLang: 'yaml',
      globalSFCScope: true,
    }),
  ],
  server: {
    port: 3000,
  },
}))
