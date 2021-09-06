const Sequelize = require('sequelize')
const path = require('path')
const {
  DATA_PATH
} = require('../config')

const sequelize = new Sequelize({
  host: 'localhost',
  dialect: 'sqlite',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  storage: path.join(DATA_PATH, 'automate.db'),
  // disable logging; default: console.log
  logging: false
})

module.exports = sequelize
