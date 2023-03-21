class pluginRun {
  constructor() {
    this.name = 'pluginEmit';
  }
  apply(compiler) {
    compiler.hooks.emit.tap(this.name, compilation => {
      // compilation表示的是Compilation的实例
    });
  }
}

module.exports = pluginRun;
