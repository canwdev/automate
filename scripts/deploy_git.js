const automate = require('../automate')
const path = require('path')

// 部署任何用git部署的项目
async function run() {
  const config = await automate.loadConfigFile(path.join(__dirname,'./config/git'))

  const projectName = config.projectName
  const productionDir = config.productionDir
  const sshConfig = {
    host: config.sshConfig.host,
    port: config.sshConfig.port || 22,
    username: config.sshConfig.username,
    privateKey: config.sshConfig.privateKey || require('os').homedir() + '/.ssh/id_rsa'
  }
  const sshCommands = []
  config.sshCommands.forEach(v=>{
    sshCommands.push({
      dir: productionDir,
      command: v
    })
  })

  const startTime = +new Date()
  console.log(`>>> 当前时间戳: ${startTime}`)
  console.log(`>>> ${projectName} 开始部署 git 项目`)

  // 连接远程服务器并执行代码
  await automate.sendFileExecuteCommands(sshConfig, null, sshCommands, false)

  const endTime = +new Date()
  console.log(`>>> 当前时间戳: ${endTime}`)
  console.log(`>>> ✅ 部署成功！耗时 ${(endTime - startTime) / 1000} 秒 🎉`)
}
run()
