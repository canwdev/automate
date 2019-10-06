const sh = require('shelljs')
const NodeSSH = require('node-ssh')
const ssh = new NodeSSH()
const path = require('path')
const util = require('./utils.js')
const cd = util.cd
const exec = util.exec

// 检测必要命令
if (!sh.which('git') || !sh.which('7z')) {
  sh.echo('Sorry, this script requires git && 7z');
  sh.echo('sudo apt install git p7zip-full');
  sh.exit(1);
}

async function deploy() {
  // ------ 使用步骤 ------
  // 1. 在本文件同级文件夹新建一个 projects 文件夹
  // 2. 进入 projects 文件夹，克隆项目
  // 3. 修改配置文件
  // 4. 运行 node deploy_nuxt.js 或者带参数运行 node deploy_nuxt.js default.json

  const configFiles = sh.ls('./config_deploy_nuxt')
  let configFile = process.argv.slice(2) || null

  if (!configFile) {
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
  
  const config = require("./config_deploy_nuxt/" + configFile)

  console.log('>>> 使用配置文件 ' + configFile)

  // 项目名称
  let projectName = config.projectName
  // 本地项目目录
  const project_dir = path.join(sh.pwd().toString(), 'projects', projectName)
  // 线上环境目录（请勿填错）
  const prod_dir = config.productionDir
  // 要发送的文件（线上环境更新将删除这些文件）
  const prod_files = config.productionFiles
  // 线上服务器配置
  const ssh_config = {
    host: config.sshConfig.host,
    username: config.sshConfig.username,
    privateKey: config.sshConfig.privateKey || require('os').homedir() + '/.ssh/id_rsa'
  }

  // 记录构建起始时间
  const startTime = +new Date()
  console.log(startTime)

  cd(project_dir)

  console.log('>>> 拉取代码...')
  exec('git pull')

  console.log('>>> 安装依赖...')
  exec(config.installCommand || 'npm install')

  console.log('>>> 开始构建...')
  exec(config.buildCommand || 'npm run build')

  const prod_tar = 'prod.tar'
  const prod_tar_7z = 'prod.tar.7z'

  console.log('>>> 打包并进行7z压缩...')
  exec(`tar cf ${prod_tar} ${prod_files}`)
  exec(`7z a ${prod_tar_7z} ${prod_tar}`)

  console.log('打包压缩成功！')
  exec(`du -h ${prod_tar_7z}`)

  // 部署到线上服务器

  const distFile = path.join(project_dir, prod_tar_7z)

  console.log('>>> ssh 远程服务器...')
  await ssh.connect(ssh_config).then(() => {
  }).catch(e => {
    console.error('远程服务器连接失败！', e)
    process.exit(1)
  })

  await ssh.execCommand('uname -a').then(result => {
    console.log('远程服务器连接成功！', result.stdout)
    if (result.stderr) console.error(result.stderr)
  })

  console.log('>>> 发送文件...')
  await ssh.putFile(distFile, prod_dir + '/' + prod_tar_7z).then(function () {
    console.log("文件发送成功！")
  }, function (error) {
    console.error(error)
    process.exit(1)
  })

  console.log('>>> 删除上次发布的文件')
  await ssh.execCommand(`rm -rf ${prod_files}`, { cwd: prod_dir }).then(function (result) {
    console.log(result.stdout)
    if (result.stderr) {
      console.error(result.stderr)
      process.exit(1)
    }
  })

  console.log('>>> 解压并重启服务...')
  await ssh.execCommand(`7z x ${prod_tar_7z} -y && tar xf ${prod_tar} && rm ${prod_tar} ${prod_tar_7z} && pm2 restart ecosystem.config.js`, { cwd: prod_dir }).then(function (result) {
    console.log(result.stdout)
    if (result.stderr) {
      console.error(result.stderr)
      process.exit(1)
    }
  })

  const endTime = +new Date()

  console.log(endTime)
  console.log(`\n\n>>> 部署成功！耗时 ${(endTime - startTime) / 1000} 秒\n\n`)

  console.log('>>> 归档成品并清理')
  cd(project_dir)
  const archives_folder_name = projectName + '@assets'
  const archive_name = `${endTime}_${prod_tar_7z}`
  sh.mkdir('-p', '../' + archives_folder_name)
  sh.mv(prod_tar_7z,  `../${archives_folder_name}/${archive_name}`)
  sh.rm(prod_tar)
  console.log(`${path.join(prod_dir, '../', archives_folder_name, archive_name)}`)

  process.exit()
}

deploy()