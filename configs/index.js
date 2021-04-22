const path = require('path')
const fs = require('fs')

const defaultPath = path.join(__dirname, '../projects')

// default config
let config = {
  DATA_PATH: defaultPath,
  enableAuth: true,
  authUsers: {'admin': 'admin'}
}

const configPath = path.join(__dirname, 'config.json')
if (fs.existsSync(configPath)) {
  const userConfig = require(configPath)
  index = {
    ...config,
    ...userConfig
  }
}

module.exports = config
