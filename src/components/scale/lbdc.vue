<template>
  <div class="scale">
    <div>
<!--      <preface :wjDetail="wjDetail" v-if="showPreFace" @showQuestionDom="showQuestionDom"></preface>-->
      <q-scale v-if="scaleData.length" v-show="showQuestion" :scaleData="scaleData" :cachePage="cachePage"
               @showSubmitDom="showSubmitDom" @showFontSet="showFontSet" :isFontSet="isFontSet"></q-scale>
      <submit v-if="showSubmit" @showSuccessDom="showSuccessDom" @backToQuestion="backToQuestion"></submit>
      <success :action="action" v-show="showSuccess"></success>
    </div>

    <font-set v-show="isFontSet"></font-set>
    <transition name="fade">
      <div class="fontset-mask" v-show="isFontSet" @click="hideFontSet"></div>
    </transition>
  </div>
</template>

<script>
import axios from 'axios'
import {getUrlParam} from '@/common/js/util'
import {ERR_OK} from '@/common/js/global'
import preface from '@/components/preface/preface'
import qScale from '@/components/question/qscale'
import fontSet from '@/components/fontset/fontset'
import submit from '@/components/submit/submit'
import success from '@/components/success/success'
import {getLocalAnswer} from '@/common/js/cache'

export default {
  components: {
    preface,
    qScale,
    fontSet,
    submit,
    success
  },
  data () {
    return {
      scaleData: [],
      wjDetail: {},
      showPreFace: false,
      showQuestion: true,
      showSubmit: false,
      showSuccess: false,
      isFontSet: false,
      lastPage: false,
      cachePage: 0,
      action: 'submit'
    }
  },
  created () {
    this.getToken()
  },
  mounted () {
  },
  methods: {
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
      let loading = this.$weui.loading('量表数据加载中...', {
        className: 'question-loading'
      })
      let ajaxUrl = 'http://iotimc8888.goho.co:17783/security/wjdc/scale.do?action=getQuestionNaireDetail'

      axios.post(`${ajaxUrl}&authorization=${token}`, {
        data: {
          filter: {
            id: getUrlParam('paperfk'),
            recordfk: getUrlParam('recordfk')
          }
        }
      }).then((res) => {
        // console.log(res)
        if (res.data.status === ERR_OK) {
          let cache = getLocalAnswer()
          if (cache.length) {
            this.$weui.confirm('继续上次的量表调查会直接跳过上次已答问题，请问是否确定', {
              title: '是否继续上次的量表调查',
              className: 'weui-continue-dialog',
              buttons: [{
                label: '重新答题',
                type: 'default',
                onClick: () => {
                  // console.log('重新答题')
                  this.scaleData = res.data.result.rows[0].question
                  this.showPreFace = true
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
                  this.scaleData = res.data.result.rows[0].question
                  this.scaleData.map(item => {
                    cache.map(_ => {
                      if (parseInt(item.idx) === parseInt(_.idx)) {
                        item.jumpback = _.jumpback
                        if (parseInt(item.type) === 1) {
                          item.option.forEach(i => {
                            i.isChecked = false
                          })
                          item.option.filter(j => j.value === _.option[0].value)[0].isChecked = true
                        } else {
                          item.option.forEach(i => {
                            _.option.forEach(j => {
                              if (i.optionfk === j.value) {
                                i.value = j.content
                              }
                            })
                          })
                        }
                      }
                    })
                  })
                  // console.log(this.scaleData)
                  this.cachePage = parseInt(cache[cache.length - 1].idx)
                  this.showQuestion = true
                }
              }]
            })
          } else {
            this.scaleData = res.data.result.rows[0].question
            if (!this.scaleData.length) {
              this.$weui.alert('抱歉，无该量表数据! 点击确认返回。', () => {
                this.backToApp()
              })
            }
            this.showPreFace = true
          }
          let detail = {
            name: res.data.result.rows[0].name,
            // usertype: res.data.result.rows[0].usertype,
            introduce: res.data.result.rows[0].introduce
          }
          this.wjDetail = detail
          this.wjDetail.userDetail = res.data.result.rows[0].userdetail

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
      console.log('关闭页面返回APP')
      window.WebViewJavascriptBridge.callHandler('question', {'action': 'finish'})
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="stylus" scoped>
  @import "~@/common/stylus/variable"
  @import "~@/common/stylus/mixin"

  .scale

    .question-content
      height 100%
      overflow hidden

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
