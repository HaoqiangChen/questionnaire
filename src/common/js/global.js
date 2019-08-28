/**
 * @authors chq (296260486@qq.com)
 * @date    2019/5/8
 * global 全局变量
 */

import {getUrlParam} from '@/common/js/util'

export const deviceDate = new Date()

export const DOMAIN = function (callback) {
  if (getUrlParam('isonline') !== '3') {
    setTimeout(() => {
      window.WebViewJavascriptBridge.callHandler('question', {'action': 'getServerUrl'}, (res) => {
        if (res) {
          let domain = /^https?:\/\/.*?(:\d+)?(\/|$|\?)/.exec(res)
          // return domain ? domain[0].replace(/(\/|\?)$/, '') : null
          callback(domain ? domain[0].replace(/(\/|\?)$/, '') : null)
        } else {
          alert('请事先设置好服务器地址')
        }
      })
    }, 500)
  }
}

// 定义请求成功状态码
export const ERR_OK = 1

// 设置默认 自动翻页时间
export const autoDuration = 200

// 设置默认input 的配置
export const inputOption = {
  // 设置默认input 的宽度
  defaultWidth: 50
}

// 设置weui插件的默认配置
export const weuiOption = {
  // 设置警告停留时间
  warmDuration: 1000,
  // 设置datePicker开始时间
  dateStart: deviceDate.getFullYear() - 80,
  // 设置datePicker结束时间
  dateEnd: deviceDate.getFullYear() + 50
}
