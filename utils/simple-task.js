/**
 * 简易自执行队列
 * 新建实例，然后使用 add 传入函数，这些函数会排队执行，函数要求：
 * 1. 函数必须返回 Promise 对象，或使用 async/await
 * 2. 函数不能相同！每次传入可以新生成函数，由于检测机制，相同的函数会并行执行！
 */
class SimpleTask {
  constructor() {
    this.tasks = []
  }

  addTask(fn) {
    this.tasks.push(fn)

    const autorun = (fn) => {
      const firstTask = this.tasks[0]
      if (firstTask === fn) {
        firstTask().finally(() => {
          this.tasks.shift()
          if (this.tasks[0]) {
            autorun(this.tasks[0])
          }
        })
      }
    }

    autorun(fn)
  }

  getList() {
    return this.tasks
  }
}

// alternative: fastq

module.exports = SimpleTask
