import Vue from 'vue'
import VueRouter from 'vue-router'

import Index from '@/views/index'




Vue.use(VueRouter);
 

//解决同一路由被重复添加
const routerPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  return routerPush.call(this, location).catch(error=> error)
}

  const routes = [
      {path:'/',name:'Index',component:Index}

   
  // { path: '/about',name: 'About',
  //1     component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')}
    
    

  ]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
