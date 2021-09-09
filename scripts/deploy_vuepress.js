const automate = require('../automate')
const path = require('path')

async function run() {
  const config = await automate.loadConfigFile(path.join(__dirname,'./config/vuepress'))

  const {
    projectName,
    distDir,
    productionGit, // 这个是要发布的 git 地址，将强制推送，请勿填错！
    productionGits // 支持多个发布地址（数组），将忽略 productionGit
  } = config

  const startTime = +new Date()
  console.log(`>>> ${startTime}, ${projectName} 开始部署 VuePress`)

  automate.checkEnv(['git', 'yarn'])

  automate.cdProjectDir(projectName)

  automate.gitForcePull()

  automate.exec('yarn install', '安装依赖...')

  automate.exec('npm run build', '构建中...')

  if (productionGits) {
    productionGits.forEach(item => {
      const {url, desc} = item

      automate.gitForcePush(projectName, distDir, url, true)

      desc && console.log(`>>> ❇️ ` + desc)
    })
  } else {
    automate.gitForcePush(projectName, distDir, productionGit)
  }

  const endTime = +new Date()
  console.log(`>>> ✅ ${endTime}, 部署成功，耗时 ${(endTime - startTime) / 1000} 秒`)
}
run()
