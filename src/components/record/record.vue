<template>
  <div class="record" ref="record" @touchstart="touchStart" @touchmove="touchMove" @touchend="touchEnd">
    <div class="btn" :class="disableCls" @click.stop="togglePlaying">
      <i :class="playIcon"></i>
    </div>
    <audio ref="audio" :src="fileUrl" @canplay="ready"></audio>
  </div>
</template>

<script>
export default {
  props: {
    fileUrl: {
      type: String
    }
  },
  data () {
    return {
      songReady: false,
      playing: false,
      flags: false,
      position: {x: 0, y: 0},
      nx: '',
      ny: '',
      dx: '',
      dy: '',
      xPum: '',
      yPum: ''
    }
  },
  computed: {
    playIcon () {
      return this.playing ? 'icon-pause' : 'icon-play'
    },
    disableCls () {
      return this.songReady ? '' : 'disable'
    }
  },
  created () {
    console.log(this.fileUrl)
  },
  methods: {
    ready () {
      this.songReady = true
    },
    error () {
      this.$weui.topTips('录音文件加载失败，请查看网络状况~')
      this.songReady = true
    },
    end () {
      console.log('end')
      // this.songReady = false
    },
    togglePlaying () {
      if (!this.songReady) {
        this.$weui.topTips('录音文件仍在加载中，请稍后点击收听~')
        return false
      }
      this.playing = !this.playing
    },
    // 实现移动端拖拽
    touchStart (event) {
      this.flags = true
      let touch
      if (event.touches) {
        touch = event.touches[0]
      } else {
        touch = event
      }
      this.position.x = touch.clientX
      this.position.y = touch.clientY
      this.dx = this.$refs.record.offsetLeft
      this.dy = this.$refs.record.offsetTop
    },
    touchMove (event) {
      if (this.flags) {
        let touch
        if (event.touches) {
          touch = event.touches[0]
        } else {
          touch = event
        }
        this.nx = touch.clientX - this.position.x
        this.ny = touch.clientY - this.position.y
        this.xPum = this.dx + this.nx
        this.yPum = this.dy + this.ny
        this.$refs.record.style.left = this.xPum + 'px'
        this.$refs.record.style.top = this.yPum + 'px'
        // 阻止页面的滑动默认事件
        document.addEventListener('touchmove', function () {
          event.preventDefault()
        }, false)
      }
    },
    touchEnd () {
      this.flags = false
    }
  },
  watch: {
    playing (newPlaying) {
      const audio = this.$refs.audio
      this.$nextTick(() => {
        newPlaying ? console.log('播放') : console.log('停止')
        newPlaying ? audio.play() : audio.pause()
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import "~@/common/stylus/variable"

  .record
    position fixed
    right 5%
    bottom 10%
    touch-action none

    .btn
      position relative
      width 65px
      height 65px
      border-radius 50%
      background-color #00DFC5

      .icon-play
        position absolute
        top 50%
        left 50%
        display block
        width 0
        height 0
        border-top 15px solid transparent
        border-left 20px solid #0d0d0d
        border-bottom 15px solid transparent
        margin-top -20px
        margin-left -10px

      .icon-pause
        position absolute
        top 50%
        left 50%
        display block
        width 30px
        height 30px
        background-color #0d0d0d
        margin-top -15px
        margin-left -15px

      &.disable
        background-color rgba(0, 223, 197, .5)

        .icon-play
          border-left 20px solid rgba(0, 0, 0, .5)
</style>
