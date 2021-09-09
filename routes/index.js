const router = require('express').Router();
const clientSender = require('./middleware/client-sender')
const clientReceiver = require('./middleware/client-receiver')

// 允许跨域访问
router.use("*", function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length,Authorization,Accept,X-Requested-With");
  next()
})

router.use('/api', clientReceiver, clientSender, require('./api'));

module.exports = router;
