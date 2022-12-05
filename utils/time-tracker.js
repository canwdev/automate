const moment = require('moment')

function formatRunningTime(diff) {
  // return (diff / 1000).toFixed(0) + 's'

  const duration = moment.duration(diff)

  const days = duration.days()
  const hours = duration.hours()
  const minutes = duration.minutes()
  const seconds = duration.seconds()

  return (days > 0 ? (days + ' 天 ') : '') +
    (hours > 0 ? (hours + ' 小时 ') : '') +
    (minutes > 0 ? (minutes + ' 分 ') : '') +
    seconds + ' 秒'
}

class TimeTracker {
  constructor(immediate = true) {
    this.startTime = null
    this.stopTime = null

    if (immediate) {
      this.start()
    }
  }

  start() {
    this.startTime = new Date()
    console.log(`⏱ 开始时间: ${moment(this.startTime).format('YYYY-MM-DD HH:MM:ss')}  (${this.startTime.getTime()})`)
  }

  stop() {
    this.stopTime = new Date()
    console.log(`⏰ 结束时间: ${moment(this.startTime).format('YYYY-MM-DD HH:MM:ss')}  (${this.stopTime.getTime()})`)

    if (this.startTime) {
      const diff = this.stopTime - this.startTime
      console.log(`总计用时：${formatRunningTime(diff)} (${diff}ms)`)
    }
  }
}

module.exports = TimeTracker