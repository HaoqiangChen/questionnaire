<template>
  <div class="survey">
    <!--    <preface :wjDetail="wjDetail" v-if="showPreFace" @showQuestionDom="showQuestionDom"></preface>-->
    <question-list v-if="questionData.length && showQuestion" :questionData="questionData" :contentsList="contentsList"
                   :cachePage="cachePage"
                   @showSubmitDom="showSubmitDom" @showFontSet="showFontSet"></question-list>
    <submit v-if="showSubmit" @showSuccessDom="showSuccessDom" @backToQuestion="backToQuestion"
            :questionData="questionData"></submit>
    <success :action="action" v-show="showSuccess"></success>
    <font-set v-show="isFontSet"></font-set>
    <transition name="fade">
      <div class="fontset-mask" v-show="isFontSet" @click="hideFontSet"></div>
    </transition>
  </div>
</template>

<script>
import questionList from '@/components/question/questionlist'
import fontSet from '@/components/fontset/fontset'
import submit from '@/components/submit/submit'
import success from '@/components/success/success'
import {getLocalAnswer, removeLocalAnswer} from '@/common/js/cache'

export default {
  components: {
    questionList,
    fontSet,
    submit,
    success
  },
  data () {
    return {
      wjDetail: {},
      questionData: [],
      contentsList: [],
      name: '',
      introduce: '',
      showPreFace: false,
      showQuestion: false,
      showSubmit: false,
      showSuccess: false,
      showContents: false,
      isFontSet: false,
      cachePage: 0,
      lastPage: false,
      action: 'submit'
    }
  },
  created () {
    this.getWjData()
  },
  mounted () {
  },
  methods: {
    /**
     * 获取问卷数据
     */
    getWjData () {
      let loading = this.$weui.loading('问卷数据加载中...', {
        className: 'question-loading'
      })
      setTimeout(() => {
        window.WebViewJavascriptBridge.callHandler('question', {'action': 'getQuestion'}, (res) => {
          let offlineData = JSON.parse(res)
          // console.log(offlineData)
          if (offlineData !== {}) {
            let cache = getLocalAnswer()
            if (cache.length) {
              this.$weui.confirm('继续上次的问卷调查会直接跳过上次已答问题，请问是否确定', {
                title: '是否继续上次的问卷调查',
                className: 'weui-continue-dialog',
                buttons: [{
                  label: '重新答题',
                  type: 'default',
                  onClick: () => {
                    // console.log('重新答题')
                    removeLocalAnswer()
                    this.questionData = JSON.parse(offlineData.detail).rows
                    this.showQuestion = true
                  }
                }, {
                  label: '继续答题',
                  type: 'primary',
                  onClick: () => {
                    // console.log('继续答题')
                    this.questionData = JSON.parse(offlineData.detail).rows
                    this.questionData = this.questionData.concat(cache)
                    let _tmp = {}
                    this.questionData.map(_ => {
                      _tmp[_.idx] = _
                    })
                    this.questionData = Object.values(_tmp)
                    this.cachePage = parseInt(cache[cache.length - 1].idx)
                    this.showQuestion = true
                  }
                }]
              })
            } else {
              this.questionData = JSON.parse(offlineData.detail).rows
              // console.log(this.questionData)
              if (!this.questionData.length) {
                this.$weui.alert('抱歉，无该问卷数据! 点击确认返回。', () => {
                  this.backToApp()
                })
              }
              this.showQuestion = true
            }

            this.contentsList = JSON.parse(offlineData.detail).contents
            this.name = JSON.parse(offlineData.detail).detail.name
            this.introduce = JSON.parse(offlineData.detail).detail.introduce
            loading.hide()
            this.$weui.alert(`${this.introduce}`, () => {
              // console.log('ok')
            }, {
              title: `${this.name} 指导语`
            })
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
    /**
     * 显隐字体设置大小组件，由于组件里面需要每次都调用mounted初始化setSlider方法，所以不能用v-show(只调用一次),要用v-if
     */
    showFontSet () {
      this.isFontSet = !this.isFontSet
    },
    hideFontSet () {
      this.isFontSet = false
    },
    showQuestionDom () {
      this.showPreFace = false
      this.showQuestion = true
    },
    showSubmitDom () {
      this.showQuestion = false
      this.showSubmit = true
    },
    showSuccessDom () {
      this.showSubmit = false
      this.showSuccess = true
    },
    backToQuestion () {
      this.showSubmit = false
      this.showQuestion = true
    },
    backToApp () {
      window.WebViewJavascriptBridge.callHandler('question', {'action': 'finish'})
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="stylus" scoped>
  @import "~@/common/stylus/variable"

  .survey
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
