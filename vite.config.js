import vue from '@vitejs/plugin-vue'
import svgLoader from 'vite-svg-loader'

/**
 * @type {import('vite').UserConfig}
 */
export default ({ command }) => {
  return {
    plugins: [vue(), svgLoader()],
    optimizeDeps: {
      include: ['firebase/app', 'firebase/database', 'firebase/analytics'],
      exclude: ['firebase'],
    },
    base: command === 'build' ? '/Jukebox/' : './',
    build: {
      outDir: './docs/',
    },
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  }
}
