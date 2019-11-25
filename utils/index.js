const sh = require('shelljs')
const SimpleTask = require('./simple-task')

function padNum(num, len = 2) {
  return num.toString().padStart(len, '0')
}


/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
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
  /**
   * 获取日期和时间（用于文件名）
   */
  getDateTimeString() {
    const d = new Date()

    return `${d.getFullYear()}${padNum(d.getMonth()+1)}${padNum(d.getDate())}_${padNum(d.getHours())}${padNum(d.getMinutes())}${padNum(d.getSeconds())}${padNum(d.getMilliseconds())}`
  },
  /**
   * 生成随机字符串
   */
  genRandomString() {
    return (Math.random()).toString(36).split('.')[1]
  },
  /** 
   * 异步执行命令，使用 Promise 封装
   */
  asyncExec(command) {
    return new Promise((resolve, reject) => {
      try {
        sh.exec(command, { async: true, silent: false }, (code, stdout, stderr) => {
          if (stderr) {
            reject(stderr)
          }
          resolve({ code, stdout, stderr })
        })
      } catch (e) {
        reject(e)
      }
    })
  },
  SimpleTask,
  normalizePort
}
