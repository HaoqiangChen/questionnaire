<template>
  <div class="audit">
    <preface :wjDetail="wjDetail" v-if="showPreFace" @showQuestionDom="showQuestionDom"></preface>
    <answer v-if="showAnswer" :answerList="answerList" @showFontSet="showFontSet" @showSuccessDom="showSuccessDom"></answer>

    <success :action="action" v-show="showSuccess"></success>

    <font-set v-show="isFontSet"></font-set>
    <transition name="fade">
      <div class="fontset-mask" v-show="isFontSet" @click="hideFontSet"></div>
    </transition>
  </div>
</template>

<script>
import axios from 'axios'
import {getUrlParam} from '@/common/js/util'
import {DOMAIN, ERR_OK} from '@/common/js/global'
import preface from '@/components/preface/preface'
import answer from '@/components/answer/answer'
import fontSet from '@/components/fontset/fontset'
import success from '@/components/success/success'

export default {
  components: {
    preface,
    answer,
    fontSet,
    success
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
    // alert(getUrlParam('recordfk'))
    this.getWjData()
  },
  methods: {
    /**
     * 获取问卷数据
     */
    getWjData () {
      let loading = this.$weui.loading('问卷数据加载中...', {
        className: 'question-loading'
      })
      DOMAIN(domain => {
        let ajaxUrl = `${domain}/terminal/interview/system.do?action=getQuestionsResult`

        axios.post(`${ajaxUrl}&authorization=${getUrlParam('token')}&sid=${getUrlParam('sid')}`, {
          data: {
            filter: {
              id: getUrlParam('paperfk'),
              recordfk: getUrlParam('recordfk')
            }
          }
        }).then((res) => {
          // console.log(res)
          if (res.data.status === ERR_OK) {
            this.answerList = res.data.result.rows
            // this.answerList.map((item, index) => {
            //   if (!item.question.length) this.answerList.splice(index, 1)
            // })
            if (!this.answerList.length) {
              this.$weui.alert('抱歉，无该问卷数据! 点击确认返回。', () => {
                this.backToApp()
              })
            }
            this.wjDetail = res.data.result.detail
            this.wjDetail.userDetail = res.data.result.userdetail
            if (this.wjDetail.userDetail.fileurl) {
              this.fileUrl = `${domain}/security/deviceComm.do?action=getFileDetail&authorization=${getUrlParam('token')}&url=${this.wjDetail.userDetail.fileurl}`
            }
            this.showPreFace = true
            // console.log(this.answerList)
            loading.hide()
          } else {
            loading.hide(() => {
              console.log(res.data.stacktrace.substring(0, 300))
              this.$weui.alert(`${res.data.message} <br/>点击确认返回。`, () => {
                this.backToApp()
              }, {
                title: '请求失败'
              })
            })
          }
        }).catch((err) => {
          console.log(err)
          loading.hide(() => {
            console.log(err)
            this.$weui.alert(`${err} <br/>点击确认返回。`, () => {
              this.backToApp()
            }, {
              title: '请求失败'
            })
          })
        })
      })
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
    showSuccessDom () {
      this.showAnswer = false
      this.showSuccess = true
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
