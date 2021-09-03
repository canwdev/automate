import Service from '@/utils/service'
import {HOST_URL} from '@/enum'

const service = new Service({
  baseURL: HOST_URL + '/api'
})

export function getServiceInfo() {
  return service.get('/')
}

export function restartService() {
  return service.post('/restart')
}
