const path = require('path')

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync(path.join(__dirname, '../logs/db.json'))
const db = low(adapter)

// Set some defaults
db.defaults({ logs: [] })
  .write()

module.exports = db
