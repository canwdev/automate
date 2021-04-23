const {
  SimpleTask,
  asyncExec
} = require('./index')
const logDB = require('./log-db')

// 构建任务队列（自动执行）
const tasks = new SimpleTask()

/**
 * 开始执行构建，如果有多个任务会自动排队
 */
const startBuild = (config = {}) => {

  const {
    command,
    logName,
    timestamp = new Date().getTime(),
    message = null,
    branch = null
  } = config

  // 保存日志索引
  logDB.get('logs').push({
    command,
    logName,
    timestamp,
    message,
    branch,
  }).write()

  tasks.add(async function () {
    // 2>&1 | tee 的意思是在控制台输出日志的同时保存到文件
    await asyncExec(`node ${command} 2>&1 | tee logs/${logName}`)
  })
}

module.exports = {
  startBuild
}
