import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import axios from 'axios'
import qs from 'qs'


import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI);

import '@/style/index.scss'

axios.defaults.transformRequest = [function (data) {
 let ret = ''
 for (let it in data) {
  ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
 }
 return ret
}]


Vue.prototype.$axios=axios


Vue.config.productionTip = false

import util from './util/util.js'
Vue.prototype.util=util;



new Vue({
  router,
  store,
  axios,
  render: h => h(App)
}).$mount('#app')
