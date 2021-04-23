const yaml = require('js-yaml')
const path = require('path')
const fs = require('fs')
const {
  getDateTimeString,
  genRandomString
} = require('../../utils')
const {
  startBuild
} = require('../../utils/build')

module.exports = {
  async getBuildList(req, res, next) {
    try {
      const docPath = path.join(__dirname, '../../configs/build-list-demo.yml')

      let doc = {}
      if (fs.existsSync(docPath)) {
        doc = yaml.load(fs.readFileSync(docPath, 'utf8'));
      }

      res.sendData(doc)
    } catch (e) {
      next(e)
    }
  },
  async buildByGET(req, res, next) {
    try {
      const {
        command,
        param
      } = req.params

      if (!command) {
        return res.sendError({message: '必须指定command'})
      }

      const now = new Date()
      const logName = 'build_' + getDateTimeString(now) + '_' + genRandomString() + '.log'

      // 开始构建
      startBuild({
        command,
        logName,
        timestamp: now.getTime(),
      })

      res.sendData({
        logName
      })
    } catch (e) {
      next(e)
    }
  },
}
