const Compiler = require('./Compiler');
function webpack(options) {
  // 1、初始化参数,从shell传入和webpack.config.js文件中配置，合并参数，得出最终的参数
  const argv = process.argv.slice(2);
  const shellOptions = argv.reduce((memo, current) => {
    const [key, value] = current.split('=');
    memo[key.slice(2)] = value;
    return memo;
  }, {});
  const finallOptions = { ...options, ...shellOptions };

  // 2、根据参数初始化Compiler对象
  const compiler = new Compiler(finallOptions);
  // 3、加载所有配置的插件，执行对象的run方法
  finallOptions.plugins.forEach(plugin => {
    plugin.apply(compiler);
  });


  return compiler;
}

module.exports = webpack;
