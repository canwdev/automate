const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const path = require('path')
const sh = require('shelljs')
const fs = require('fs')

const utils = require('./utils.js')
const timeStr = utils.getDateTimeString

// 解决 req.body undefined
app.use(bodyParser())

// 设置模板引擎ejs
app.set("view engine", "ejs")

app.get('/', (req, res) => {
  return res.send('Automate working!')
})

app.get('/build/:command/:param', (req, res) => {
  console.log(req.params)

  const command = req.params.command // 'deploy_nuxt.js'
  const param = req.params.param // 'default.json'

  if (!command) {
    return res.send('必须指定command')
  }

  const logName = 'build_' + timeStr() + '.log'

  // 2>&1 | tee 的意思是在控制台输出日志的同时保存到文件
  sh.exec(`node ${command} ${param} 2>&1 | tee logs/${logName}`, { async: true })

  return res.render("build", {
    logName
  })
})

app.get('/logs/:file', (req, res) => {
  // res.sendFile(req.params.file, {
  //   root: path.join(__dirname, 'logs')
  // })

  const result = sh.exec(`tail -25 ${path.join(__dirname, 'logs', req.params.file)}`)

  if (result.code !== 0) {
    return res.send('日志文件读取失败！')
  }

  const logTail = result.toString()
  // res.send(logTail)
  return res.render("logs", {
    title: req.params.file,
    content: logTail
  })
})

app.post('/build/:command/:param', (req, res) => {
  console.log(req.params)
  const command = req.params.command // 'deploy_nuxt.js'
  const param = req.params.param // 'default.json'
  if (!command) {
    return res.status(400).send('必须指定command')
  }

  const timestamp = timeStr()

  const postLogName = 'logs/' + 'post_' + timestamp + '.log'
  const content = JSON.stringify(req.body)
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
