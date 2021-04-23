const yaml = require('js-yaml')
const path = require('path')
const fs = require('fs')
const {
  getDateTimeString,
  genRandomString
} = require('../../utils')
const logDB = require('../../utils/log-db')
const {
  startBuild,
  tasks
} = require('../../utils/build')
const {LOG_PATH} = require('../../configs')
const sh = require('shelljs')

module.exports = {
  async getBuildList(req, res, next) {
    try {
      const docPath = path.join(__dirname, '../../configs/build-list.yml')

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
        command: `${command} ${param}`,
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
  async listLogs(req, res, next) {
    try {
      const list = logDB.get('logs')
        .orderBy('timestamp', ['desc'])
        .take(20)
        .value()

      res.sendData({
        list,
        tasks: tasks.getList()
      })
    } catch (e) {
      next(e)
    }
  },
  async getLogDetail(req, res, next) {
    try {
      const logName = req.params.logName

      if (!logName) {
        return res.sendError({message: 'logName can not be empty'})
      }

      if (req.query.raw) {
        return res.sendFile(logName, {
          root: LOG_PATH
        })
      }

      const result = sh.exec(`tail -25 ${path.join(LOG_PATH, logName)}`,
        {silent: true})
      const logTail = result.toString()

      if (result.code !== 0) {
        return res.sendError({
          message: logName + '\n日志文件读取失败！可能是任务还没有开始执行'
        })
      }

      res.sendData(logTail)
    } catch (e) {
      next(e)
    }
  }
}
