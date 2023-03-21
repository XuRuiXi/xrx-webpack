// 使用posix模块来处理路径，保证路径的统一性(/)
const path = require('path').posix;
const fs = require('fs');
// babel的parser用来将源码转换成ast
const parser = require('@babel/parser');
// traverse用来遍历ast
const traverse = require('@babel/traverse').default;
// generator用来将ast转换成源码
const generator = require('@babel/generator').default;
const types = require('@babel/types');


// toUnix方法用来将路径中的\替换成/
const toUnix = path => path.replace(/\\/g, '/');
// 当前的工作目录
const baseDir = toUnix(process.cwd());

class Compilation {
  constructor(options) {
    // webpack的配置对象
    this.options = options;
    // 存放所有的依赖文件
    this.fileDependencies = [];
    // 存放所有的模块的依赖文件
    this.modules = [];
    // 存放所有的代码块
    this.chunks = [];
    // 存放打包后的chunk和模块的映射关系
    this.assets = {};
  }
  build(onCompiled){
    // 5、根据配置中的entry找到所有入口文件
    let entry = {};
    if (typeof this.options.entry === 'string') {
      entry.main = this.options.entry;
    } else if (typeof this.options.entry === 'object') {
      entry = this.options.entry;
    }

    for (let entryName in entry) {
      // 入口文件的绝对路径
      const entryPath = path.join(baseDir, entry[entryName]);
      this.fileDependencies.push(entryPath);
      // 获取入口文件的模块

      let entryModule = this.buildModule(entryName, entryPath);
      // 8.根据入口文件和依赖文件的关系，组装成一个包含多个模块的chunk
      let chunk = {
        // 代码块名称是入口文件的名称
        name: entryName,
        // 入口模块
        entryModule,
        // 入口模块的依赖模块
        modules: this.modules.filter(module => module.names.includes(entryName)),
      }

      this.chunks.push(chunk);
      // 9、根据chunk生成打包后的代码
      let fileName = this.options.output.filename.replace('[name]', entryName);
      this.assets[fileName] = getSource(chunk);
    }
    // 收集完所有的依赖文件后，执行回调函数，让fs.watch监听文件的变化
    onCompiled(null, {
      // 打包后的代码
      assets: this.assets,
      // 打包后的chunk和模块的映射关系
      chunks: this.chunks,
      // 所有的依赖文件
      modules: this.modules,
    }, this.fileDependencies);
  }
  buildModule(name, modulePath) {
    // 6、根据入口文件路径，读取文件内容。调用所有配置的loader对文件内容进行转换
    let sourceCode = fs.readFileSync(modulePath, 'utf8');
    // 获取匹配该文件的loader
    const rules = this.options.module.rules;
    const matchedRules = rules.map(rule => {
      if (rule.test.test(modulePath)) {
        return rule.use;
      }
    });
    // 将匹配到的loader进行合并，然后调用loader对文件内容进行转换
    const loaders = matchedRules.flat(Infinity);
    sourceCode = loaders.reduceRight((sourceCode, loader) => {
      return require(loader).call(this, sourceCode);
    }, sourceCode);

    // 7、找出文件中的依赖模块，递归调用buildModule方法，对依赖模块进行处理
    // moduleId是当前模块的相对于根目录的路径
    let moduleId = './' + path.relative(baseDir, modulePath);

    // 创建当前的模块对象，用来存储当前模块的信息。包括模块的id、模块的名称、模块的依赖
    let module = {
      id: moduleId,
      names: [name],
      dependencies: [],
    }

    const ast = parser.parse(sourceCode, { sourceType: 'module' });
    traverse(ast, {
      CallExpression: ({ node }) => {
        if (node.callee.name === 'require') {
          // 依赖的文件路径 ./constant
          const depModuleName = node.arguments[0].value;
          // 当前模块的目录（绝对路径） C:/Users/xuruixi/Desktop/npm包发布/xrx-webpack/src
          const dirname = path.dirname(modulePath);
          // 依赖的文件的绝对路径
          let depModulePath = path.join(dirname, depModuleName);
          // 获取当前支持的扩展名
          const extensions = this.options.resolve.extensions;
          // 尝试添加扩展名，如果文件存在，则返回文件的绝对路径
          depModulePath = tryExtensions(depModulePath, extensions);
          // 把依赖的文件路径添加到依赖列表中，当文件发生变化时，重新编译
          this.fileDependencies.push(depModulePath);
          // 找到依赖模块的id
          const depModuleId = './' + path.relative(baseDir, depModulePath);
          // 修改ast中的require函数的参数，换成依赖模块的id
          node.arguments = [types.stringLiteral(depModuleId)];
          module.dependencies.push({ depModuleId, depModulePath });
        }
      }
    });
    // 使用generator将ast转换成源码
    const { code } = generator(ast);
    module._source = code;
    // 递归遍历依赖模块
    module.dependencies.forEach(({ depModuleId, depModulePath }) => {
      let buildModule = this.modules.find(module => module.id === depModuleId);
      if (!buildModule) {
        // depModuleId
        let depModule = this.buildModule(name, depModulePath);
        this.modules.push(depModule);
      } else {
        buildModule.names.push(name);
      }
    });
    return module;
  }
}

function tryExtensions(modulePath, extensions) {
  if (fs.existsSync(modulePath)) {
    return modulePath;
  }
  for (let i = 0; i < extensions.length; i++) {
    const filePath = modulePath + extensions[i];
    if (filePath) {
      return filePath;
    }
  }
  throw new Error(`${modulePath} not found`);
}


function getSource(chunk) {
  return `
  (() => {
    const modules = {
      ${chunk.modules.map(module => {
    return `'${module.id}': (module, exports, require) => {
        ${module._source}
      }`
  }).join(',')}
}
    const cache = {};
    function require(moduleId) {
      if (cache[moduleId]) {
        return cache[moduleId].exports;
      }
      const module = cache[moduleId] = {
        exports: {}
      };
      modules[moduleId](module, module.exports, require);
      return module.exports;
    }
    ${chunk.entryModule._source}
  })()
  `
}

module.exports = Compilation;