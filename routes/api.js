const router = require('express').Router()
const service = require('./modules/service')
const user = require('./modules/user')
const projects = require('./modules/projects')
const userAuth = require('./middleware/user-auth')

router.get('/', service.info)
router.post('/restart', userAuth, service.restart)
router.post('/auth', user.getAuthorization)
router.get('/project-list', userAuth, projects.getProjectList)
router.get('/build', userAuth, projects.buildByGET)
router.post('/build', projects.buildByPOST)
router.get('/logs', userAuth, projects.getBuildLogs)
router.get('/log/:logName', userAuth, projects.getLogDetail)
router.post('/delete-logs', userAuth, projects.deleteAllLogs)
module.exports = router
