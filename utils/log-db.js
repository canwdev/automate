const path = require('path')
const {LOG_PATH} = require('../configs')

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync(path.join(LOG_PATH, 'db.json'))
const db = low(adapter)

// Set some defaults
db.defaults({ logs: [] })
  .write()

module.exports = db
