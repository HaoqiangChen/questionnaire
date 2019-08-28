<template>
  <div class="audit">
    <answer v-if="showAnswer" :answerList="answerList" @showFontSet="showFontSet"></answer>

    <font-set v-show="isFontSet"></font-set>
    <transition name="fade">
      <div class="fontset-mask" v-show="isFontSet" @click="hideFontSet"></div>
    </transition>
  </div>
</template>

<script>
// import {getUrlParam} from '@/common/js/util'
import answer from '@/components/answer/answer'
import fontSet from '@/components/fontset/fontset'

export default {
  components: {
    answer,
    fontSet
  },
  data () {
    return {
      wjDetail: {},
      answerList: [],
      showPreFace: false,
      showAnswer: false,
      showSuccess: false,
      isFontSet: false,
      lastPage: false,
      fileUrl: '',
      action: 'audit'
    }
  },
  created () {
    this.getWjData()
  },
  methods: {
    getWjData () {
      let loading = this.$weui.loading('问卷数据加载中...', {
        className: 'question-loading'
      })
      setTimeout(() => {
        window.WebViewJavascriptBridge.callHandler('question', {'action': 'getQuestionResult'}, (res) => {
          let offlineData = JSON.parse(res)
          console.log(offlineData)
          if (offlineData.length) {
            this.answerList = this._normalizeAnswer(offlineData)
            // console.log(this.answerList)

            if (!this.answerList.length) {
              this.$weui.alert('抱歉，无该问卷数据! 点击确认返回。', () => {
                this.backToApp()
              })
            }
            this.showAnswer = true

            loading.hide()
          } else {
            loading.hide(() => {
              this.$weui.alert(`请求不到该问卷数据，有可能前面缓存失败，请重新缓存 <br/>点击确认返回。`, () => {
                this.backToApp()
              }, {
                title: '请求失败'
              })
            })
          }
        })
      }, 3000)
    },
    showFontSet () {
      this.isFontSet = !this.isFontSet
    },
    hideFontSet () {
      this.isFontSet = false
    },
    showQuestionDom () {
      this.showPreFace = false
      this.showAnswer = true
    },
    /**
     * 将问卷问题数据进行重组，分类出一级标题（按A、B、C等等分类）
     * @param list
     */
    _normalizeAnswer (list) {
      let answer = []
      let map = {}
      list.forEach(_ => {
        const key = _.code.charAt(0)
        const classify = _.classify
        if (!map[key]) {
          map[key] = {
            name: classify,
            type: key,
            question: []
          }
        }
        map[key].question.push(_)
      })
      for (let key in map) {
        let val = map[key]
        if (!val.question.length) {
          continue
        } else {
          answer.push(val)
        }
      }
      return answer
    },
    backToApp () {
      // console.log('关闭页面返回APP')
      window.WebViewJavascriptBridge.callHandler('question', {'action': 'finish'})
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import "~@/common/stylus/variable"

  .audit
    .answer-content
      position fixed
      width: 100%
      top: 40PX
      bottom: 0
      background-color $color-background

    >>> .question fieldset .field
      min-height auto

    .fontset-mask
      position fixed
      top $header-height
      left 0
      width 100%
      height 100%
      z-index 8 // z-index要小于fontset-content的index
      opacity 1

      &.fade-enter-active, &.fade-leave-active
        opacity 1
        transition: all 0.5s

      // 设置缓动效果

      &.fade-enter, &.fade-leave-active
        opacity 0
</style>
