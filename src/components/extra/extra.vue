<template>
  <div class="extra">
    <iiw-header :headerTitle="headerTitle" :rightBtn="rightBtn" @showFontSet="showFontSet"></iiw-header>
    <q-extra v-if="extraData.length" :extraData="extraData" @submitExtra="submitExtra"></q-extra>

    <font-set v-show="isFontSet"></font-set>
    <transition name="fade">
      <div class="fontset-mask" v-show="isFontSet" @click="hideFontSet"></div>
    </transition>
  </div>
</template>

<script>
import fontSet from '@/components/fontset/fontset'
import iiwHeader from '@/components/iiw-header/iiw-header'
import qExtra from '@/components/question/qextra'

export default {
  components: {
    fontSet,
    iiwHeader,
    qExtra
  },
  data () {
    return {
      headerTitle: '附加量表选择',
      rightBtn: 1,
      extraData: [],
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
      let loading = this.$weui.loading('附加量表题项加载中...', {
        className: 'question-loading'
      })
      setTimeout(() => {
        window.WebViewJavascriptBridge.callHandler('question', {'action': 'getQuestion'}, (res) => {
          let offlineData = JSON.parse(res)
          if (offlineData !== {}) {
            this.extraData = offlineData.result.rows
            loading.hide()
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
    submitExtra (data) {
      this.$weui.confirm('是否提交所选题项，请问是否确定', () => {
        let loading = this.$weui.loading('提交中...', {
          className: 'question-loading'
        })
        window.WebViewJavascriptBridge.callHandler('question', {'action': 'submit', 'value': data}, (res) => {
          if (JSON.parse(res) === 0) {
            loading.hide(() => {
              this.$weui.toast('操作成功', {
                duration: 300
              })
            })
          } else {
            loading.hide(() => {
              console.log(JSON.parse(res))
              this.$weui.toast('操作失败，请重新提交', {
                duration: 1000
              })
            })
          }
        })
      }, () => {
        console.log('取消提交')
      }, {
        title: '是否提交附加量表题项选择'
      })
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

<style lang="stylus" scoped>
  @import "~@/common/stylus/variable"

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
