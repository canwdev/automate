const path = require('path')
const fs = require('fs')

const dataPath = path.join(__dirname, '../projects')
const logPath = path.join(__dirname, '../logs')

// default config
let config = {
  PROJECT_PATH: dataPath,
  LOG_PATH: logPath,
  enableAuth: true,
  authUsers: {'admin': 'admin'},
  serverChannSCKEY: null // Server酱推送API
}

const configPath = path.join(__dirname, 'config.json')
if (fs.existsSync(configPath)) {
  const userConfig = require(configPath)
  config = {
    ...config,
    ...userConfig
  }
}

module.exports = config
