class pluginDone {
  constructor() {
    this.name = 'pluginDone';
  }
  apply(compiler) {
    compiler.hooks.done.tap(this.name, stats => {
      // stats是一个对象，包含了打包后的所有统计信息。
    });
  }
}

module.exports = pluginDone;
