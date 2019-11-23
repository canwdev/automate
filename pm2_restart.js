const sh = require('shelljs')

sh.exec('pm2 restart ./ecosystem.config.js')