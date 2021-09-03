const EventEmitter = require('./event-emitter')

const guid = () => {
  function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
  }
  return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4())
}

// 任务对象封装
class TaskItem {
  constructor(data = {}) {
    this.guid = guid()
    this.running = false
    this.data = data // 数据对象
    data._tqTask = this // 封装对象的引用
  }
}

// 默认配置
const defaultConfig = {
  // 并发数
  concurrent: 3,
  //一个进程失败是否清空所有任务
  errorEmptyTask: false,
  // 任务处理 Promise 函数
  taskHandler: (task) => {
    return new Promise(resolve => {
      setTimeout(() => {
        console.log(task)
        resolve(task)
      }, 1000)
    })
  },
  getTaskMapKey: (task) => {
    return task.guid
  }
}

// 通用异步任务队列
class TaskQueue extends EventEmitter {
  constructor(options = {}) {
    super()
    this.taskMap = {}
    this.tasks = [] // 存储任务对象
    this.executing = [] // Promise 任务数组
    Object.assign(this, defaultConfig, options)
  }

  get executingNum() {
    return this.executing.length
  }

  // 添加任务
  addTask(item) {
    const task = new TaskItem(item)
    const key = this.getTaskMapKey(task)
    this.taskMap[key] = task
    this.tasks.push(task)
    this.execute()
  }

  addTasks(list) {
    list.forEach(item => this.addTask(item))
  }

  execute() {
    if (!this.tasks.length) {
      // console.log('all done')
      this.emit('allDone')
      return
    }
    if (this.executingNum >= this.concurrent) {
      return
    }
    // 过滤正在运行尚未结束的任务
    const availableTask = this.tasks.filter(item => !item.running)
    let lastCount = this.concurrent - this.executing.length
    // console.log('lastCount',lastCount)

    if (!lastCount) {
      return
    }

    let i = 0
    // 判断是否有剩余的资源执行剩余任务
    while (lastCount > 0 && i < availableTask.length) {
      const task = availableTask[i]
      // console.log('last task', this.tasks, i, task)
      i++
      lastCount--

      task.running = true
      const p = this.taskHandler(task, this)
        .then(tsk => {
          // console.log('done', tsk)
          this.emit('done', task)
          return tsk
        }).catch(e => {
          errReport(e)
          this.errorEmptyTask && this.removeAllTask()
          this.emit('error', e, task)
        }).finally(() => {
          // 清理已完成
          this.executing.splice(this.executing.indexOf(p), 1)
          this.removeTask(task)
          this.execute()
        })
      this.executing.push(p)
    }
    // Promise.all(this.executing).then(r => {
    //   console.log('done')
    //   this.execute()
    // })
  }

  //清空所有任务
  removeAllTask() {
    this.tasks = []
    this.taskMap = {}
  }

  // 移除任务（在此前需要先取消该任务的Promise）
  removeTask(task) {
    const key = this.getTaskMapKey(task)
    delete this.taskMap[key]

    const index = this.tasks.findIndex(v => v.guid === task.guid)
    // console.log('taskHandler then', tsk, index)
    if (index > -1) {
      this.tasks.splice(index, 1)
    }
  }
}

module.exports = {
  TaskItem,
  TaskQueue
}
