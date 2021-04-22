import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    username: null
  },
  mutations: {
    setUsername(state, val) {
      state.username = val
    }
  },
  actions: {
  },
  modules: {
  }
})
