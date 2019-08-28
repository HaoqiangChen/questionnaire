<template>
  <div class="score">
    <iiw-header :headerTitle="headerTitle" :rightBtn="rightBtn"></iiw-header>
    <scroll ref="scroll" class="score-content">
      <div class="score-wrapper">
        <div class="score-scalename">{{wjDetail.name}}</div>
        <div class="score-description">{{wjDetail.introduce}}</div>
        <div class="score-subtext" v-if="answerList.length">一、作答明细</div>
        <a-scale :answerList="answerList"></a-scale>
      </div>
    </scroll>
  </div>
</template>

<script>
import iiwHeader from '@/components/iiw-header/iiw-header'
import {getUrlParam} from '@/common/js/util'
import Scroll from '@/components/scroll/scroll'
import aScale from '@/components/questiontype/ascale'

export default {
  components: {
    iiwHeader,
    Scroll,
    aScale
  },
  data () {
    return {
      headerTitle: '量表查看',
      rightBtn: 0,
      score: {},
      wjDetail: {},
      answerList: [],
      showSuccess: false,
      action: 'audit',
      fileUrl: '',
      view: ''
    }
  },
  created () {
    this.view = getUrlParam('type')
    this.getWjData()
  },
  mounted () {
  },
  methods: {
    getWjData () {
      let loading = this.$weui.loading('量表数据加载中...', {
        className: 'question-loading'
      })
      setTimeout(() => {
        window.WebViewJavascriptBridge.callHandler('question', {'action': 'getQuestion'}, (res) => {
          let offlineData = this.wjDetail = JSON.parse(res)
          // console.log(offlineData)
          if (offlineData !== {}) {
            window.WebViewJavascriptBridge.callHandler('question', {'action': 'getQuestionResult'}, (storage) => {
              let cache = JSON.parse(storage)
              if (cache.length) {
                this.answerList = JSON.parse(offlineData.detail)
                this.answerList.map(item => {
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
              } else {
                this.$weui.alert('抱歉，无该量表数据! 点击确认返回。', () => {
                  this.backToApp()
                })
              }
            })

            loading.hide()
            // this.$weui.alert(`${this.introduce}`, () => {
            // }, {
            //   title: `${this.name} 指导语`
            // })
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
    backToApp () {
      window.WebViewJavascriptBridge.callHandler('question', {'action': 'finish'})
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import "~@/common/stylus/variable"

  .score-content
    position fixed
    top 40PX
    bottom 60PX
    width 100%

  .score-wrapper
    padding 40px 30px

    .score-scalename
      font-size $font-size-30
      font-weight bold
      text-align center

    .score-subtext
      margin 30px 0
      font-size $font-size-30
      font-weight bold

    .score-description
      margin 30px 0
      font-size $font-size-26

    table
      margin-top 40px
      width 100%
      font-size $font-size-26
      text-align center

      caption, th
        border 1px solid $color-theme
        padding 10px 0
        font-weight bold
        vertical-align middle

      td
        border 1px solid $color-theme
        padding 10px 0
        text-align center
        vertical-align middle

        &:nth-child(4)
          font-size $font-size-20
          line-height 1.5

  .iiw-footer
    position fixed
    bottom 0
    width 100%
    height 60px
    font-size $font-size-18
    background-color $color-background

    .container
      position relative
      display flex
      justify-content center
      align-items center
      font-size $font-size-16
      color $color-white
      padding 10px 0

      &:after
        display block
        position absolute
        top 0
        left 0
        width 100%
        border-top 1px solid #a4b3c1
        content ''

      .btn
        box-sizing border-box
        width 40%
        text-align center
        padding 12px 0
        border-radius 3px

        &.danger
          background-color #f00
          margin-right 8%

        &.success
          background-color #090

</style>
