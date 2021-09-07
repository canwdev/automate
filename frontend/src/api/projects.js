import Service from '@/utils/service'
import {HOST_URL} from '@/enum'

const service = new Service({
  baseURL: HOST_URL + '/api'
})

export function getProjectList() {
  return service.get('/project-list')
}

export function buildProject(item) {
  return service.get(`/build`, {
    params: {
      cmd: item.cmd,
      args: item.args
    }
  })
}

export function abortBuild(data) {
  return service.post(`/abort-build`, data)
}


export function getBuildList(params) {
  return service.get('/logs', {
    params
  })
}

export function logDetail(logName, params) {
  return service.get(`/log/${logName}`, {params})
}

export function deleteAllLogs() {
  return service.post(`/delete-all-log`)
}

export function deleteLog(data) {
  return service.post(`/delete-log`, data)
}
