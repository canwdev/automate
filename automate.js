const sh = require('shelljs')
const NodeSSH = require('node-ssh')
const path = require('path')
const utils = require('./utils.js')
const cd = utils.cd
const exec = utils.exec
const getTimeStr = utils.getDateTimeString

module.exports = {
  // 检测部署环境必要命令
  detectEnvironmentCommands(commands = ['git']) {
    let cmdNotFound = null
    commands.forEach(command => {
      if (!sh.which(command)) cmdNotFound = command
    })

    if (cmdNotFound) {
      sh.echo(`Sorry, this script requires ${commands}; but '${cmdNotFound}' not found`)
      sh.exit(1)
    } else {
      sh.echo('>>> Environment check OK')
    }
  }
}
