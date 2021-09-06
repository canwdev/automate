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
  pushServerChan(title = 'pushServerChan', content = '') {
    content = encodeURIComponent(new Date().getTime() + '\n\n' + content)
    const {
      serverChannSCKEY
    } = require('../config')

    if (!serverChannSCKEY) {
      console.log(title)
      console.log('ServerChan 推送 SCKEY 未指定')
      return
    }
    console.log('Push ServerChan!')
    return exec(`curl -s "http://sc.ftqq.com/${serverChannSCKEY}.send?text=${encodeURIComponent(title)}" -d "&desp=${content}"`)
  }
}
