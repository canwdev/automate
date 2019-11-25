// 存储日志的Storage
const path = require('path')
const LStorage = require('node-localstorage').LocalStorage;
const storage = new LStorage('logs/')
const KEY = 'index.json'

if (!storage.getItem(KEY)) {
  storage.setItem(KEY, '[]');
}

module.exports = {
  deleteAllLogs() {
    storage.setItem(KEY, '[]')
  },
  getLog() {
    return JSON.parse(storage.getItem(KEY))
  },
  addLog(log) {

    let logs = this.getLog()
    logs.push(Object.assign({
      time: '',
      command: '',
      logFile: '',
      postMessageFile: null,
      branch: null,
    }, log))

    return storage.setItem(KEY, JSON.stringify(logs))
  }
}