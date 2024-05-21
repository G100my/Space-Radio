import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import svgLoader from 'vite-svg-loader'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), svgLoader()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 2405,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'host-script': ['./src/host/index.vue'],
          'customer-script': [
            './src/views/customer/index.vue',
            './src/views/customer/SearchMusic.vue',
            './src/views/customer/NowPlaying.vue',
            './src/views/customer/MyPlaylist.vue',
            './src/views/customer/Collects.vue',
          ],
        },
      },
    },
  },
})
