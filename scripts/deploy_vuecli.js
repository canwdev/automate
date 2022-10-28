const automate = require('../automate')
const {parseSSHConfig} = require('../utils')
const path = require('path')

async function run() {

  const config = await automate.loadConfigFile(path.join(__dirname, './config/vuecli3'))

  const {
    branch,
    projectName,
    projectGit,
    productionDir,
    installCommand,
    buildCommand,
  } = config

  const sshConfig = parseSSHConfig(config.sshConfig)

  const startTime = +new Date()
  console.log(`>>> 当前时间戳: ${startTime}`)
  console.log(`>>> ${projectName} 开始部署 VueCLI3`)

  automate.checkEnv(['git', 'yarn'])

  automate.initProjectIfNotExist(projectName, projectGit)

  automate.cdProjectDir(projectName)

  automate.gitForcePull(branch)

  automate.exec((installCommand || 'npm install'), '安装依赖...')

  automate.exec((buildCommand || 'npm run build'), '构建中...')

  // 只打包dist文件夹内部的文件，不包括dist文件夹本身
  const distFile = automate.compressTarGz('dist', '-C dist .')

  await automate.sendFileExecuteCommands(sshConfig, {
    localFilePath: distFile.fullPath,
    prodFullDir: productionDir,
    prodFileName: distFile.filename
  }, [
    {
      dir: productionDir,
      // 删除除了'*.tgz'的所有文件
      command: `find . -type f -not -name '*.tgz' -print0 | xargs -0 -r rm --`
    }, {
      dir: productionDir,
      command: `tar xf dist.tgz && rm dist.tgz`
    }
  ])

  const endTime = +new Date()
  console.log(`>>> 当前时间戳: ${endTime}`)
  console.log(`>>> ✅ 部署成功！耗时 ${(endTime - startTime) / 1000} 秒 🎉`)
}
run()
