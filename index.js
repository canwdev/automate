const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const path = require('path')
const sh = require('shelljs')
const fs = require('fs')

const utils = require('./utils.js')
const getTimeStr = utils.getDateTimeString

// 接口请求密码验证
const password = require('./password.json').password

// 解决 req.body undefined

// parse application/x-www-form-urlencoded
// app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// 设置模板引擎ejs
app.set("view engine", "ejs")

// 设置静态目录
app.use("/", express.static('public')); 

app.get('/', (req, res) => {
  return res.render("index", {
    
  })
  // return res.send('Automate working!')
})

// 使用 GET 方法触发部署
app.get('/build/:command/:param', (req, res) => {
  console.log(req.params)

  const pwd = req.query.pwd
  if (!pwd) {
    return res.status(403).send('缺少验证参数')
  }
  if (pwd !== password) {
    return res.status(403).send('身份验证失败')
  }

  const command = req.params.command // 'deploy_nuxt.js'
  const param = req.params.param // 'default.json'

  if (!command) {
    return res.send('必须指定command')
  }

  const logName = 'build_' + getTimeStr() + '.log'

  // 2>&1 | tee 的意思是在控制台输出日志的同时保存到文件
  sh.exec(`node ${command} ${param} 2>&1 | tee logs/${logName}`, { async: true })

  return res.render("build", {
    logName
  })
})

// 查看日志
app.get('/logs/:file', (req, res) => {
  const result = sh.exec(`tail -25 ${path.join(__dirname, 'logs', req.params.file)}`, {silent: true})
  const logTail = result.toString()

  if (result.code !== 0) {
    return res.send('日志文件读取失败！')
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

// 列出所有日志
app.get('/logs', (req, res) => {
  let list = sh.exec('ls -t logs', {silent: true})
  list = list.split('\n')
  list.pop() // 去除最后一项空项
  return res.render("logs-list", {
    list
  })
})

// 使用 POST 方法触发部署（WebHook）
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
  if (req.query.branches) {
    const branches = req.query.branches.split(',')
    if (branches.find(v => v === branch)) {
      param = param.replace('branch.json', `${branch}.json`)
      console.log(param)
    } else {
      let text = `没有构建，分支：${branch}`
      console.log(text)
      return res.send(text)
    }
  }


  const timestamp = getTimeStr()

  const postLogName = 'logs/' + 'post_' + timestamp + '.json'

  const content = JSON.stringify(body)
  fs.writeFile(postLogName, content, err => {
    if (err) console.log(err)
  })

  const buildLogName = 'post_' + timestamp + '_build.log'
  // 2>&1 | tee 的意思是在控制台输出日志的同时保存到文件
  sh.exec(`node ${command} ${param} 2>&1 | tee logs/${buildLogName}`, { async: true })

  return res.send(`OK, /logs/${buildLogName}`)
})

const port = normalizePort(process.env.PORT || '8100')
app.listen(port, () => {
  console.log(`Automate build API listening on port ${port}`);
});

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}
