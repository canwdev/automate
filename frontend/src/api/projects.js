import Service from '@/utils/request'
import {HOST_URL} from '@/enum'

const service = new Service({
  baseURL: HOST_URL + '/api'
})

export function getBuildList() {
  return service.get('/build-list')
}
