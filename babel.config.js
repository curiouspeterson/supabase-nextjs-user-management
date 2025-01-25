module.exports = {
  presets: ['next/babel'],
  plugins: [
    ['@babel/plugin-transform-runtime', {
      corejs: false,
      helpers: true,
      regenerator: true,
      useESModules: true
    }]
  ]
}; 