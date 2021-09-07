const path = require('path')
const fs = require('fs-extra')

const projectPath = path.join(__dirname, '../projects')
const defaultDataPath = path.join(__dirname, '../data')
const isProduction = process.env.NODE_ENV === 'production';

// default config
let config = {
  PORT: '8100',
  PROJECT_PATH: projectPath,
  DATA_PATH: defaultDataPath,
  LOG_PATH: path.join(defaultDataPath, 'logs'),
  enableAuth: true,
  authUsers: {'admin': 'admin'},
  serverChannSCKEY: null, // Server酱推送API
  enableEncryption: isProduction, // 是否启用加密
  // openssl rand -hex 16
  ENCRYPTION_KEY: '357c9d491b1b18c57829f7e53d5e0c94', // Must be 256 bits (32 characters)
  builderConcurrent: 3,
}

const configPath = path.join(__dirname, 'config.json')
if (fs.existsSync(configPath)) {
  const userConfig = require(configPath)
  config = {
    ...config,
    ...userConfig
  }
}

fs.mkdirpSync(config.LOG_PATH)

module.exports = config
