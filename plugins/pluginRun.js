class pluginRun {
  constructor() {
    this.name = 'pluginRun';
  }
  apply(compiler) {
    compiler.hooks.run.tap(this.name, compiler => {
      // compiler表示的是Compiler的实例
    });
  }
}

module.exports = pluginRun;
