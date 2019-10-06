const express = require('express')
const app = express()
const path = require('path')
const sh = require('shelljs')

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

  res.send(`<h1>正在执行，执行结束前请勿刷新此页面！！</h1>
  <p>查看编译状态日志：<a href="/logs/${logName}" target="_blank">${logName}</a></p>
  <iframe id="iframe" src="/logs/${logName}" width="100%" height="400"></iframe>
  <script>
  window.onload = function() {
    window.setInterval(reloadIFrame, 8000)

    var iframe = document.getElementById('iframe')
    function reloadIFrame() {
      iframe.contentWindow.location.reload()
    }
    iframe.addEventListener('load', function() {
      this.contentWindow.scrollTo( 0, Number.MAX_SAFE_INTEGER  )
    })
    reloadIFrame()
  }
  </script> 
  `)
})

app.get('/logs/:file', function (req, res) {
  res.sendFile(req.params.file, {
    root: path.join(__dirname, 'logs')
  })
});

const port = 8100
app.listen(port, () => {
  console.log(`Automate build API listening on port ${port}`);
});

