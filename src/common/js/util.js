/**
 * @authors chq (296260486@qq.com)
 * @date    2019/5/9 10:52
 * util 函数工具库
 */

import {deviceDate} from '@/common/js/global'

// weui插件时间控件时间重组和格式选择
export const weuiFormatTime = (date, fmt) => {
  if (fmt === '1') date = date.slice(0, 1)
  else if (fmt === '2') date = date.slice(0, 2)
  date = date.map(_ => _.label).join('')
  let hasForget = parseInt(deviceDate.getFullYear())
  if (parseInt(date.substr(0, 4)) > hasForget) date = '记不清了'
  return date
}

// 获取URL的查询参数
export function getUrlParam (param) {
  return decodeURIComponent((new RegExp('[?|&]' + param + '=' + '([^&;]+?)(&|#|;|$)').exec(location.href) || [, ''])[1].replace(/\+/g, '%20')) || null // eslint-disable-line
}
