const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const path = require('path')
const sh = require('shelljs')
const fs = require('fs')

const {
  SimpleTask,
  asyncExec,
  getDateTimeString: getTimeStr,
  genRandomString,
  normalizePort,
  readJsonAsObjectSync
} = require('./utils')
const logStorage = require('./utils/log-storage')

// 构建任务队列（自动执行）
const tasks = new SimpleTask()

// 服务启动时刻
const serviceInitTime = new Date().getTime()

/**
 * 开始执行构建，如果有多个任务会自动排队
 */
function triggerDeploy(command, buildLogName, {
  nowDate,
  postMessageFile,
  branch,
}) {

  // 保存日志索引
  logStorage.addLog({
    time: nowDate.getTime(),
    command: command,
    logFile: buildLogName,
    postMessageFile: postMessageFile || null,
    branch: branch || null
  })

  tasks.add(async function () {
    // 2>&1 | tee 的意思是在控制台输出日志的同时保存到文件
    await asyncExec(`node ${command} 2>&1 | tee logs/${buildLogName}`)
  })
}


// 解决 req.body undefined
// parse application/x-www-form-urlencoded
// app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use(express.static(path.join(__dirname, 'public')));
app.use('/', express.static(path.join(__dirname, 'app_dist')));

app.get('/', (req, res) => {
  return res.render("index", {
    serviceInitTime
  })
  // return res.send('Automate working!')
})

app.get('/api/info', (req, res) => {
  return res.json({
    serviceInitTime
  })
})

app.post('/restart', basicAuth, (req, res) => {

  sh.exec('node ./pm2_restart.js', { async: true })

  return res.render("alert", {
    message: "Automate 服务可能已经重启，点击确定后跳转到首页...",
    url: '/'
  })

})

app.get('/build', (req, res) => {
  return res.render("build", {
    logName: 'test.log'
  })
})


/**
 * 查看日志
 */
app.get('/logs/:file', (req, res) => {
  const result = sh.exec(`tail -25 ${path.join(__dirname, 'logs', req.params.file)}`, { silent: true })
  const logTail = result.toString()

  if (result.code !== 0) {
    return res.send(req.params.file + '\n日志文件读取失败！可能是任务还没有开始执行')
  }

  if (req.query.raw) {
    if (req.query.tail) {
      return res.send(logTail)
    }
    return res.sendFile(req.params.file, {
      root: path.join(__dirname, 'logs')
    })
  }

  // res.send(logTail)
  return res.render("logs-detail", {
    fileName: req.params.file,
    content: logTail
  })
})

/**
 * 列出所有日志
 */
app.get('/logs', basicAuth, (req, res) => {
  let logs = logStorage.getLog()
  return res.render("logs-list", {
    tasks: tasks.getList(),
    SSR_DATA: logs.reverse()
  })
})

/**
 * 使用 GET 方法触发部署
 */
app.get('/build/:command/:param', basicAuth, (req, res) => {
  console.log(req.params)

  const command = req.params.command // 'deploy_nuxt.js'
  const param = req.params.param // 'default.json'

  if (!command) {
    return res.send('必须指定command')
  }

  const now = new Date()
  const buildLogName = 'build_' + getTimeStr(now) + '_' + genRandomString() + '.log'

  // 开始构建
  triggerDeploy(`${command} ${param}`, buildLogName, {
    nowDate: now
  })

  return res.json({
    buildLogName
  })
})

/**
 * 使用 POST 方法触发部署（WebHook）
 */
app.post('/build/:command/:param', (req, res) => {
  console.log(req.params)
  console.log(req.query)

  const pwd = req.query.pwd
  if (!pwd) {
    return res.status(403).send('缺少验证参数')
  }
  if (pwd !== password) {
    return res.status(403).send('身份验证失败')
  }

  const body = req.body
  const command = req.params.command // 'deploy_nuxt.js'
  let param = req.params.param // 'default.json'
  if (!command) {
    return res.status(400).send('必须指定command')
  }

  // 切换到指定相同分支
  const branch = body.ref.split('/').pop()
  console.log('分支：', branch)

  // 检测是否在需要构建的分支列表中，如果不在就忽略这次构建
  // POST http://xxx.top:8100/build/deploy_nuxt.js/remo-website-branch.json?branches=prod,stage
  if (req.query.branches) {
    const bArr = req.query.branches.split(',')
    if (bArr.find(v => v === branch)) {
      param = param.replace('branch.json', `${branch}.json`)
      console.log(param)
    } else {
      let text = `不存在分支 ${branch}，停止构建`
      console.log(text)
      return res.status(400).send(text)
    }
  }

  const now = new Date()
  const timestamp = getTimeStr(now)
  const unique = genRandomString()

  const postLogName = 'post_' + timestamp + '_' + unique + '.json'

  // 保存触发 POST 的信息日志
  const content = JSON.stringify(body, null, 2)
  fs.writeFile('logs/' + postLogName, content, err => {
    if (err) console.log(err)
  })


  const buildLogName = 'post_' + timestamp + '_' + unique + '_build.log'

  // 开始构建
  triggerDeploy(`${command} ${param}`, buildLogName, {
    nowDate: now,
    postMessageFile: postLogName,
    branch: branch
  })

  return res.send(`OK, 任务创建成功。开始执行时将生成日志文件：/logs/${buildLogName}`)
})

