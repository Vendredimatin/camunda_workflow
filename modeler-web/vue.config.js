var path = require("path");
const resolve = dir => require('path').join(__dirname, dir);
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')

module.exports = {
  publicPath: '/modeler-web',
  outputDir: "dist",
  productionSourceMap: true,
  configureWebpack: config => {
    let externals = {
      "BMap": "BMap"
    }
    config.externals = {
      ...config.externals,
      ...externals
    };
    if (process.env.NODE_ENV === 'production') {
      config.optimization.minimizer[0].options.terserOptions.compress.warnings = false
      config.optimization.minimizer[0].options.terserOptions.compress.drop_console = true
      config.optimization.minimizer[0].options.terserOptions.compress.drop_debugger = true
      config.optimization.minimizer[0].options.terserOptions.compress.pure_funcs = ['console.log']
    };
    config.plugins = [
      ...config.plugins,
      new MonacoWebpackPlugin({
        // available options are documented at https://github.com/Microsoft/monaco-editor-webpack-plugin#options
        languages: ['javascript', 'css', 'html', 'typescript', 'json']
      })
    ];
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
