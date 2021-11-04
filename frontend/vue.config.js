const isProd = process.env.NODE_ENV === 'production' // 'development'

module.exports = {
  outputDir: './dist',
  publicPath: './',
  pages: {
    index: {
      entry: 'src/main.js',
      template: 'public/index.html',
      title: 'Automate CI',
      chunks: ['chunk-vendors', 'chunk-common', 'index']
    }
  },
  configureWebpack: {
    externals: isProd ? [] : [
      {
        '@canwdev/tank-ui': 'tankUI',
      }
    ]
  },
  css: {
    // extract: false,
    sourceMap: false,
    loaderOptions: {
      sass: {
        prependData: `@import "@/styles/variables.scss";`
      }
    }
  },
}
