const {TaskQueue} = require('./task-queue')
const BuildItem = require('../database/models/BuildItem')
const {
  asyncExec
} = require('./index')
const {
  LOG_PATH,
  builderConcurrent
} = require('../config')
const {
  BuildViewItem,
  BuildStatus
} = require('../enum/build')

const taskHandler = async (task) => {
  return new Promise(async (resolve, reject) => {
    const {data: item} = task
    try {
      const {
        command,
        logName
      } = item

      await BuildItem.update({
        buildStatus: BuildStatus.RUNNING
      }, {
        where: {
          id: item.id
        }
      })

      console.log('=== task start ===')
      // 2>&1 | tee 的意思是在控制台输出日志的同时保存到文件
      await asyncExec(`node ${command} 2>&1 | tee ${LOG_PATH}/${logName}`)
      console.log('=== task end ===')

      await BuildItem.update({
        buildStatus: BuildStatus.FINISH
      }, {
        where: {
          id: item.id
        }
      })

      resolve()
    } catch (e) {
      console.error('[taskHandler]', e)

      await BuildItem.update({
        buildStatus: BuildStatus.ERRORED
      }, {
        where: {
          id: item.id
        }
      })

      reject(e)
    }
  })
}

const buildTaskQueue = new TaskQueue({
  concurrent: builderConcurrent,
  taskHandler
})

/**
 * 开始执行构建，如果有多个任务会自动排队
 */
const startBuild = async (config = {}) => {

  // 保存日志索引
  const res = await BuildItem.create(config)

  const item = new BuildViewItem({
    ...config,
    id: res.id,
  })
  // 启动任务
  buildTaskQueue.addTask(item)
}

module.exports = {
  startBuild,
  buildTaskQueue
}
