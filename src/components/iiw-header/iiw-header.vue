<template>
  <div class="iiw-header">
    <div class="back" @click="back">
      <span>返回</span>
    </div>
    <h1 class="title">{{headerTitle}}</h1>
    <div class="right">
      <span class="icon-font" v-if="rightBtn === 1" @click="toggleFontSet"></span>
      <span class="submit" v-else-if="rightBtn === 2" @click="submit">提交</span>
      <span class="empty" v-else></span>
    </div>
  </div>
</template>

<script>
import {getUrlParam} from '@/common/js/util'

export default {
  props: {
    headerTitle: {
      type: String,
      default: '访谈问卷App'
    },
    showFontSet: {
      type: Boolean
    },
    // 右边按钮
    rightBtn: {
      type: Number
    }
  },
  data () {
    return {
      view: ''
    }
  },
  created () {
    this.view = getUrlParam('type')
  },
  methods: {
    back () {
      if ((this.view === 'wjdc' || this.view === 'lbdc') && this.rightBtn === 1) {
        this.$weui.confirm('当前问卷尚未答完，是否确定返回？', () => {
          console.log('退出页面返回APP')
          this.backToApp()
        }, function () {
          // console.log('no')
        }, {
          title: '是否返回'
        })
      } else if ((this.view === 'wjdc' || this.view === 'lbdc') && this.rightBtn === 2) {
        this.$weui.confirm('当前问卷尚未提交，是否确定返回？', () => {
          console.log('关闭问卷提交返回答题页面')
          this.$emit('backToQuestion')
        }, function () {
          // console.log('no')
        }, {
          title: '是否返回'
        })
      } else {
        console.log('关闭页面直接返回APP')
        this.backToApp()
      }
    },
    toggleFontSet () {
      this.$emit('showFontSet')
    },
    backToApp () {
      window.WebViewJavascriptBridge.callHandler('question', {'action': 'finish'})
    },
    submit () {
      this.$emit('submit')
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import "~@/common/stylus/variable"
  @import "~@/common/stylus/mixin"

  .iiw-header
    position fixed
    top 0
    left 0
    width 100%
    height $header-height
    display flex
    justify-content space-between
    text-align center
    background $color-header-theme
    color $color-white
    font-size 0
    z-index 9

    .back
      line-height $header-height
      font-size $font-size-18
      color $color-white

      span
        padding 0 10px 0 20px

    .title
      vertical-align top
      line-height $header-height
      font-size $font-size-18

    .right
      line-height $header-height
      font-size $font-size-18
      color $color-white

      .icon-font
        display block
        width 30px
        height 30px
        margin-top 10px
        margin-right 15px
        bg-image('font')

      .submit
        padding 0 20px 0 10px

      .empty
        display inline-block
        width 50px
</style>
