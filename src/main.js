import Vue from 'vue'
import App from './App'
import '@/common/js/connectApp.js'
import router from './router'
import 'amfe-flexible'
import weui from 'weui.js'
import 'weui'
import fastclick from 'fastclick'
import qType3 from '@/components/questiontype/qtype3'
import VueTouch from 'vue-touch'
// import Vconsole from 'vconsole'

import '@/common/stylus/index.styl'

Vue.config.productionTip = false
fastclick.attach(document.body)
Vue.prototype.$weui = weui
Vue.component('q-type3', qType3)
Vue.use(VueTouch, {name: 'v-touch'})
// Vue.prototype.$vConsole = new Vconsole()

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
