// 更新自身
const automate = require('../automate')
const cp = require('child_process')

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

console.log('服务即将重启，请刷新页面。')

cp.exec(`node scripts/restart-service.js`)

process.exit(0)
