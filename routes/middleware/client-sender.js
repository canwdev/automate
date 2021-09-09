const {encrypt} = require('../../utils/crypt')
const {enableEncryption} = require('../../config')

/**
 * 统一处理客户端返回
 */
module.exports = async function (req, res, next) {
  res.sendData = (data) => {
    // console.log('sendData')
    if (enableEncryption) {
      // 加密报文

      const str = JSON.stringify(data)

      if (str) {
        return res.json({
          main: encrypt(str),
          ie: true
        })
      }

      return res.send()
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
