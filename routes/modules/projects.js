const yaml = require('js-yaml')
const path = require('path')
const fs = require('fs-extra')
const rimraf = require('rimraf')
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
  BuildStatus
} = require('../../enum/common')
const {
  LOG_PATH,
} = require('../../config')
const sh = require('shelljs')
const {enableAuth, authUsers} = require('../../config')
const BuildItem = require('../../database/models/BuildItem')

const docDir = path.join(__dirname, '../../config')
const docPath = path.join(docDir, 'project-list.yml')

const getProjectList = async (req, res, next) => {
  try {
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
}
const buildByGET = async (req, res, next) => {
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
    const {item} = await startBuild({
      command: `${cmd}` + (args ? ` ${args}` : ''),
      logName,
      timestamp: now.getTime(),
    })

    res.sendData({
      id: item.id
    })
  } catch (e) {
    next(e)
  }
}

const buildByPOST = async (req, res, next) => {
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
}

const getBuildList = async (req, res, next) => {
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
      executing: buildTaskQueue.executing.length,
      concurrent: buildTaskQueue.concurrent
    }

    // console.log(taskData)

    res.sendData({
      list: list.rows,
      count: list.count,
      taskData,
      limit,
      offset,
    })
  } catch (e) {
    next(e)
  }
}

const abortBuild = async (req, res, next) => {
  try {
    const {
      id
    } = req.body

    if (!id) {
      return res.sendError({message: 'id is required'})
    }

    const task = buildTaskQueue.taskMap[id]
    if (!task || !task.data) {
      return res.sendError({message: '任务不存在！'})
    }
    task.data.abort()

    res.sendData()
  } catch (e) {
    next(e)
  }
}

const getLogDetail = async (req, res, next) => {
  try {
    let {
      id,
      raw,
      lines
    } = req.body

    if (!id) {
      return res.sendError({message: 'id is required'})
    }

    const item = await BuildItem.findOne({
      where: {id},
    })

    const {logName} = item

    let logTxt = ''

    if (raw) {
      const result = await fs.readFile(path.join(LOG_PATH, logName))
      logTxt = result.toString()
    } else {
      lines = Number(req.query.lines) || 25
      const result = sh.exec(`tail -${lines} ${path.join(LOG_PATH, logName)}`, {silent: true})
      logTxt = result.toString()

      if (result.code !== 0) {
        return res.sendError({
          message: logName + '\n日志文件读取失败！可能是任务还没有开始执行'
        })
      }
    }

    res.sendData({
      item,
      logTxt
    })
  } catch (e) {
    next(e)
  }
}

const deleteAllLogs = async (req, res, next) => {
  try {
    rimraf(LOG_PATH, () => {
      fs.mkdirp(LOG_PATH)
    })

    await BuildItem.destroy({
      where: {},
      truncate: true
    })

    res.sendData()
  } catch (e) {
    next(e)
  }
}

const deleteLog = async (req, res, next) => {
  try {
    const {
      id
    } = req.body

    if (!id) {
      return res.sendError({message: 'id is required'})
    }

    const item = await BuildItem.findOne({
      where: {id},
    })

    fs.remove(path.join(LOG_PATH, item.logName))

    await BuildItem.destroy({
      where: {id},
    })

    res.sendData()
  } catch (e) {
    next(e)
  }
}

module.exports = {
  getProjectList,
  buildByGET,
  buildByPOST,
  abortBuild,
  getBuildList,
  getLogDetail,
  deleteAllLogs,
  deleteLog,
}
