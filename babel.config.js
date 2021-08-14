module.exports = {
  // preset 順序是後項為先
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' }, debug: true }],
    ['babel-preset-vite', { env: true, glob: false }],
  ],
}
