<template>
  <div class="scale">
    <div>
      <!--      <preface :wjDetail="wjDetail" v-if="showPreFace" @showQuestionDom="showQuestionDom"></preface>-->
      <q-scale v-if="scaleData.length" v-show="showQuestion" :scaleData="scaleData" :cachePage="cachePage"
               @showSubmitDom="showSubmitDom" @showFontSet="showFontSet"></q-scale>
      <submit v-if="showSubmit" @showSuccessDom="showSuccessDom" @backToQuestion="backToQuestion"
              :scaleData="scaleData"></submit>
      <success :action="action" v-show="showSuccess"></success>
    </div>

    <font-set v-show="isFontSet"></font-set>
    <transition name="fade">
      <div class="fontset-mask" v-show="isFontSet" @click="hideFontSet"></div>
    </transition>
  </div>
</template>

<script>
import qScale from '@/components/question/qscale'
import fontSet from '@/components/fontset/fontset'
import submit from '@/components/submit/submit'
import success from '@/components/success/success'
import {getLocalAnswer} from '@/common/js/cache'

export default {
  components: {
    qScale,
    fontSet,
    submit,
    success
  },
  data () {
    return {
      scaleData: [],
      wjDetail: {},
      name: '',
      introduce: '',
      showPreFace: false,
      showQuestion: false,
      showSubmit: false,
      showSuccess: false,
      isFontSet: false,
      lastPage: false,
      cachePage: 0,
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
      let loading = this.$weui.loading('量表数据加载中...', {
        className: 'question-loading'
      })
      setTimeout(() => {
        window.WebViewJavascriptBridge.callHandler('question', {'action': 'getQuestion'}, (res) => {
          let offlineData = JSON.parse(res)
          // console.log(offlineData)
          if (offlineData !== {}) {
            let cache = getLocalAnswer()
            if (cache.length) {
              this.$weui.confirm('继续上次的量表调查会直接跳过上次已答问题，请问是否确定', {
                title: '是否继续上次的量表调查',
                className: 'weui-continue-dialog',
                buttons: [ {
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
                    this.scaleData = JSON.parse(offlineData.detail)
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
              this.scaleData = JSON.parse(offlineData.detail)
              if (!this.scaleData.length) {
                this.$weui.alert('抱歉，无该量表数据! 点击确认返回。', () => {
                  this.backToApp()
                })
              }
              this.showQuestion = true
            }

            this.name = offlineData.name
            this.introduce = offlineData.introduce
            loading.hide()
            this.$weui.alert(`${this.introduce}`, () => {
              // console.log('ok')
            }, {
              title: `${this.name} 指导语`
            })
          } else {
            loading.hide(() => {
              this.$weui.alert(`请求不到该量表数据，有可能前面缓存失败，请重新缓存 <br/>点击确认返回。`, () => {
                this.backToApp()
              }, {
                title: '请求失败'
              })
            })
          }
        })
      }, 1500)
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
      // console.log('关闭页面返回APP')
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
