// 更新自身
const automate = require('./automate')

console.log('开始更新 Automate...')
const args = process.argv.slice(2)
console.log('参数:', args)

automate.checkEnv(['git', 'yarn'])
automate.cd(__dirname, 'cd')
automate.execCommands([
  `git pull`,
  `yarn`
])

if (args[0] === 'frontend') {
  automate.execCommands([
    `yarn --cwd=frontend`,
    `yarn --cwd=frontend build`
  ])
}

automate.exec(`node restart-service.js`)

