import Service from '@/utils/service'
import {HOST_URL} from '@/enum'

const service = new Service({
  baseURL: HOST_URL + '/api'
})

export function getAuth(params) {
  return service.post('/auth', params)
}
