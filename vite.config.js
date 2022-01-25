import vue from '@vitejs/plugin-vue'
import svgLoader from 'vite-svg-loader'
import vueI18n from '@intlify/vite-plugin-vue-i18n'
import path from 'path'

/**
 * @type {import('vite').UserConfig}
 */
export default ({ command }) => {
  return {
    plugins: [
      vue(),
      svgLoader(),
      vueI18n({
        defaultSFCLang: 'yaml',
        globalSFCScope: true,
        // eslint-disable-next-line no-undef
        include: path.resolve(__dirname, './src/i18n/**'),
      }),
    ],
    optimizeDeps: {
      include: ['firebase/app', 'firebase/database', 'firebase/analytics'],
      exclude: ['firebase'],
    },
    base: command === 'build' ? '/Space-Radio/' : './',
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
