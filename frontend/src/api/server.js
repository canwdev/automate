import Service from '@/utils/request'
import {HOST_URL} from '@/enum'

const service = new Service({
  baseURL: HOST_URL + '/api'
})

export function getServiceInfo() {
  return service.get('/info')
}

export function restartService() {
  return service.post('/restart')
}
