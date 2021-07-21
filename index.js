const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const path = require('path')

const {
  getDateTimeString: getTimeStr,
  normalizePort,
} = require('./utils')

// 服务启动时刻

// 解决 req.body undefined
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use(express.static(path.join(__dirname, 'public')));
app.use('/', express.static(path.join(__dirname, 'frontend/dist')));

// Create Router
app.use('/', require('./routes/index'));

// 全局错误处理
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  console.log(res.locals)

  // render the error page
  res.status(err.status || 500);
  res.send(err.message);
});

const port = normalizePort(process.env.PORT || '8100')
app.listen(port, () => {
  console.log(`Automate service running at: http://localhost:8100`);
});

