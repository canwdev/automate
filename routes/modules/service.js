const {serviceInitTime} = require('../../enum')
const pkg = require('../../package.json')

module.exports = {
  async info(req, res, next) {
    try {
      res.sendData({
        name: pkg.name,
        version: pkg.version,
        serviceInitTime
      })
    } catch (error) {
      next(error)
    }
  },
}
