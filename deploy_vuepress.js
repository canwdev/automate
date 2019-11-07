const automate = require('./automate')

async function run() {

  const projectName = 'notes-vuepress'
  const distDir = 'docs/.vuepress/dist'
  const productionGit = 'git@gitee.com:canwdev/canwdev.git' // 将被覆盖，请勿填错！
  
  const startTime = +new Date()
  console.log(`>>> ${startTime}, ${projectName} 开始部署 VuePress`)

  automate.detectEnvironmentCommands(['git', 'yarn'])

  automate.cdProjectDir(projectName)

  automate.gitForcePull()

  automate.exec('yarn install', '安装依赖...')

  automate.exec('npm run build', '构建中...')

//  automate.gitForcePush(projectName, distDir, productionGit)

  const endTime = +new Date()
  console.log(`>>> ${endTime}, 部署成功，耗时 ${(endTime - startTime) / 1000} 秒`)
}
run()
