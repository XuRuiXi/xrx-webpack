const PluginRun = require('./plugins/PluginRun');
const PluginDone = require('./plugins/PluginDone');
const path = require('path');

module.exports = {
  mode: 'production',
  devtool: false,
  extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
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
    ],
  },
  plugins: [
    new PluginRun(),
    new PluginDone(),
  ],
}