<template>
  <transition name="viewSlide">
    <div class="success">
      <iiw-header :headerTitle="headerTitle" :rightBtn="rightBtn"></iiw-header>
      <div class="container">
        <img src="./success.png" alt="">
        <h3 v-if="action === 'submit'">提交成功</h3>
        <h3 v-else>审核通过</h3>
        <div class="field-success" @click.stop="backToApp">返回</div>
      </div>
    </div>
  </transition>
</template>

<script>
import iiwHeader from '@/components/iiw-header/iiw-header'

export default {
  props: {
    action: {
      type: String
    }
  },
  components: {
    iiwHeader
  },
  data () {
    return {
      headerTitle: '',
      rightBtn: 0
    }
  },
  mounted () {
    if (this.action === 'submit') this.headerTitle = '提交成功'
    else this.headerTitle = '审核通过'
  },
  methods: {
    backToApp () {
      console.log('关闭页面直接返回APP')
      window.WebViewJavascriptBridge.callHandler('question', {'action': 'finish'})
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import "~@/common/stylus/variable"

  .success
    position fixed
    top 0
    left 0
    bottom 0
    right 0
    background-color $color-background
    transition all .2s linear

    &.viewSlide-enter, &.viewSlide-leave-to
      transform translate3d(100%, 0, 0)

    .container
      padding 0 30px
      padding-top $header-height
      font-size $font-size-28
      text-align center

      img
        display block
        width 50%
        margin 60px auto 30px

      h3
        margin-bottom 10px

      .field-success
        width 100%
        padding 20px 0
        font-size $font-size-22
        color $color-white
        background-color $color-header-theme
        border-radius 5px
        margin-top 60px
</style>
