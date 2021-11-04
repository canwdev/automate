import axios from 'axios'
import {getToken} from './auth'
import {encrypt, decrypt} from '../../../utils/crypt'
import main from '../main'
const enableEncryption = process.env.VUE_APP_ENABLE_ENCRYPTION

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

      if (enableEncryption) {
        // 加密请求
        // console.log('config1',config)
        if (/post/ig.test(config.method) && config.data) {
          config.data = {
            ie: true,
            main: encrypt(JSON.stringify(config.data))
          }
        }
        if (/get/ig.test(config.method) && config.params) {
          // console.log(config.params)
          config.params = {
            ie: true,
            main: encrypt(JSON.stringify(config.params))
          }
        }
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
        // 解密请求
        if (data.ie) {
          data = JSON.parse(decrypt(data.main))
          // console.log('dd', data)
        }
      } catch (e) {
        main.$toast.error({message: e.message})
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
      main.$toast.warning(`请求错误: ${message}`)
      return Promise.reject(error)
    }
  )

  return service
}

export default Service
