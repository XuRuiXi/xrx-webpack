function logger(scorce) {
  // console.log(this.query);
  return scorce + 'var logger = function() { console.log("logger1"); };';
}

// logger.pitch = function() {
//   return '8888';
// }


module.exports = logger;