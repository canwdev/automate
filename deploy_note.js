const sh = require('shelljs')
const open = require('open')

if (!sh.which('git')) {
  sh.echo('Sorry, this script requires git');
  sh.exit(1);
}

const projectDir = 'C:\\Users\\CAN\\Coding\\notes-vuepress'
const productionDir = 'C:\\Users\\CAN\\Coding\\canwdev.gitee.io'

function cd(dir, tip) {
  if (sh.cd(dir).code === 1) sh.exit(1)
  console.log(tip||'cd', sh.pwd().toString())
}

cd(projectDir, '工程目录')

console.log('安装依赖')
if (sh.exec('yarn install').code === 1) sh.exit(1)

console.log('开始构建')
if (sh.exec('npm run build').code === 1) sh.exit(1)

console.log('删除之前版本')
cd(productionDir)
if (sh.rm('-r', ...sh.ls(productionDir)).code === 1) sh.exit(1)

console.log('复制文件')
cd(projectDir)
if (sh.cp('-R', './docs/.vuepress/dist/*', productionDir).code === 1) sh.exit(1)

console.log('提交修改')
cd(productionDir)
if (sh.exec('git add . && git commit -m "update" && git push').code === 1) sh.exit(1)

console.log('部署成功！')
open('https://gitee.com/canwdev/canwdev/pages')
