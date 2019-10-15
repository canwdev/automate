const automate = require('./automate')

async function run() {

  // ------ 使用步骤 ------
  // 1. 进入 projects 文件夹，克隆项目，并切换到要发布的分支
  // 2. 修改json配置文件（config_deploy_nuxt/???.json）
  // 3. 直接运行 node deploy_nuxt.js 或者带参数运行 node deploy_nuxt.js ???.json
  const config = await automate.loadConfigFile('./config_deploy_nuxt')

  const projectDir = config.projectName
  const branch = config.branch || 'master'
  const productionFiles = config.productionFiles
  const sshConfig = {
    host: config.sshConfig.host,
    username: config.sshConfig.username,
    privateKey: config.sshConfig.privateKey || require('os').homedir() + '/.ssh/id_rsa'
  }
  const productionDir = config.productionDir

  const startTime = +new Date()
  console.log(`>>> ${startTime}, ${projectDir} ${branch} 开始部署 Nuxt`)

  automate.detectEnvironmentCommands(['git', 'npm', '7z'])

  automate.cdProjectDir(projectDir)

  automate.gitForcePull(branch)

  automate.exec((config.installCommand || 'npm install'), '安装依赖...')

  automate.exec((config.buildCommand || 'npm run build'), '构建中...')

   const distFile = automate.compressTar7z(productionFiles, 'dist')

  await automate.sendFileExecuteCommands(sshConfig, {
    localFilePath: distFile.fullPath,
    prodFullDir: productionDir,
    prodFileName: distFile.filename
  }, [
    {
      dir: productionDir,
      command: `rm -rf ${productionFiles}`
    },
    {
      dir: productionDir,
      command: `7z x dist.tar.7z -y && tar xf dist.tar && rm dist.tar dist.tar.7z && pm2 restart ecosystem.config.js`
    }
  ])

  const endTime = +new Date()
  console.log(`>>> ${endTime}, 部署成功，耗时 ${(endTime - startTime) / 1000} 秒`)

  automate.archiveProductClean(projectDir, 'dist.tar.7z', branch+'-'+endTime)

  console.log('>>> 执行结束！')
}

run()
