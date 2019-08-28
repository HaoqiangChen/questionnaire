/**
 * @authors chq (296260486@qq.com)
 * @date    2019/5/11
 * cache 本地缓存
 */

import storage from 'good-storage'
import {getUrlParam} from '@/common/js/util'

const ANSWER_KEY = `${getUrlParam('recordfk')}-${getUrlParam('paperfk')}`
const SUBMIT_KEY = getUrlParam('recordfk')

export function getLocalAnswer () {
  return storage.get(ANSWER_KEY, [])
}

export function setLocalAnswer (answer) {
  return storage.set(ANSWER_KEY, answer)
}

export function removeLocalAnswer () {
  storage.forEach(_ => {
    if (new RegExp(SUBMIT_KEY).test(_)) return storage.remove(_)
  })
}

export function getQuestionAnswer (id) {
  let answer = []
  answer = storage.get(ANSWER_KEY, [])
  return answer.filter(_ => parseInt(_.idx) === parseInt(id))[0]
}

export function deleteQuestionAnswer (id) {
  let answer = []
  answer = storage.get(ANSWER_KEY, [])
  answer.map((_, i) => {
    if (parseInt(_.idx) === parseInt(id)) answer.splice(i, 1)
  })
  storage.set(ANSWER_KEY, answer)
}

export function getLocalCache (key, value) {
  return storage.get(key, value)
}

export function setLocalCache (key, value) {
  return storage.set(key, value)
}

export function removeLocalCache (key) {
  return storage.remove(key)
}
