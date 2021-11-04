import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import 'normalize.css'
import tankUI from '@canwdev/tank-ui'
const isProd = process.env.NODE_ENV === 'production' // 'development'

Vue.use(tankUI)
if (isProd) {
  require('@canwdev/tank-ui/dist/tank-ui.css')
}
// app.js
import './styles/base.scss'
import './styles/custom.scss'

Vue.config.productionTip = false

const main = new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

export default main
