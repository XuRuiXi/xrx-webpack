const webpack = require('webpack');
const options = require('./webpack.config.js');
const compiler = webpack(options);
compiler.run((err, stats) => {
  // console.log('err', err);
  // console.log('stats', stats);
});

