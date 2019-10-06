const sh = require('shelljs')

const logName = 'build_log_' + (+new Date()) + '.log'
const param = 'default.json'
sh.exec(`node deploy_nuxt.js ${param} 2>&1 | tee logs/${logName}`)