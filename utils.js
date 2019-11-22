const sh = require('shelljs')

function padNum(num, len = 2) {
  return num.toString().padStart(len, '0')
}

/**
 * 简易自执行队列
 * 新建实例，然后使用 add 传入函数，这些函数会排队执行，函数要求：
 * 1. 函数必须返回 Promise 对象，或使用 async/await
 * 2. 函数不能相同！每次传入可以新生成函数，由于检测机制，相同的函数会并行执行！
 */
function SimpleTask() {
  this.tasks = []
}
SimpleTask.prototype.add = function (fn) {
  this.tasks.push(fn)

  const autorun = (fn) => {
    if (this.tasks[0] === fn) {
      this.tasks[0]().finally(() => {
        this.tasks.shift()
        console.log(this.tasks)
        if (this.tasks[0]) {
          autorun(this.tasks[0])
        }
      })
    }
  }

  autorun(fn)
}
SimpleTask.prototype.getList = function() {
  return this.tasks
}

// SimpleTask 示例：
/* 
var t = new Tasks()
for (let i = 0; i < 3; i++) {
  
  t.add(function () {
    return new Promise(resolve => {
      asyncShell('node ./deploy_null.js').finally(()=>{
        resolve()
      })
    })
  })
}
*/

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
  SimpleTask,
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
  normalizePort
}
