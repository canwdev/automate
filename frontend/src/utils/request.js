import axios from 'axios'
import {getToken} from './auth'
import main from '../main'
function Service(config = {}) {
  const {
    baseURL,
    withCredentials = false,
    timeout,
    headers
  } = config

  const service = axios.create({
    baseURL,
    withCredentials,
    timeout,
    headers
  })

  service.interceptors.request.use(
    config => {
      const Authorization = getToken()
      if (Authorization) {
        config.headers.Authorization = Authorization
      }
      return config
    },
    error => {
      return Promise.reject(error)
    }
  )
  service.interceptors.response.use(
    response => {
      return response.data
    },
    error => {
      let message = error.message
      const {response} = error || {}
      if (response) {
        const {data: {message: msg} = {}} = response
        if (msg) {
          message = msg
        }
      }
      main.$bvToast.toast(message, {
        variant: 'danger',
        title: '请求错误',
        toaster: 'b-toaster-top-center',
      })
      return Promise.reject(error)
    }
  )

  return service
}

export default Service
