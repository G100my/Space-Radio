/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  ignorePatterns: ['_*.*', '*.test.*', '__mocks__'],
  globals: {
    Spotify: 'readonly',
    SpotifyApi: 'readonly',
  },
  rules: {
    'vue/multi-word-component-names': ['off'],
  },
}
