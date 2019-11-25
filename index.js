const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const path = require('path')
const sh = require('shelljs')
const fs = require('fs')

const utils = require('./utils.js')
const { SimpleTask, asyncExec, getDateTimeString: getTimeStr, genRandomString, normalizePort } = utils

// 构建任务队列（自动执行）
const tasks = new SimpleTask()

// 服务启动时刻
const serviceInitTime = new Date().getTime()

/**
 * 开始执行构建，如果有多个任务会自动排队
 */
function triggerDeploy(fullCommand, buildLogName) {
  tasks.add(async function () {
    // 2>&1 | tee 的意思是在控制台输出日志的同时保存到文件
    await asyncExec(`node ${fullCommand} 2>&1 | tee logs/${buildLogName}`)
  })
}

// 接口请求密码验证
const password = require('./password.json').password

// 解决 req.body undefined
// parse application/x-www-form-urlencoded
// app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.set("view engine", "ejs")              // 设置模板引擎ejs
app.use("/", express.static('public'));    // 设置静态目录

app.get('/', (req, res) => {
  return res.render("index", {
    serviceInitTime
  })
  // return res.send('Automate working!')
})

app.get('/restart', basicAuth, (req, res) =>{
  
  sh.exec('node ./pm2_restart.js', {async: true})
  
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
 * 使用 GET 方法触发部署
 */
app.get('/build/:command/:param', basicAuth, (req, res) => {
  console.log(req.params)

  const command = req.params.command // 'deploy_nuxt.js'
  const param = req.params.param // 'default.json'

  if (!command) {
    return res.send('必须指定command')
  }

  const buildLogName = 'build_' + getTimeStr() + '_' + genRandomString() + '.log'

  // 开始构建
  triggerDeploy(`${command} ${param}`, buildLogName)

  return res.render("build", {
    buildLogName
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
  let list = sh.exec('ls -t logs', { silent: true })
  list = list.split('\n')
  list.pop() // 去除最后一项空项
  return res.render("logs-list", {
    tasks: tasks.getList(),
    list
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
    const branches = req.query.branches.split(',')
    if (branches.find(v => v === branch)) {
      param = param.replace('branch.json', `${branch}.json`)
      console.log(param)
    } else {
      let text = `不存在分支 ${branch}，停止构建`
      console.log(text)
      return res.status(400).send(text)
    }
  }


  const timestamp = getTimeStr()
  const unique = genRandomString()

  const postLogName = 'logs/' + 'post_' + timestamp + '_' + unique + '.json'

  // 保存触发 POST 的信息日志
  const content = JSON.stringify(body)
  fs.writeFile(postLogName, content, err => {
    if (err) console.log(err)
  })

  const buildLogName = 'post_' + timestamp + '_' + unique + '_build.log'

  // 开始构建
  triggerDeploy(`${command} ${param}`, buildLogName)

  return res.send(`OK, 任务创建成功。开始执行时将生成日志文件：/logs/${buildLogName}`)
})

const port = normalizePort(process.env.PORT || '8100')
app.listen(port, () => {
  console.log(`Automate build API listening on port ${port}`);
});

/* -------------------------------------- */

/**
 * basicAuth 中间件
 */
function basicAuth(req, res, next) {
  const auth = { login: 'admin', password: require('./password.json').password } // change this

  // parse login and password from headers
  const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
  const [login, password] = new Buffer(b64auth, 'base64').toString().split(':')

  // Verify login and password are set and correct
  if (login && password && login === auth.login && password === auth.password) {
    // Access granted...
    return next()
  }

  // Access denied...
  res.set('WWW-Authenticate', 'Basic realm="401"') // change this
  res.status(401).send('Authentication required.') // custom message
}