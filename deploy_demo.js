// 本文件仅用于测试构建，并无实际效果
const automate = require('./automate')
console.log('Start deploy demo...')

console.log('Params:', process.argv.slice(2))

let i = 0
let it = setInterval(() => {
  i += 1
  console.log(`Current percent: ${i}%`)
  if (i >= 100) {
    clearInterval(it)

    let isSuccess = Math.random() > 0.5

    if (isSuccess) {
      console.log('Demo Build Success! ✔✔✔')
    } else {
      console.error('Demo Build Failed! ❌❌❌')
    }

    automate.pushServerChan('Deploy Demo', `isSuccess: ${isSuccess}`)
    if (!isSuccess) {
      process.exit(1)
    }
  }
}, 500);

