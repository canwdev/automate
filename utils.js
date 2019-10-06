const sh = require('shelljs')

module.exports = {
  cd(dir, tip) {
    const result = sh.cd(dir)
    if (result.code === 1) sh.exit(1)
    tip && console.log(tip, sh.pwd().toString())
    return result
  },
  exec(command) {
    const result = sh.exec(command)
    if (result.code === 1) sh.exit(1)

    return result
  }
}
