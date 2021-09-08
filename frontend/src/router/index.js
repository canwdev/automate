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
    component: () => import('@/views/BuildList.vue')
  },
  {
    path: '/log/:id',
    name: 'BuildDetail',
    component: () => import('@/views/BuildDetail.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
