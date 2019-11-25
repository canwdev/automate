// 本文件仅用于测试构建，并无实际效果
const timeFlag = Date.now()
console.log('>>> Start deploy no code...', timeFlag)

let i = 0
let it = setInterval(() => {
  i += 1
  console.log(`Current percent: ${i}%`)
  if (i >= 10) {
    clearInterval(it)

    let success = Math.random() > 0.5
    if (!success) {
      console.log('>>> 随机结果：Error! Deploy failed', timeFlag)
      process.exit(1)
    }


    console.log('>>> 随机结果：Success! Deploy complete', timeFlag)
  }
}, 1000);