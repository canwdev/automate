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
  BuildInstance,
  BuildStatus
} = require('../enum/build')

const handleFinish = async (item) => {
  await BuildItem.update({
    buildStatus: BuildStatus.FINISH
  }, {
    where: {
      id: item.id
    }
  })
}

const handleError = async (item, code) => {
  await BuildItem.update({
    buildStatus: code ? BuildStatus.ERRORED : BuildStatus.ABORTED
  }, {
    where: {
      id: item.id
    }
  })
}

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

      // 2>&1 | tee 的意思是在控制台输出日志的同时保存到文件
      // const runCommand = `node ${command} 2>&1 | tee ${LOG_PATH}/${logName}`
      item.start(`node ${command}`)

      item.once('finish', async () => {
        await handleFinish(item)
        resolve()
      })
      item.once('error', async (e) => {
        await handleError(item, e.code)
        reject(e)
      })


    } catch (e) {
      console.error('[taskHandler] error', e)
      await handleError(item, {code: -1})
      reject(e)
    }
  })
}

const buildTaskQueue = new TaskQueue({
  concurrent: builderConcurrent,
  taskHandler,
  getTaskMapKey: (task) => {
    const {data: item} = task
    return item.id
  }
})

/**
 * 开始执行构建，如果有多个任务会自动排队
 */
const startBuild = async (config = {}) => {

  // 保存日志索引
  const item = await BuildItem.create(config)

  const instance = new BuildInstance({
    ...config,
    id: item.id,
  })
  // 启动任务
  buildTaskQueue.addTask(instance)

  return {
    item,
    instance
  }
}

module.exports = {
  startBuild,
  buildTaskQueue
}
