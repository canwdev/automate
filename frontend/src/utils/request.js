import axios from 'axios'
import {getToken} from './auth'

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
      console.log(message)
      return Promise.reject(error)
    }
  )

  return service
}

export default Service
