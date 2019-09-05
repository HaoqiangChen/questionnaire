import Vue from 'vue'
import App from './App'
import '@/common/js/connectApp.js'
import router from './router'
// 因为弹出手机输入法之后，间接改变了resize可视区域，如果监听这一个就会造成每次弹出手机输入法都会重新初始化 字体适配大小样式，而和该项目的字体可设置大小组件冲突，为了解决这个问题，当使用amfe-flexible时不用动态去监听窗口，进来的时候计算一下就行了，js里面会有监听resize的函数，把resize改成load
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
