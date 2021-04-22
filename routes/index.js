const router = require('express').Router();
const clientSender = require('./middleware/client-sender')

// 允许跨域访问
router.use("*", function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length,Authorization,Accept,X-Requested-With");
  next()
})

router.use('/api', clientSender, require('./api'));

module.exports = router;
