const {decrypt} = require('../../utils/crypt')
const {enableEncryption} = require('../../config')

/**
 * 统一处理客户端响应
 */
module.exports = async function (req, res, next) {
  try {
    // console.log('receive')

    // 解密报文
    if (/post/ig.test(req.method) && req.body) {
      const {ie, main} = req.body
      if (ie && main) {
        // console.log('POST', req.body)
        req.body = JSON.parse(decrypt(main))
      }
    }
    if (/get/ig.test(req.method) && req.query) {
      const {ie, main} = req.query
      if (ie && main) {
        // console.log('GET', req.query)
        req.query = JSON.parse(decrypt(main))
      }
    }

    next()
  } catch (e) {
    console.error(e)
    return res.status(500).send({
      message: e.message
    })
  }
}
