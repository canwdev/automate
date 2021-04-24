const sh = require('shelljs')
const fs = require('fs')
const path = require('path')
const utils = require('./utils')
const {pushServerChan} = require('./utils/notify')
const cd = utils.cd
const exec = utils.exec
const getTimeStr = utils.getDateTimeString
const {
  PROJECT_PATH
} = require('./configs')

module.exports = {
  cd,
  exec,
  execCommands(commands) {
    for (let key in commands) {
      exec(commands[key])
    }
  },
  // 检测部署环境必要命令
  checkEnv(commands = ['git']) {
    let cmdNotFound = null
    commands.forEach(command => {
      if (!sh.which(command)) cmdNotFound = command
    })

    if (cmdNotFound) {
      sh.echo(`Sorry, this script requires ${commands}; but '${cmdNotFound}' not found`)
      sh.exit(1)
    } else {
      sh.echo('>>> Environment check OK')
    }
  },

  // 加载配置文件
  async loadConfigFile(configFolder) {
    const configFiles = sh.ls(configFolder)
    let configFile = process.argv.slice(2) || null

    if (configFile.length === 0) {
      const inquirer = require("inquirer")
      await inquirer.prompt([
        {
          type: 'list',
          name: 'configFile',
          message: '请选择一个配置文件',
          choices: configFiles,
        }
      ]).then(answers => {
        configFile = answers.configFile
      })
    }

    const config = require(configFolder + '/' + configFile)
    console.log('>>> 配置文件 ' + configFile)
    return config
  },
  // 检测项目文件夹是否存在
  isProjectDirExist(projectName) {
    if (!fs.existsSync(path.join(PROJECT_PATH, projectName))) {
      console.log('>>> 项目不存在')
      return false
    }
    return true
  },
  // 项目文件夹如果不存在则克隆项目
  initProjectIfNotExist(projectName, projectGit) {
    if (!this.isProjectDirExist(projectName)) {
      const projectDir = path.join(PROJECT_PATH, projectName)
      exec(`git clone ${projectGit} ${projectDir}`)
    }
  },

  // 跳转到项目目录
  cdProjectDir(projectName) {
    cd(path.join(PROJECT_PATH, projectName), '>>> ProjectDir')
  },
  // 强制拉取最新代码
  gitForcePull(branch = 'master') {
    exec('git reset --hard HEAD && git clean -f -d', 'GIT 重置分支...')
    // TODO: 这里如果分支不存在可能会报错
    exec(`git checkout ${branch} && git pull`, `GIT 拉取 ${branch} 代码...`)
    console.log('>>> 拉取结束')
  },

  /**
   * 创建新 git 项目并强制推送 (-f 危险），一般用于 pages
   * @param {string} projectName 项目目录
   * @param {string} distFolder 发布目录
   * @param {string} productionGit 要发布的远程 git 仓库
   * @param {boolean} clean 是否清除原来的仓库（危险）
   */
  gitForcePush(projectName, distFolder, productionGit, clean = false) {
    this.cdProjectDir(projectName)
    cd(distFolder)
    if (clean) {
      exec('rm -rf .git')
    }
    exec('git init && git add -A && git commit -m "deploy"')
    exec(`git push -f ${productionGit} master`)
  },

  // 打包成品：outputName为输出的压缩文件名，不要包含后缀; files为要打包的文件（夹）用空格隔开;
  // 返回一个对象，包含：完整的压缩包名称、带完整路径的名称
  compressTarGz(outputName = 'dist', files = 'dist') {
    const filename = outputName + '.tgz'
    exec(`tar czf ${filename} ${files}`, `${filename} 打包中...`)

    let size = sh.exec(`du -h ${filename}`, { silent: true }).toString().split('\t')[0]
    let pwd = sh.exec('pwd', { silent: true }).toString().split('\n')[0]
    let ret = {
      filename,
      fullPath: path.join(pwd, filename),
      size
    }
    console.log('>>> 打包结束 ' + JSON.stringify(ret))
    return ret
  },
  // 打包成品（7z），压缩率更高，但也更耗时（吃内存），用法与 compressTarGz 相同
  compressTar7z(outputName = 'dist', files = 'dist') {
    const tarName = outputName + '.tar'
    const _7zName = tarName + '.7z'

    exec(`tar cf ${tarName} ${files}`, `${tarName} 打包中...`)
    exec(`7z a ${_7zName} ${tarName}`, `${_7zName} 打包中（慢）...`)
    sh.exec(`rm ${tarName}`)

    let size = sh.exec(`du -h ${_7zName}`, { silent: true }).toString().split('\t')[0]
    let pwd = sh.exec('pwd', { silent: true }).toString().split('\n')[0]
    let ret = {
      filename: _7zName,
      fullPath: path.join(pwd, _7zName),
      size
    }
    console.log('>>> 打包结束 ' + JSON.stringify(ret))
    return ret
  },
  // 连接SSH并执行部署命令，具体配置请查看 node-ssh 文档与示例文件
  async sendFileExecuteCommands(sshConfig, fileConfig, actions = [], stopWhenStderr = true) {
    const NodeSSH = require('node-ssh')

    console.log(`>>> SSH 连接 ${sshConfig.host} ...`)

    const ssh = new NodeSSH()
    await ssh.connect(sshConfig).then(res => {
      console.log(`>>> SSH 连接成功`)
      // console.log(res)
    }).catch(e => {
      console.error('SSH 连接失败', e)
      process.exit(1)
    })

    if (fileConfig) {
      const local = fileConfig.localFilePath
      const remote = fileConfig.prodFullDir + '/' + fileConfig.prodFileName
      console.log(`>>> SSH 文件发送中：${local} -> ${remote}`)
      await ssh.putFile(local, remote).then(function () {
        console.log(">>> SSH 文件发送成功")
      }, function (error) {
        console.error('SSH 文件发送失败(1)', error)
        process.exit(1)
      }).catch(e => {
        console.error('SSH 文件发送失败(2)', e)
        process.exit(1)
      })
    }

    // 执行远程命令
    for (let i = 0; i < actions.length; i++) {
      const action = actions[i]
      console.log('>>> SSH 执行命令：' + (action.tip || action.command))

      if (!action.dir) {
        console.log('SSH 错误：必须指定远程目录')
        continue
      }

      await ssh.execCommand(action.command, { cwd: action.dir }).then((result) => {
        console.log(result.stdout)
        if (result.stderr) {
          // 有时会输出警告
          console.error('>>> 警告：', result.stderr)
          if (stopWhenStderr) {
            process.exit(1)
          }
        }
      }).catch(e => {
        console.error('SSH 命令执行失败', e)
        process.exit(1)
      })

    }

    ssh.dispose()
  },

  // 归档成品并清理
  archiveProductClean(projectName, distFileName, outputAffix = 'archive') {
    this.cdProjectDir(projectName)
    const archives_folder_name = projectName + '@archive'
    const archive_name = `${outputAffix}-${getTimeStr()}-${distFileName}`
    sh.mkdir('-p', '../' + archives_folder_name)
    sh.mv(distFileName, `../${archives_folder_name}/${archive_name}`)

    console.log('>>> 归档成品', `${path.join(projectName, '../', archives_folder_name, archive_name)}`)
  },
  pushServerChan
}
