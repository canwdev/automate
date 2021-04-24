// 本文件仅用于测试构建，并无实际效果
const automate = require('./automate')
console.log('Start deploy demo...')

console.log('Params:', process.argv.slice(2))

let i = 0
let it = setInterval(() => {
  i += 10
  console.log(`Current percent: ${i}%`)
  if (i >= 100) {
    clearInterval(it)

    let isSuccess = Math.random() > 0.5
    let message = `Demo Build ${isSuccess ? 'Success' : 'Failed'}!`

    console.log(message)

    automate.pushServerChan('Deploy Demo', message)
    if (!isSuccess) {
      process.exit(1)
    }
  }
}, 1000);

