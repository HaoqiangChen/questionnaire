<template>
  <transition name="fold">
    <div class="fontset border-top">
      <div class="fontset-content">
        <div class="font-down" @click="fontDown">
          <i></i>
        </div>
        <div class="font-bar">
          <div class="font-desc">
            <small>小</small>
            <small>大</small>
          </div>
          <ul class="font-horizontal">
            <li v-for="(item, index) in fsList" :key="index" :class="{'track':currentIndex===index}"
                @click="fontSet(index)"></li>
          </ul>
        </div>
        <div class="font-up" @click="fontUp">
          <i></i>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
// 字体设置个数
const FS_NUM = 5
// 字体设置区间
const FS_SPACING = 10
// 默认字体设置索引
const FS_INDEX = FS_NUM / 2 | 0

export default {
  data () {
    return {
      fsList: new Array(FS_NUM),
      currentIndex: FS_INDEX,
      isSetSlider: false
    }
  },
  mounted () {
    setTimeout(() => {
    }, 20)
  },
  computed: {},
  methods: {
    fontUp () {
      if (this.currentIndex >= FS_NUM - 1) {
        return false
      } else {
        let app = document.getElementsByTagName('html')[0]
        let fontSize = parseFloat(app.style.fontSize) + FS_SPACING
        this.currentIndex++
        app.style.fontSize = fontSize + 'px'
      }
    },
    fontDown () {
      if (this.currentIndex <= 0) {
        return false
      } else {
        let app = document.getElementsByTagName('html')[0]
        let fontSize = parseFloat(app.style.fontSize) - FS_SPACING
        this.currentIndex--
        app.style.fontSize = fontSize + 'px'
      }
    },
    fontSet (index) {
      let newIndex = this.currentIndex - index
      this.currentIndex = index
      let app = document.getElementsByTagName('html')[0]
      app.style.fontSize = parseFloat(app.style.fontSize) - FS_SPACING * newIndex + 'px'
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import "~@/common/stylus/variable"
  @import "~@/common/stylus/mixin"

  .fontset
    position fixed
    left 0
    bottom 0
    width 100%
    background-color $color-background
    box-sizing border-box
    z-index 9
    transition all .5s
    transform translate3d(0, 0, 0)

    &.fold-enter, &.fold-leave-to
      transform translate3d(0, 100%, 0)

    .fontset-content
      display flex
      justify-content space-between
      align-items center
      background-color $color-background
      padding 30PX

      .font-down
        padding-right 5PX

        i
          display block
          width 21PX
          height 21PX
          bg-image('fontset')

      .font-up

        i
          display block
          width 37PX
          height 37PX
          bg-image('fontset')

      .font-bar
        flex: 0 0 80%
        position relative

        .font-desc
          position absolute
          top -20PX
          width 100%
          display flex
          justify-content space-between

          small
            font-size 12PX
            color #BFCDDA

        ul.font-horizontal
          position relative
          display flex
          justify-content space-between
          align-items center
          list-style-type none

          &:after
            content ''
            position absolute
            left 0
            top 50%
            width 100%
            border-top 1px solid #bfcdda
            z-index 0

          li
            position relative
            width 15PX
            height 15PX
            border-radius 50%
            background-color #bfcdda
            z-index 1

            &.track
              background-color $color-header-theme
</style>
