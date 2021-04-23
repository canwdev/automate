import Vue from 'vue'
import Vuex from 'vuex'
import {setToken,removeToken} from '@/utils/auth'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    token: null
  },
  mutations: {
    setToken(state, val) {
      if (val) {
        setToken(val)
      } else {
        removeToken()
      }
      state.token = val
    }
  },
  actions: {
  },
  modules: {
  }
})
