import Vue from 'vue'
import Vuex from 'vuex'
import {setToken,removeToken} from '@/utils/auth'
import {loadSettings, saveSettings} from '@/utils/settings'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    token: null,
    settings: loadSettings(),
  },
  getters: {
    isDarkTheme: state => state.settings.isDarkTheme,
  },
  mutations: {
    setToken(state, val) {
      if (val) {
        setToken(val)
      } else {
        removeToken()
      }
      state.token = val
    },
    setSettings: (state, val) => {
      state.settings = val
      saveSettings(state.settings)
    },
    updateSettings: (state, payload) => {
      const {key, value} = payload
      state.settings[key] = value
      saveSettings(state.settings)
    }
  },
  actions: {
  },
  modules: {
  }
})
