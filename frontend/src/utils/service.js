import axios from 'axios'
import {getToken} from './auth'
import {decrypt} from '../../../utils/crypt'
import {notifyError} from "./notify"

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
      let {data} = response

      try {
        if (data.ie) {
          data = JSON.parse(decrypt(data.main))
          console.log('dd', data)
        }
      } catch (e) {
        notifyError({message: e.message})
        return Promise.reject(e)
      }
      return data
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
      notifyError({
        title: '请求错误',
        message
      })
      return Promise.reject(error)
    }
  )

  return service
}

export default Service
