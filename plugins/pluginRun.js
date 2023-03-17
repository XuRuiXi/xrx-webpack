class pluginRun {
  constructor() {
    this.name = 'pluginRun';
  }
  apply(compiler) {
    compiler.hooks.run.tap(this.name, compilation => {
      // console.log('The webpack build process is starting!!!');
    });
  }
}

module.exports = pluginRun;
