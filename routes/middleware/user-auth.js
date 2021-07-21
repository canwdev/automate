const jwt = require('jsonwebtoken')
const {
  JWT_TOKEN,
  CODE_CLIENT_FORBIDDEN
} = require('../../enum')
const {enableAuth, authUsers} = require('../../configs')

/**
 * 验证登录中间件
 * 需要验证的路由，需要在请求头加入 authorization 字段，值为登录成功获取的token
 * 会向下级传递 __userid 作为登录用户的id
 */
module.exports = async function authLogin(req, res, next) {
  // 必须先登录
  try {
    if (!enableAuth) {
      req.__userid = null
      return next()
    }

    let token = req.headers.authorization

    if (token) {
      const raw = String(token)
      const {id} = jwt.verify(raw, JWT_TOKEN)

      const hasUser = authUsers[id]

      if (!hasUser) return res.sendError({
        code: CODE_CLIENT_FORBIDDEN,
        message: 'Token expired (1)'
      })

      // 向下一级传值
      req.__userid = id
      next()
    } else {
      return res.sendError({
        code: CODE_CLIENT_FORBIDDEN,
        message: 'This action needs login'
      })
    }
  } catch (e) {
    console.error(e)

    if (e.message === 'jwt expired') {
      return res.sendError({
        code: CODE_CLIENT_FORBIDDEN,
        message: 'Token expired (2)'
      })
    }

    return res.status(500).send({
      message: e.message
    })
  }
}
