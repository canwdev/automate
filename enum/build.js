const EventEmitter = require('../utils/task-queue/event-emitter')
const {BuildStatus} = require('./common')
const sh = require('shelljs')
const {
  LOG_PATH
} = require('../config')
const path = require('path')
const fs = require('fs')

// 默认item属性
class DefaultItemData {
  constructor() {
    this.id = null // database id
    this.command = ''
    this.logName = ''
    this.timestamp = new Date().getTime()
    this.message = null
    this.branch = null
    this.buildStatus = BuildStatus.WAITING
  }
}

// 合并默认属性
const mergeItemData = (data) => {
  const res = new DefaultItemData()

  for (const key in data) {
    // console.log(key, data[key], data[key] !== undefined, res[key])

    if (data[key] !== undefined && res[key] !== undefined) {
      res[key] = data[key]
    }
  }

  return res
}

class BuildInstance extends EventEmitter {
  constructor(props = {}) {
    super()
    Object.assign(this, mergeItemData(props))
  }

  async start(command = this.command) {
    console.log(`[build][id=${this.id}] 任务已启动`)
    const logPath = path.join(LOG_PATH, this.logName)

    const writeStream = fs.createWriteStream(logPath)

    const ps = sh.exec(command, {
      async: true,
      silent: true,
    }, (code, stdout, stderr) => {
      writeStream.end()
      console.log(`[build][id=${this.id}] 任务已结束, code=${code}`)
      if (code !== 0) {
        this.emit('error', {code, stdout, stderr})
        return
      }
      this.emit('finish', {code, stdout, stderr})
    })
    this.ps = ps

    ps.stdout.pipe(writeStream);
    ps.stderr.pipe(writeStream);


    // ps.stdout.on('data', async (data) => {
    //   // this.emit('stdout', data)
    // })
    //
    // ps.stderr.on('data', async (data) => {
    //   // this.emit('stderr', data)
    // })

    return ps
  }

  abort() {
    if (this.ps) {
      console.log(`[build][id=${this.id}] SIGINT 结束进程`)
      this.ps.kill('SIGINT')
      this.ps = null
    }
  }
}

module.exports = {
  BuildStatus,
  BuildInstance
}
