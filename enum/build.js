// 处理状态
const BuildStatus = {
  WAITING: 1, // 排队等待
  RUNNING: 2, // 正在运行
  FINISH: 3, // 成功
  ERRORED: 4// 错误
}

// 默认item属性
class DefaultItemData {
  constructor() {
    this.id = null // database id
    this.command = ''
    this.logName = ''
    this.timestamp = new Date().getTime()
    this.message = null
    this.branch = null
    this.buildStatus = BuildStatus.WAITING
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

class BuildViewItem {
  constructor(props = {}) {
    Object.assign(this, mergeItemData(props))
  }
}

module.exports = {
  BuildStatus,
  BuildViewItem
}
