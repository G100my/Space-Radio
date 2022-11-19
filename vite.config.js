import vue from '@vitejs/plugin-vue'

/**
 * @type {import('vite').UserConfig}
 */
export default ({ command }) => {
  return {
    plugins: [vue()],
    optimizeDeps: {
      include: ['firebase/app', 'firebase/database', 'firebase/analytics'],
      exclude: ['firebase'],
    },
    base: command === 'build' ? '/Space-Radio/' : './',
    build: {
      outDir: './docs/',
    },
  }
}
