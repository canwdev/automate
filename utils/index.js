const sh = require('shelljs')

/**
 * JS生成全局唯一标识符
 */
const guid = () => {
  function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
  }

  return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4())
}

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
  guid,
  normalizePort,
  cd(dir, tip) {
    const result = sh.cd(dir)
    if (result.code === 1) sh.exit(1)
    tip && console.log(tip, sh.pwd().toString())
    return result
  },
  exec(command, description) {
    console.log(`>>> ${description ? '✴️' : '🚀'} ${description || command}`)
    const result = sh.exec(command)
    if (result.code === 1) sh.exit(1)

    return result
  },
  /**
   * 获取日期和时间（用于文件名）
   */
  getDateTimeString(d = new Date()) {
    return `${d.getFullYear()}${padNum(d.getMonth() + 1)}${padNum(d.getDate())}_${padNum(d.getHours())}${padNum(d.getMinutes())}${padNum(d.getSeconds())}${padNum(d.getMilliseconds())}`
  },
  /**
   * 生成随机字符串
   */
  genRandomString() {
    return Math.random().toString(36).substr(2)
  },
  /**
   * 异步执行命令，使用 Promise 封装
   */
  asyncExec(command, options) {
    options = options || {async: true, silent: false}
    return new Promise((resolve, reject) => {
      try {
        sh.exec(command, options, (code, stdout, stderr) => {
          if (stderr) {
            return reject(stderr)
          }
          return resolve({code, stdout, stderr})
        })
      } catch (e) {
        reject(e)
      }
    })
  },
  parseSSHConfig(sshConfig) {
    return {
      host: sshConfig.host,
      port: sshConfig.port || 22,
      username: sshConfig.username,
      password: sshConfig.password,
      privateKey: sshConfig.password ? undefined :
        (sshConfig.privateKey || require('os').homedir() + '/.ssh/id_rsa')
    }
  }
}
