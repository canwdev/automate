const sh = require('shelljs')
// const open = require('open')
const path = require('path')

const utils = require('./utils.js')
const cd = utils.cd
const exec = utils.exec

if (!sh.which('git')) {
  sh.echo('Sorry, this script requires git');
  sh.exit(1);
}

const projectDir = path.join(__dirname, 'projects', 'notes-vuepress')
const productionGit = 'git@gitee.com:canwdev/canwdev.git' // 将被覆盖，请勿填错！

cd(projectDir, '工程目录')

console.log('>>> 拉取代码')
if (sh.exec('git pull').code === 1) sh.exit(1)

console.log('>>> 安装依赖')
if (sh.exec('yarn install').code === 1) sh.exit(1)

console.log('>>> 开始构建')
if (sh.exec('npm run build').code === 1) sh.exit(1)

console.log('>>> 提交修改')
cd('docs/.vuepress/dist', 'dist目录')
// 创建新git项目并强制推送到pages项目（覆盖）
exec('git init && git add -A && git commit -m "deploy"')
exec(`git push -f ${productionGit} master`)

console.log('>>> VuePress 部署成功！')

// cd('-') // 返回之前目录
// open('https://gitee.com/canwdev/canwdev/pages')
