const { SyncHook } = require('tapable');
const Compilation = require('./Compilation');
const path = require('path');
const fs = require('fs');
class Compiler {
  constructor(options) {
    this.options = options;
    this.hooks = {
      run: new SyncHook(['compilation']), // 同步钩子
      done: new SyncHook(['stats']), // 同步钩子
      emit: new SyncHook(['compilation']),  // 同步钩子
    };
  }
  // 4、执行run方法，开始编译
  run(callback) {
    // 执行run钩子函数
    this.hooks.run.call('compilation');
    const onCompiled = (err, stats, fileDependencies) => {
      // 10.根据打包后的代码生成文件
      for (let filename in stats.assets) {
        console.log(filename);
        const content = stats.assets[filename];
        const outputPath = path.join(this.options.output.path, filename);
        fs.writeFileSync(outputPath, content, 'utf8');
      }

      fileDependencies.forEach(fileDependency => {
        // 监听文件的变化
        fs.watch(fileDependency, () => {
          this.compile(onCompiled);
        });
      });

    }
    this.compile(onCompiled);
    this.hooks.done.call('stats');
  }
  compile(onCompiled) {
    // 以后每开始一次编译，就会创建一个compilation对象
    const compilation = new Compilation(this.options);
    compilation.build(onCompiled);
  }
}

module.exports = Compiler;
