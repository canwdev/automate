import Vue from 'vue'
import Vuex from 'vuex'
import {setToken} from '@/utils/auth'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    token: null
  },
  mutations: {
    setToken(state, val) {
      setToken(val)
      state.token = val
    }
  },
  actions: {
  },
  modules: {
  }
})
