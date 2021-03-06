/**
 * @authors chq (296260486@qq.com)
 * @date    2019/5/9 10:52
 * util 函数工具库
 */

import {deviceDate} from '@/common/js/global'

// weui插件时间控件时间重组和格式选择
export const weuiFormatTime = (date, fmt) => {
  if (fmt === '1') {
    date = date.slice(0, 1)
  } else if (fmt === '2') {
    date = date.slice(0, 2)
  }
  date = date.map(_ => _.label).join('')
  if (new Date(formatChineseDate(date)).getTime() > deviceDate.getTime()) date = '记不清'
  return date
}

// 获取URL的查询参数
export function getUrlParam (param) {
  return decodeURIComponent((new RegExp('[?|&]' + param + '=' + '([^&;]+?)(&|#|;|$)').exec(location.href) || [, ''])[1].replace(/\+/g, '%20')) || null // eslint-disable-line
}

/**
 * 日期转化为时间戳
 * @param date
 */
export function getTimestamp (date) {
  return new Date(formatChineseDate(date)).getTime()
}

/**
 * 根据出生日期和第二个参数日期计算 年龄
 * @param birthday 出生日期
 * @param day 日期
 */
export function getAge (birthday, day) {
  let birth = formatChineseDate(birthday)
  let date = new Date()
  let today = day ? formatChineseDate(day) : [date.getFullYear(), date.getMonth() + 1, date.getDate()]

  let age = today[0] - parseInt(birth[0])

  if (today[1] && today[1] < parseInt(birth[1])) --age
  else if (today[1] && today[1] === parseInt(birth[1]) && today[2] && today[2] < parseInt(birth[2])) --age
  else if (today[1] && today[1] === parseInt(birth[1]) && today[2] && today[2] > parseInt(birth[2])) ++age

  return age
}

/**
 * 通过身份证号码获取出生年月日
 * @param idCard 身份证号码
 */
export function getBirthdayFromIdCard (idCard) {
  let birthday = ''
  if (idCard.length === 15) birthday = '19' + idCard.substr(6, 6)
  else if (idCard.length === 18) birthday = idCard.substr(6, 8)

  return birthday.replace(/(.{4})(.{2})(.{2})/, '$1年$2月$3日')
}

/**
 * 将中文日期格式年月日 转化为 标准日期格式
 * @param date '2020年11月02日'
 * @returns {string[]} '2020-11-02'
 */
function formatChineseDate (date) {
  return date.replace('年', '-').replace('月', '-').replace('日', '').split('-')
}
