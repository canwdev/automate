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
  serverChannSCKEY: null, // Server酱推送API
  enableEncryption: true,
  // openssl rand -hex 16
  ENCRYPTION_KEY: '357c9d491b1b18c57829f7e53d5e0c94' // Must be 256 bits (32 characters)
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
