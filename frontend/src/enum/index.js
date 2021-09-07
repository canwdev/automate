import common from '../../../enum/common'

export const BuildStatus = common.BuildStatus

export const HOST_URL = process.env.VUE_APP_API_HOST || ''

export const BuildStatusText = {
  [BuildStatus.WAITING]: '等待中',
  [BuildStatus.RUNNING]: '运行中',
  [BuildStatus.FINISH]: '完毕',
  [BuildStatus.ERRORED]: '错误',
}
