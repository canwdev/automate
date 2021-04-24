const {serviceInitTime} = require('../../enum')
const pkg = require('../../package.json')
const sh = require('shelljs')

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
        message: 'Service may be restarted, please refresh page.'
      })
      sh.exec('node restart-service.js')
    } catch (e) {
      next(e)
    }
  },
}
