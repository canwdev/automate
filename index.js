const express = require('express')
const app = express()
const path = require('path')
const sh = require('shelljs')

// 设置模板引擎ejs
app.set("view engine", "ejs")

app.get('/', (req, res) => {
  res.send('Automate working!')
})

app.get('/build/:command/:param', (req, res) => {
  console.log(req.params)

  const command = req.params.command // 'deploy_nuxt.js'
  const param = req.params.param // 'default.json'

  if (!command || !param) {
    res.send('必须指定command和param')
  }

  const logName = 'log_' + (+new Date()) + '.log'

  // 2>&1 | tee 的意思是在控制台输出日志的同时保存到文件
  sh.exec(`node ${command} ${param} 2>&1 | tee logs/${logName}`, { async: true })

  res.render("build", {
    logName
   })
})

app.get('/logs/:file', function (req, res) {
  // res.sendFile(req.params.file, {
  //   root: path.join(__dirname, 'logs')
  // })

  const result = sh.exec(`tail -25 ${path.join(__dirname, 'logs', req.params.file)}`)

  if (result.code !== 0) {
    return res.send('日志文件读取失败！')
  }

  const logTail = result.toString()
  // res.send(logTail)
  res.render("logs", {
    title: req.params.file,
    content: logTail
   })
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