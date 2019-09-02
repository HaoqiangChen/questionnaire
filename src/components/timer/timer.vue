<template>
  <div class="timer">
    <span><i></i>{{timerStr}}</span>
  </div>
</template>

<script>
import {getUrlParam} from '@/common/js/util'
import {getLocalCache, setLocalCache} from '@/common/js/cache'

const TIMER_KEY = `${getUrlParam('recordfk')}-${getUrlParam('paperfk')}-timer`

export default {
  data () {
    return {
      h: 0,
      m: 0,
      s: 0,
      timer: 0,
      timerStr: ''
    }
  },
  created () {
    let answerTime = getLocalCache(TIMER_KEY, '')
    if (answerTime) {
      this.h = parseInt(answerTime.substr(0, 2))
      this.m = parseInt(answerTime.substr(3, 2))
      this.s = parseInt(answerTime.substr(6, 2))
    }
    this.start()
  },
  destroyed () {
    this.stop()
  },
  methods: {
    timerFn () {
      this.s += 1
      if (this.s >= 60) {
        this.s = 0
        this.m = this.m + 1
      }

      if (this.m >= 60) {
        this.m = 0
        this.h = this.h + 1
      }
      this.timerStr = this._toDub(this.h) + ':' + this._toDub(this.m) + ':' + this._toDub(this.s) + ''
      setLocalCache(TIMER_KEY, this.timerStr)
    },

    reset () {
      clearInterval(this.timer)
      this.h = 0
      this.m = 0
      this.s = 0
      this.timerStr = '00:00:00'
    },

    start () {
      this.timer = setInterval(this.timerFn, 1000)

      // 解决手机自带返回键vue钩子destroyed无效问题
      let hiddenProperty = 'hidden' in document ? 'hidden' : 'webkitHidden' in document ? 'webkitHidden' : 'mozHidden' in document ? 'mozHidden' : null;
      let visibilityChangeEvent = hiddenProperty.replace(/hidden/i, 'visibilitychange');
      const onVisibilityChange = function () {
        if (!document[hiddenProperty]) {
          // console.log('页面非激活')
          this.stop()
        } else {
          // console.log('页面激活')
          document.removeEventListener(visibilityChangeEvent, onVisibilityChange)
        }
      }
      document.addEventListener(visibilityChangeEvent, onVisibilityChange)
    },

    stop () {
      clearInterval(this.timer)
    },

    _toDub (n) {
      if (n < 10) {
        return '0' + n
      } else {
        return '' + n
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import "~@/common/stylus/mixin"

  span
    font-size 26px

    i
      display inline-block
      width 26px
      height 26px
      margin-right 5px
      bg-image('clock')
      vertical-align text-top
</style>
