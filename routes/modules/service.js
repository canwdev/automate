const {serviceInitTime} = require('../../enum')
const pkg = require('../../package.json')
const cp = require('child_process')

module.exports = {
  async info(req, res, next) {
    try {
      res.sendData({
        name: pkg.name,
        version: pkg.version,
        initTime: serviceInitTime
      })
    } catch (e) {
      next(e)
    }
  },
  async restart(req, res, next) {
    try {
      res.sendData({
        message: '服务可能已经重启，请刷新页面。'
      })
      cp.exec('node scripts/restart-service.js')
    } catch (e) {
      next(e)
    }
  },
}
