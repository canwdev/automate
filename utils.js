const sh = require('shelljs')

function padNum(num, len = 2) {
  return num.toString().padStart(len, '0')
}

module.exports = {
  cd(dir, tip) {
    const result = sh.cd(dir)
    if (result.code === 1) sh.exit(1)
    tip && console.log(tip, sh.pwd().toString())
    return result
  },
  exec(command, description) {
    console.log('>>> '+ (description || command))
    const result = sh.exec(command)
    if (result.code === 1) sh.exit(1)

    return result
  },
  getDateTimeString() {
    const d = new Date()

    return `${d.getFullYear()}${padNum(d.getMonth()+1)}${padNum(d.getDate())}_${padNum(d.getHours())}${padNum(d.getMinutes())}${padNum(d.getSeconds())}`
  }
}
