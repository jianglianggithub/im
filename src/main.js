import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from '@/store/index'
import http from "./utils/request"
Vue.config.productionTip = false
import { Toast } from "vant"
Vue.prototype.$msg = Toast
Vue.prototype.$http = http



import "@/assets/iconfont/iconfont.css";




new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')


import "./utils/rem";
