/**
 * 统一处理客户端返回
 */
module.exports = async function clientSender(req, res, next) {
  res.sendData = data => {
    return res.json(data)
  }
  res.sendError = ({message, code = 400} = {}) => {
    return res.status(code).json({
      message: message || 'Error'
    })
  }
  next()
}
