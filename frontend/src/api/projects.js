import Service from '@/utils/request'
import {HOST_URL} from '@/enum'

const service = new Service({
  baseURL: HOST_URL + '/api'
})

export function getBuildList() {
  return service.get('/build-list')
}

export function buildProject(item) {
  return service.get(`/build/${item.cmd}/${item.config}`)
}

export function listLogs() {
  return service.get('/logs')
}

export function logDetail(logName, params) {
  return service.get(`/log/${logName}`, {params})
}
