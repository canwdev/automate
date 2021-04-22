const router = require('express').Router()
const service = require('./modules/service')

router.get('/', service.info)
module.exports = router
