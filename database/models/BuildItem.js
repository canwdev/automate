const {BuildStatus} = require('../../enum/build')
const Sequelize = require('sequelize')
const sequelize = require('../sequelize')

// Table schema
const Model = sequelize.define('buildItems', {
  command: {type: Sequelize.STRING, defaultValue: ''},
  logName: {type: Sequelize.STRING, defaultValue: ''},
  timestamp: {type: Sequelize.NUMBER},
  message: {type: Sequelize.STRING, defaultValue: ''},
  branch: {type: Sequelize.STRING, defaultValue: ''},
  buildStatus: {type: Sequelize.NUMBER, defaultValue: BuildStatus.WAITING},
}, {timestamps: true})

sequelize.sync()

// 启动时失败正在运行的项目
Model.update({
  buildStatus: BuildStatus.ERRORED
},{
  where: {
    buildStatus: [BuildStatus.WAITING, BuildStatus.RUNNING]
  }
})

module.exports = Model
