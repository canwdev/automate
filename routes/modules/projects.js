const yaml = require('js-yaml')
const path = require('path')
const fs = require('fs')
const {
  getDateTimeString,
  genRandomString
} = require('../../utils')
const {
  startBuild,
  buildTaskQueue
} = require('../../utils/builder')
const {
  CODE_CLIENT_FORBIDDEN
} = require('../../enum')
const {
  LOG_PATH,
  builderConcurrent
} = require('../../config')
const sh = require('shelljs')
const {enableAuth, authUsers} = require('../../config')
const BuildItem = require('../../database/models/BuildItem')

module.exports = {
  async getProjectList(req, res, next) {
    try {
      const docDir = path.join(__dirname, '../../config')
      const docPath = path.join(docDir, 'project-list.yml')

      let doc = {}
      if (fs.existsSync(docPath)) {
        doc = yaml.load(fs.readFileSync(docPath, 'utf8'));
      } else {
        const docPathDemo = path.join(docDir, 'project-list-demo.yml')
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
        cmd,
        args
      } = req.query

      if (!cmd) {
        return res.sendError({message: '必须指定command'})
      }

      const now = new Date()
      const logName = 'build_' + getDateTimeString(now) + '_' + genRandomString() + '.log'

      // 开始构建
      await startBuild({
        command: `${cmd}` + (args ? ` ${args}` : ''),
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
      const {
        cmd, // 命令
        username, // 用户名
        password, // 密码
        br_limit // 限定分支
      } = req.query
      let {args} = req.query

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

      if (!cmd) {
        return res.sendError({message: '必须指定command'})
      }

      let targetBranch = null
      if (br_limit) {
        // WebHook 推送数据
        // https://gitee.com/help/articles/4186#article-header0
        const {
          ref = 'refs/heads/master'
        } = req.body

        // 切换到指定相同分支
        targetBranch = ref.split('/').pop()
        console.log('targetBranch', targetBranch)

        // 检测是否在需要构建的分支列表中，如果不在就忽略这次构建
        // 示例：POST http://xxx.top:8100/build/deploy_nuxt.js/remo-website-branch.json?br_limit=prod,stage
        const branchArr = br_limit.split(',')
        if (branchArr.find(item => item === targetBranch)) {
          args = args.replace('__branch__', `${targetBranch}`)
          console.log('args', args)
        } else {
          let message = `${targetBranch} 不在目标分支列表中(${br_limit})，停止构建`
          return res.sendError({message})
        }
      }

      const now = new Date()
      const logName = 'build_' + getDateTimeString(now) + '_' + genRandomString() + '.log'

      // 开始构建
      await startBuild({
        command: `${cmd}` + (args ? ` ${args}` : ''),
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
  async getBuildLogs(req, res, next) {
    try {
      let {
        offset = 0,
        limit = 10,
        order = 'DESC',
      } = req.query

      offset = Number(offset)
      limit = Number(limit)

      let paginationQuery = limit ? {
        offset: parseInt(offset) || 0,
        limit: parseInt(limit),
      } : {}

      let list = await BuildItem.findAndCountAll({
        ...paginationQuery,
        // where,
        order: [
          // ['sort', 'ASC'],
          ['timestamp', order],
        ]
      })

      const taskData = {
        tasks: buildTaskQueue.tasks.length,
        executing: buildTaskQueue.executing.length
      }

      // console.log(taskData)

      res.sendData({
        list: list.rows,
        count: list.count,
        taskData,
        limit,
        offset,
        builderConcurrent,
      })
    } catch (e) {
      next(e)
    }
  },
  async getLogDetail(req, res, next) {
    try {
      const logName = req.params.logName

      if (!logName) {
        return res.sendError({message: 'logName 不能为空'})
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
  },
  async deleteAllLogs(req, res, next) {
    try {
      sh.exec(`node backup-log.js`)

      logDB.get('logs').remove().write()

      res.sendData()
    } catch (e) {
      next(e)
    }
  }
}
