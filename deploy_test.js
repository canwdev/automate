const sh = require('shelljs')

var instance = sh.exec('ls', {async: true})
instance.stdout.on('data', function(data) {
  console.log(data)
});
// console.log(instance)