const router = require('express').Router()
const service = require('./modules/service')
const user = require('./modules/user')
const projects = require('./modules/projects')
const userAuth = require('./middleware/user-auth')

router.get('/', service.info)
router.post('/restart', userAuth, service.restart)
router.post('/auth', user.getAuthorization)
router.get('/build-list', userAuth, projects.getBuildList)
module.exports = router
