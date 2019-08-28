/**
 * @authors chq (296260486@qq.com)
 * @date    2019/5/8
 * reg 正则表达式判断
 */

export const inputReg = {
  // 整数
  isInt (str) {
    let reg = /\D/
    return reg.test(str)
  },
  // 小数
  isFloor (str) {
    let reg = /^\d+\.\d{0,2}$/
    return reg.test(str)
  },
  // 百分数
  isPercent (str) {
    // let reg = /^\d+\.?\d{0,2}$/
    let reg = /^(100|[1-9]?\d(\.\d\d?\d?)?)$/
    return reg.test(str)
  },
  // 手机
  isPhone (str) {
    let reg = /^[1]([3-9])[0-9]{9}$/
    return reg.test(str)
  },
  // 邮件
  isEmail (str) {
    let reg = /^\w+@[a-zA-Z0-9]{2,10}(?:\.[a-z]{2,4}){1,3}$/
    return reg.test(str)
  }
}
