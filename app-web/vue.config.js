var path = require("path");
const resolve = dir => require('path').join(__dirname, dir);
var webpack = require('webpack');

module.exports = {
  publicPath: '/app-web',
  outputDir: "dist",
  productionSourceMap: true,
  configureWebpack: config => {
    let plugins = [
      new webpack.ProvidePlugin({
        'window.Quill': 'quill/dist/quill.js',
        'Quill': 'quill/dist/quill.js'
      }),
    ];
    config.plugins = [
      ...config.plugins,
      ...plugins
    ];
    if (process.env.NODE_ENV === 'production') {
      config.optimization.minimizer[0].options.terserOptions.compress.warnings = false
      config.optimization.minimizer[0].options.terserOptions.compress.drop_console = true
      config.optimization.minimizer[0].options.terserOptions.compress.drop_debugger = true
      config.optimization.minimizer[0].options.terserOptions.compress.pure_funcs = ['console.log']
    }
  },
  chainWebpack: config => {
    // 不编译 iView Pro
    config.module
        .rule('js')
        .test(/\.jsx?$/)
        .exclude
        .add(resolve('src/libs/iview-pro'))
        .end();

  }
};
