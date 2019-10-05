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

// 获取项目目录
let dir = sh.pwd().toString()
let projectDir = 'node-blog-frontend'
projectDir = path.join(dir, 'projects', 'node-blog-frontend')

// 记录构建起始时间
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
const prod_tar = 'prod.tar'
const prod_tar_7z = 'prod.tar.7z'
exec(`tar cf ${prod_tar} ${files}`)
exec(`7z a ${prod_tar_7z} ${prod_tar}`)

console.log('打包压缩成功！')
exec(`du -h ${prod_tar_7z}`)

// 部署到线上服务器
async function deploy() {
  const distFile = path.join(projectDir, prod_tar_7z)
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
  await ssh.putFile(distFile, targetDir + '/' + prod_tar_7z).then(function () {
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
  await ssh.execCommand(`7z x ${prod_tar_7z} -y && tar xf ${prod_tar} && rm ${prod_tar} ${prod_tar_7z} && pm2 restart ecosystem.config.js`, { cwd: targetDir }).then(function (result) {
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