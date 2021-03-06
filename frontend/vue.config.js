module.exports = {
  outputDir: '../app_dist',
  publicPath: './',
  pages: {
    index: {
      entry: 'src/main.js',
      template: 'public/index.html',
      title: 'Automate.js',
      chunks: ['chunk-vendors', 'chunk-common', 'index']
    }
  }
}
