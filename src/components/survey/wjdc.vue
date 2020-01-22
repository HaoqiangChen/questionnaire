<template>
  <div class="survey">
<!--    <preface :wjDetail="wjDetail" v-if="showPreFace" @showQuestionDom="showQuestionDom"></preface>-->
    <question-list v-if="questionData.length && showQuestion" :userDetail="wjDetail.userDetail" :questionData="questionData" :contentsList="contentsList" :cachePage="cachePage" @showSubmitDom="showSubmitDom" @showFontSet="showFontSet" :isFontSet="isFontSet"></question-list>
    <submit v-if="showSubmit" @showSuccessDom="showSuccessDom" @backToQuestion="backToQuestion"></submit>
    <success :action="action" v-show="showSuccess"></success>
    <font-set v-show="isFontSet"></font-set>

    <transition name="fade">
      <div class="fontset-mask" v-show="isFontSet" @click="hideFontSet"></div>
    </transition>
  </div>
</template>

<script>
import axios from 'axios'
import {getUrlParam, getBirthdayFromIdCard} from '@/common/js/util'
import {ERR_OK} from '@/common/js/global'
import preface from '@/components/preface/preface'
import questionList from '@/components/question/questionlist'
import fontSet from '@/components/fontset/fontset'

import submit from '@/components/submit/submit'
import success from '@/components/success/success'
import {getLocalAnswer, removeLocalCache} from '@/common/js/cache'

const ANSWER_KEY = `${getUrlParam('criminalfk')}-${getUrlParam('paperfk')}`

export default {
  components: {
    preface,
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
      showPreFace: false,
      showQuestion: true,
      showSubmit: false,
      showSuccess: false,

      isFontSet: false,
      cachePage: 0,
      lastPage: false,
      action: 'submit'
    }
  },
  created () {
    this.getToken()
  },
  mounted () {
  },
  methods: {
    // http://192.168.8.129:8080/?paperfk=B701AB0474BE475B8CF22E6152B9FC01&recordfk=1e304d458a6a4fdc9afe029f912308b9&criminalfk=202010231749&type=wjdc&isonline=3#/wjdc
    getToken () {
      axios.get('http://iotimc8888.goho.co:17783/sys/web/login.do?action=login&username=13712312312&password=XASR5G2454CW343C705E7141C9F793E').then((res) => {
        if (res.data.status === ERR_OK) {
          this.getWjData(res.data.token)
        } else {
          this.$weui.alert(`${res.data.message} <br/>点击确认返回。`, () => {
            this.backToApp()
          }, {
            title: '登陆接口请求失败'
          })
        }
      }).catch((err) => {
        console.log(err)
        this.$weui.alert(`${err} <br/>点击确认返回。`, () => {
          this.backToApp()
        }, {
          title: '网络问题，询问是否服务器在重启'
        })
      })
    },
    getWjData (token) {
      let loading = this.$weui.loading('问卷数据加载中...', {
        className: 'question-loading'
      })
      let ajaxUrl = 'http://iotimc8888.goho.co:17783/terminal/interview/system.do?action=getQuestions'

      axios.post(`${ajaxUrl}&authorization=${token}`, {
        data: {
          filter: {
            id: getUrlParam('paperfk'),
            recordfk: getUrlParam('recordfk'),
            test: '1'
          }
        }
      }).then((res) => {
        // console.log(res)
        if (res.data.status === ERR_OK) {
          let cache = getLocalAnswer()
          // console.log(cache)
          if (cache.length) {
            this.$weui.confirm('继续上次的问卷调查会直接跳过上次已答问题，请问是否确定', {
              title: '是否继续上次的问卷调查',
              className: 'weui-continue-dialog',
              buttons: [{
                label: '重新答题',
                type: 'default',
                onClick: () => {
                  // console.log('重新答题')
                  setTimeout(() => {
                    this.$weui.confirm('重新答题会将之前已经回答的清空，点击确认重新答题，点击取消退出该页面？', () => {
                      removeLocalCache(ANSWER_KEY)
                      this.questionData = res.data.result.rows
                      this.showPreFace = true
                    }, () => {
                      this.backToApp()
                    }, {
                      title: '是否确定重新答题'
                    })
                  }, 1000)
                }
              }, {
                label: '返回',
                type: 'default',
                onClick: () => {
                  // console.log('返回')
                  this.backToApp()
                }
              }, {
                label: '继续答题',
                type: 'primary',
                onClick: () => {
                  // console.log('继续答题')
                  this.questionData = res.data.result.rows
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
            this.questionData = res.data.result.rows
            if (!this.questionData.length) {
              this.$weui.alert('抱歉，无该问卷数据! 点击确认返回。', () => {
                this.backToApp()
              })
            }
            this.showPreFace = true
          }

          this.wjDetail = res.data.result.detail
          this.wjDetail.userDetail = res.data.result.userdetail
          if (!this.wjDetail.userDetail) this.wjDetail.userDetail = {}

          if (this.wjDetail.name === '初犯') this.wjDetail.userDetail.usertypename = '初犯'
          else if (this.wjDetail.name === '重犯') this.wjDetail.userDetail.usertypename = '重犯'
          else if (this.wjDetail.name === '刑罚执行完毕后未重新犯罪者') this.wjDetail.userDetail.usertypename = '刑罚执行完毕后未重新犯罪者'
          if (!this.wjDetail.userDetail.usertypename) {
            this.$weui.alert(`${this.wjDetail.name} <br/>点击确认返回。`, () => {
              this.backToApp()
            }, {
              title: '发生数据错误，找不到罪犯类型'
            })
          }

          if (this.wjDetail.userDetail && this.questionData.length) {
            if (this.wjDetail.userDetail.zjhm && (this.wjDetail.userDetail.zjhm.length === 15 || this.wjDetail.userDetail.zjhm.length === 18)) {
              let zfBirthday = getBirthdayFromIdCard(this.wjDetail.userDetail.zjhm)
              this.questionData.filter(_ => _.qclassify === '年龄')[0].option[0].value = zfBirthday
            }
            if (this.wjDetail.userDetail.xb) {
              let genderQuestion = this.questionData.filter(_ => _.qclassify === '性别')[0].option.filter(_ => _.label === this.wjDetail.userDetail.xb)
              if (genderQuestion && genderQuestion.length) genderQuestion[0].isChecked = true
            }
          }

          this.contentsList = res.data.result.contents
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
