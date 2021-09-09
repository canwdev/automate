const cp = require('child_process')

cp.exec('pm2 restart ./ecosystem.config.js')
