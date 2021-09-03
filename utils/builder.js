const {TaskQueue} = require('./task-queue')
const {
  asyncExec
} = require('./index')
const logDB = require('./log-db')
const {
  LOG_PATH
} = require('../configs')
const {
  BuildItem
} = require('../enum/build')

const taskHandler = async (task) => {
  return new Promise(async (resolve, reject) => {
    try {
      const {data: item} = task
      const {
        command,
        logName
      } = item

      console.log('=== task start ===')
      // 2>&1 | tee 的意思是在控制台输出日志的同时保存到文件
      await asyncExec(`node ${command} 2>&1 | tee ${LOG_PATH}/${logName}`)
      console.log('=== task end ===')

      resolve()
    } catch (e) {
      console.error('[taskHandler]', e)
      reject(e)
    }
  })
}

const buildTaskQueue = new TaskQueue({
  concurrent: 1,
  taskHandler
})

/**
 * 开始执行构建，如果有多个任务会自动排队
 */
const startBuild = (config = {}) => {
  const item = new BuildItem(config)

  // 保存日志索引
  logDB.get('logs').push(item).write()

  buildTaskQueue.addTask(new BuildItem(item))
}

module.exports = {
  startBuild,
  buildTaskQueue
}
