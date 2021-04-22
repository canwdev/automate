const {enableAuth, authUsers} = require('../../configs')
const jwt = require('jsonwebtoken')
const {
  JWT_TOKEN,
  JWT_TOKEN_EXPIRE
} = require('../../enum')

module.exports = {
  async getAuthorization(req, res, next) {
    try {
      const data = req.body
      if (!data.username || !data.password) {
        return res.sendError({message: 'Username or password is required'})
      }

      const {username, password} = data
      const user = authUsers[username]

      if (!user) {
        return res.sendError({message: 'Login Failed (1)'})
      }

      const isPasswordValid = password === user
      if (!isPasswordValid) {
        return res.sendError({message: 'Username or password is invalid'})
      }

      // Generate token
      // jwt.sign() 接受两个参数，一个是传入的对象，一个是自定义的密钥
      const token = jwt.sign({id: String(user.id)}, JWT_TOKEN, {
        expiresIn: JWT_TOKEN_EXPIRE
      })

      return res.sendData({
        message: 'Login success',
        token,
        username
      })
    } catch (e) {
      next(e)
    }
  }
}
