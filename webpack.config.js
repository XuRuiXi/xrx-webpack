const PluginRun = require('./plugins/PluginRun');
const PluginDone = require('./plugins/PluginDone');
const pluginEmit = require('./plugins/pluginEmit');
const path = require('path');

module.exports = {
  mode: 'development',
  devtool: false,
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
  },
  entry: {
    main1: './src/index1.js',
    main2: './src/index2.js',
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          path.join(__dirname, './loaders/logger1.js'),
          path.join(__dirname, './loaders/logger2.js'),
        ],
      },
      {
        test: /\.png$/,
        use: [
          path.join(__dirname, './loaders/imgLoader.js'),
        ],
      }
    ],
  },
  plugins: [
    new PluginRun(),
    new PluginDone(),
    new pluginEmit(),
  ],
}