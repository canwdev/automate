const sh = require('shelljs')

var child = sh.exec('echo test', {async:true});

child.kill()
child.stdout.on('data', function(data) {
  console.log(data);
})
