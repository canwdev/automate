// 本文件仅用于测试构建，并无实际效果
console.log('>>> Start deploy no code...')

let i = 0
let it = setInterval(() => {
  i += 1
  console.log(`Current percent: ${i}%`)
  if (i >= 10) {
    clearInterval(it)

    let success = Math.random() > 0.5
    if (!success) {
      console.log('>>> Error! Deploy failed')
      process.exit(1)
    }


    console.log('>>> Success! Deploy complete')
  }
}, 1000);