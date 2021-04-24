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
const {
  CODE_CLIENT_FORBIDDEN
} = require('../../enum')
const {LOG_PATH} = require('../../configs')
const sh = require('shelljs')
const {enableAuth, authUsers} = require('../../configs')

module.exports = {
  async getBuildList(req, res, next) {
    try {
      const docDir = path.join(__dirname, '../../configs')
      const docPath = path.join(docDir, 'build-list.yml')

      let doc = {}
      if (fs.existsSync(docPath)) {
        doc = yaml.load(fs.readFileSync(docPath, 'utf8'));
      } else {
        const docPathDemo = path.join(docDir, 'build-list-demo.yml')
        doc = yaml.load(fs.readFileSync(docPathDemo, 'utf8'));
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
  async buildByPOST(req, res, next) {
    try {
      let {
        command,
        param,
      } = req.params
      const {
        username,
        password,
        branchesLimit
      } = req.query

      if (enableAuth) {
        if (!username || !password) {
          return res.sendError({
            code: CODE_CLIENT_FORBIDDEN,
            message: '缺少验证参数'
          })
        }

        const pwd = authUsers[username]
        if (!pwd || pwd !== password) {
          return res.sendError({
            code: CODE_CLIENT_FORBIDDEN,
            message: '身份验证失败 (1)'
          })
        }
      }

      if (!command) {
        return res.sendError({message: '必须指定command'})
      }

      let targetBranch = null
      if (branchesLimit) {
        // WebHook 推送数据
        // https://gitee.com/help/articles/4186#article-header0
        const {
          ref = 'refs/heads/master'
        } = req.body

        // 切换到指定相同分支
        targetBranch = ref.split('/').pop()
        console.log('targetBranch', targetBranch)

        // 检测是否在需要构建的分支列表中，如果不在就忽略这次构建
        // 示例：POST http://xxx.top:8100/build/deploy_nuxt.js/remo-website-branch.json?branchesLimit=prod,stage
        const branchArr = branchesLimit.split(',')
        if (branchArr.find(item => item === targetBranch)) {
          param = param.replace('__branch__', `${targetBranch}`)
          console.log('param', param)
        } else {
          let message = `${targetBranch} 不在目标分支列表中(${branchesLimit})，停止构建`
          return res.sendError({message})
        }
      }

      const now = new Date()
      const logName = 'build_' + getDateTimeString(now) + '_' + genRandomString() + '.log'

      // 开始构建
      startBuild({
        command: `${command} ${param}`,
        logName,
        timestamp: now.getTime(),
        message: JSON.stringify(req.body),
        branch: targetBranch
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
