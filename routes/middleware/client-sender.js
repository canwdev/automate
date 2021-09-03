const {encrypt} = require('../../utils/crypt')
const {enableEncryption} = require('../../configs')

/**
 * 统一处理客户端返回
 */
module.exports = async function clientSender(req, res, next) {
  res.sendData = data => {
    if (enableEncryption) {
      const ret = {
        main: encrypt(JSON.stringify(data)),
        ie: true
      }

      return res.json(ret)
    }
    return res.json(data)
  }
  res.sendError = ({message, code = 400} = {}) => {
    return res.status(code).json({
      message: message || 'Error'
    })
  }
  next()
}
