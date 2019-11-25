
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

module.exports = SimpleTask