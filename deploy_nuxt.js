const sh = require('shelljs')
const NodeSSH = require('node-ssh')
const ssh = new NodeSSH()
const path = require('path')
const util = require('./utils.js')
const cd = util.cd
const exec = util.exec

if (!sh.which('git') || !sh.which('7z')) {
  sh.echo('Sorry, this script requires git && 7z');
  sh.echo('sudo apt install git p7zip-full');
  sh.exit(1);
}

let dir = sh.pwd().toString()
let projectDir = 'node-blog-frontend'
projectDir = path.join(dir, 'projects', 'node-blog-frontend')

const startTime = +new Date()
console.log(startTime)

cd(projectDir)

console.log('>>> 拉取代码...')
exec('git pull')

console.log('>>> 安装依赖...')
exec('npm install')

console.log('>>> 开始构建...')
exec('npm run build')

console.log('>>> 打包并进行7z压缩...')
let files = '.nuxt node_modules assets server deploy_prod.sh ecosystem.config.js nuxt.config.js package.json package-lock.json'
exec(`tar cf prod.tar ${files}`)
exec(`7z a prod.tar.7z prod.tar`)

console.log('打包压缩成功！')
exec('du -h prod.tar.7z')

// 部署到线上服务器
async function deploy() {
  const distFile = path.join(projectDir, 'prod.tar.7z')
  const targetDir = '/usr/www/node-blog-frontend'

  console.log('>>> ssh 远程服务器...')
  await ssh.connect({
    host: 'sagit.top',
    username: 'root',
    privateKey: require('os').homedir() + '/.ssh/id_rsa'
  }).then(() => {
  }).catch(e => {
    console.error('远程服务器连接失败！', e)
    process.exit(1)
  })

  await ssh.execCommand('uname -a').then(result => {
    console.log('远程服务器连接成功！', result.stdout)
    if (result.stderr) console.error(result.stderr)
  })

  console.log('>>> 发送文件...')
  await ssh.putFile(distFile, targetDir + '/prod.tar.7z').then(function () {
    console.log("文件发送成功！")
  }, function (error) {
    console.error(error)
    process.exit(1)
  })

  console.log('>>> 删除上次发布的文件')
  await ssh.execCommand('rm -rf .nuxt node_modules assets server deploy_bundle.sh ecosystem.config.js nuxt.config.js package.json package-lock.json', { cwd: targetDir }).then(function (result) {
    console.log(result.stdout)
    if (result.stderr) {
      console.error(result.stderr)
      process.exit(1)
    }
  })

  console.log('>>> 解压并重启服务...')
  await ssh.execCommand('7z x prod.tar.7z -y && tar xf prod.tar && rm prod.tar prod.tar.7z && pm2 restart ecosystem.config.js', { cwd: targetDir }).then(function (result) {
    console.log(result.stdout)
    if (result.stderr) {
      console.error(result.stderr)
      process.exit(1)
    }
  })

  const endTime = +new Date()

  console.log(endTime)
  console.log(`>>> 部署成功！耗时 ${(endTime - startTime)/1000} 秒`)
  process.exit()
}

deploy()