class pluginDone {
  constructor() {
    this.name = 'pluginDone';
  }
  apply(compiler) {
    compiler.hooks.done.tap(this.name, compilation => {
      // console.log('The webpack build process is end!!!');
    });
  }
}

module.exports = pluginDone;
