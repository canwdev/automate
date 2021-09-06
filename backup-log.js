const automate = require('./automate')
const {LOG_PATH} = require('./config')

automate.cd(LOG_PATH)
const folderName = `log_backup/${Date.now()}/`
automate.execCommands([
  `mkdir -p ${folderName}`,
  `cp *.json ${folderName}`,
  `mv *.log ${folderName}`
])
