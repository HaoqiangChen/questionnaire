<template>
  <div class="progressbar" ref="progressBar">
    <div class="bar-inner">
      <div class="progress" ref="progress"></div>
      <div class="progress-btn-wrapper" ref="progressBtn" @touchstart.prevent="progressTouchStart"
           @touchmove.prevent="progressTouchMove" @touchend="progressTouchEnd">
        <div class="progress-btn"></div>
        <div v-show="showPage" class="progress-bubble">{{percentPage}}</div>
      </div>
    </div>
  </div>
</template>

<script>
import {prefixStyle} from '@/common/js/dom'
import {getLocalAnswer} from '@/common/js/cache'

const progressBtnWidth = 16
const transform = prefixStyle('transform')

export default {
  props: {
    currentPage: {
      type: Number,
      default: 1
    },
    totalPage: {
      type: Number,
      default: 1
    }
  },
  data () {
    return {
      maxCachePage: 0,
      showPage: false,
      percentPage: 1
    }
  },
  computed: {
    percent () {
      return this.currentPage / this.totalPage
    }
  },
  created () {
    this.touch = {}
    if (getLocalAnswer().length) this.maxCachePage = parseInt(getLocalAnswer()[getLocalAnswer().length - 1].idx)
  },
  mounted () {
    this._initPercent(this.percent)
  },
  methods: {
    progressTouchStart (e) {
      this.touch.initiated = true
      this.showPage = true
      this.touch.startX = e.touches[0].pageX
      this.touch.left = this.$refs.progress.clientWidth
      const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
      this.percentPage = this.$refs.progress.clientWidth / barWidth * this.totalPage | 0
    },
    progressTouchMove (e) {
      if (!this.touch.initiated) return
      const deltaX = e.touches[0].pageX - this.touch.startX
      const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
      const offsetWidth = Math.min(barWidth, Math.max(0, this.touch.left + deltaX))
      this._offset(offsetWidth)
      this.percentPage = offsetWidth / barWidth * this.totalPage | 0
    },
    progressTouchEnd (e) {
      this.touch.initiated = false
      this.showPage = false
      if (this.percentPage > this.maxCachePage) {
        const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
        const offsetWidth = this.maxCachePage / this.totalPage * barWidth
        this._offset(offsetWidth)
      }
      this._triggerPercent()
    },
    _initPercent (percent) {
      const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
      const offsetWidth = percent * barWidth
      this._offset(offsetWidth)
    },
    _triggerPercent () {
      const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
      const percent = this.$refs.progress.clientWidth / barWidth
      this.percentPage = this.totalPage * percent | 0
      this.$emit('percentChange', percent)
    },
    _offset (offsetWidth) {
      this.$refs.progress.style.width = `${offsetWidth}px`
      this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
    }
  },
  watch: {
    percent (newPercent) {
      if (newPercent >= 0 && !this.touch.initiated) {
        this.maxCachePage = parseInt(getLocalAnswer()[getLocalAnswer().length - 1].idx)
        // console.log(this.maxCachePage)
        this._initPercent(newPercent)
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import "~@/common/stylus/variable"

  .iiw-footer
    .progressbar
      height 30px
      z-index 1

      .bar-inner
        position relative
        top 13px
        height 3px
        background rgba(0, 0, 0, 0.3)

        .progress
          position absolute
          height 100%
          background-color $color-header-theme

        .progress-btn-wrapper
          position absolute
          left -8px
          top -13px
          width 30px
          height 30px

          .progress-btn
            position relative
            top 7px
            left 7px
            box-sizing border-box
            width 16px
            height 16px
            border 3px solid $color-header-theme
            border-radius 50%
            background-color $color-white

          .progress-bubble
            position relative
            top -38px
            left 0
            box-sizing border-box
            padding 5px 0
            //border-radius 5px
            font-size 12px
            text-align center
            color $color-white
            background-color $color-header-theme

            &:before, &:after
              content ''
              display block
              border-width 5px
              position absolute
              bottom -10px
              left 50%
              margin-left -5px
              border-style solid dashed dashed
              border-color $color-header-theme transparent transparent
              font-size 0
              line-height 0
</style>
