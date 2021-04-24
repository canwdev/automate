const {
  exec
} = require('./index')

module.exports = {
  /**
   * Server酱 推送API https://sc.ftqq.com/9.version
   * @param title 必填，最长265字节
   * @param content 消息内容，最长64K，选填，支持MarkDown
   * @returns {*}
   */
  pushServerChan(title, content) {
    title = encodeURIComponent(title)
    content = encodeURIComponent(content)
    const {
      serverChannSCKEY
    } = require('../configs')

    if (!serverChannSCKEY) {
      console.log('推送 SCKEY 未指定')
      return
    }
    console.log('Push ServerChan!')
    return exec(`curl -s "http://sc.ftqq.com/${serverChannSCKEY}.send?text=${title}" -d "&desp=${content}"`)
  }
}
