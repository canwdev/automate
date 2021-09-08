
// 处理状态
const BuildStatus = {
  WAITING: 1, // 排队等待
  RUNNING: 2, // 正在运行
  FINISH: 3, // 成功
  ERRORED: 4, // 错误
}

module.exports = {
  BuildStatus
}
