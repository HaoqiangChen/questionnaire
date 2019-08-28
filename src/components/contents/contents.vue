<template>
  <aside class="contents">
    <i class="aside-overlay" @click.stop="hideContentsDom"></i>
    <transition name="slideRight">
      <div class="aside-content" v-show="showAside">
        <h1 class="nav">目录</h1>
        <scroll ref="scroll" class="catelog">
          <div>
            <div class="catelog-header">共{{chapterLen}}章{{sectionLen}}节</div>
            <ul>
              <li v-for="(group, index) in contentsList" :key="index">
                <h3 @click.stop="toggleSheet(index)">{{group.type}}、{{group.name}} <i ref="foldIcon"></i></h3>
                <transition name="fold">
                  <ol ref="catelogFold" class="catelog-fold">
                    <li v-for="(item, index) in group.secondary" :key="index" class="border-bottom"
                        @click.stop="seleceIdx(item.idx)">{{item.title}}
                    </li>
                  </ol>
                </transition>
              </li>
            </ul>
          </div>
        </scroll>
      </div>
    </transition>
  </aside>
</template>

<script>
import Scroll from '@/components/scroll/scroll'
import {prefixStyle} from '@/common/js/dom'

const transform = prefixStyle('transform')
// const transitionDuration = prefixStyle('transitionDuration')

export default {
  props: {
    contentsList: {
      type: Array,
      default () {
        return []
      }
    }
  },
  components: {
    Scroll
  },
  data () {
    return {
      showAside: false,
      chapterLen: 0,
      sectionLen: 0,
      showSheets: []
    }
  },
  created () {
    console.log(this.contentsList)
    this.chapterLen = this.contentsList.length
    this.contentsList.map(_ => {
      this.sectionLen += _.secondary.length
    })
    for (let i = 0; i < this.chapterLen; i++) {
      this.showSheets.push(false)
    }
  },
  mounted () {
    this.showAside = true
  },
  methods: {
    toggleSheet (index) {
      this.showSheets[index] = !this.showSheets[index]
      this.$refs.foldIcon[index].style[transform] = this.showSheets[index] ? 'rotate(90deg)' : 'rotate(0)'
      this.$refs.catelogFold[index].style['display'] = this.showSheets[index] ? 'block' : 'none'
      this.$refs.catelogFold[index].style['height'] = this.showSheets[index] ? 'auto' : '0'
    },
    hideContentsDom () {
      this.$emit('hideContentsDom')
    },
    seleceIdx (idx) {
      this.$emit('selectIdx', idx)
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import "~@/common/stylus/variable"
  @import "~@/common/stylus/mixin"

  .contents
    position fixed
    top 0
    bottom 0
    left 0
    right 0
    width 100%
    z-index 9

    .aside-overlay
      position absolute
      display inline-block
      width 100%
      height 100%
      background-color rgba(0, 0, 0, .6)
      z-index 10

    .aside-content
      position absolute
      background-color $color-background
      width 80%
      height 100%
      z-index 11
      transition all .5s
      transform translate3d(25%, 0, 0)

      &.slideRight-enter, &.slideRight-leave-to
        transform translate3d(125%, 0, 0)

      .nav
        height $header-height
        line-height $header-height
        font-size 18PX
        font-weight bold
        text-align center
        color $color-header-theme
        border-bottom 1px solid $color-header-theme

      .catelog
        width 100%
        height 100%
        overflow hidden

        .catelog-header
          font-size 20PX
          font-weight bold
          padding 10PX 0 10PX 16PX

        ul
          padding-bottom 80PX
          font-size 16PX
          color $color-text

          li
            h3
              position relative
              height 40PX
              line-height 40PX
              font-size 18PX
              color $color-white
              background-color $color-header-theme
              padding 0 16PX

              i
                display inline-block
                width 16PX
                height 16PX
                bg-image('fold')
                position absolute
                top 50%
                right 16PX
                margin-top -8PX

            ol.catelog-fold
              height 0
              overflow hidden
              transition height .5s ease-out

              &.fold-enter, &.fold-leave-to
                height auto
                transition height .5s ease-in

              li
                /*height 40PX*/
                /*line-height 40PX*/
                //border-bottom 1px solid $color-header-theme
                margin 0 16PX
                padding 12PX 0

                &:last-child
                  border-bottom none
</style>
