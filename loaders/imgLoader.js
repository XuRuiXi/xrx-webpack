function imgLoader(source){
  const filename = this.resourcePath.split('\\').pop();
  this.emitFile(filename, source)
  return `module.exports = "${filename}"`;
}

// 设置为原始二进制
imgLoader.raw = true;

module.exports = imgLoader;
