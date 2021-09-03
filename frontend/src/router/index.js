import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '@/views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/logs',
    name: 'Logs',
    component: () => import('@/views/LogList.vue')
  },
  {
    path: '/log/:logName',
    name: 'LogDetail',
    component: () => import('@/views/LogDetail.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
