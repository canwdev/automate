// 默认item属性
class DefaultItemData {
  constructor() {
    this.command = ''
    this.logName = ''
    this.timestamp = new Date().getTime()
    this.message = null
    this.branch = null
  }
}

// 合并默认属性
const mergeItemData = (data) => {
  const res = new DefaultItemData()

  for (const key in data) {
    // console.log(key, data[key], data[key] !== undefined, res[key])

    if (data[key] !== undefined && res[key] !== undefined) {
      res[key] = data[key]
    }
  }

  return res
}

class BuildItem {
  constructor(props = {}) {
    Object.assign(this, mergeItemData(props))
  }
}

module.exports = {
  BuildItem
}
