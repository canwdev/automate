const fs = require('fs')

// 本来想写一个基于JSON文件存储的localstorage，结果发现网上有现成的库，就放弃了。

/**
 * 同步读取SON文件到JS对象
 * @param {string} path 配置文件路径
 */
function readJsonAsObjectSync(path) {
  try {
    const data = fs.readFileSync(path, { encoding: 'utf-8' })
    return JSON.parse(data)
  } catch (e) {
    console.error(e.message)
    return null
  }
}

/**
 * 同步写入对象到JSON文件
 * @param {string} path 配置文件路径
 * @param {Object} obj 要写入的对象
 */
// function writeJsonAsObjectSync(path, obj) {
//   try { 
//     const json = JSON.stringify(obj)
//     return fs.writeFileSync(path, json, { encoding: 'utf8' })
//   } catch (e) {
//     console.error(e.message)
//   }
// }

// function LStorage(path) {
//   if (!path) {
//     throw new Error('必须提供用于保存数据文件的路径！')
//   }
//   this.path = path
//   if (!readJsonAsObjectSync(path)) {
//     writeJsonAsObjectSync(path, {}) // 重新初始化文件
//   }
// }
// LStorage.prototype.clear = function() {
//   writeJsonAsObjectSync(this.path, {})
// }

module.exports = {
  readJsonAsObjectSync,
  // writeJsonAsObjectSync,
  // LStorage
}