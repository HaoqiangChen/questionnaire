<template>
  <div class="answer">
    <iiw-header :headerTitle="headerTitle" :rightBtn="rightBtn" @showFontSet="showFontSet"></iiw-header>
    <answer-list :data="answerList"></answer-list>
    <!--    <record v-if="fileUrl" :fileUrl="fileUrl"></record>-->
    <div v-show="showAudit" class="iiw-footer">
      <div class="container">
        <div class="btn danger" @click="reinvestigation">重新调查</div>
        <div class="btn success" @click="audit">审核通过</div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import {getUrlParam} from '@/common/js/util'
import {DOMAIN, ERR_OK} from '@/common/js/global'
import iiwHeader from '@/components/iiw-header/iiw-header'
import answerList from '@/components/answer/answerlist'
// import record from '@/components/record/record'

export default {
  props: {
    answerList: {
      type: Array
    },
    fileUrl: {
      type: String
    }
  },
  components: {
    iiwHeader,
    answerList
    // record
  },
  data () {
    return {
      headerTitle: '问卷查看',
      rightBtn: 1,
      // 存放右侧商品每个分类高度区间
      listHeight: [],
      // 实时拿到滚动纵坐标，定义一个变量进行实时跟踪
      scrollY: 0
    }
  },
  created () {
  },
  computed: {
    showAudit () {
      if (getUrlParam('type') === 'wjsh') {
        return true
      } else {
        return false
      }
    }
  },
  methods: {
    showFontSet () {
      this.$emit('showFontSet')
    },
    reinvestigation () {
      this.$weui.confirm('重新调查会将问卷打回重新访问，请问是否确定？', () => {
        DOMAIN(domain => {
          let ajaxUrl = `${domain}/security/wjdc/scale.do?action=modTalkRecord`
          axios.post(`${ajaxUrl}&authorization=${getUrlParam('token')}&sid=${getUrlParam('sid')}`, {
            data: {
              filter: {
                id: getUrlParam('recordfk'),
                fileurl: getUrlParam('fileurl'),
                status: 'N'
              }
            }
          }).then((res) => {
            // console.log(res)
            if (res.data.status === ERR_OK) {
              this.$weui.toast('操作成功', {
                duration: 300
              })
              setTimeout(() => {
                this.backToApp()
              }, 300)
            } else {
              this.$weui.toast('操作失败，请重新提交', {
                duration: 500
              })
            }
          }).catch((err) => {
            console.log(err)
          })
        })
      }, () => {
        console.log('取消重新调查')
      }, {
        title: '是否确定重新调查'
      })
    },
    audit () {
      let loading = this.$weui.loading('提交审核中...', {
        className: 'question-loading'
      })
      DOMAIN(domain => {
        let ajaxUrl = `${domain}/security/wjdc/scale.do?action=modTalkRecord`

        axios.post(`${ajaxUrl}&authorization=${getUrlParam('token')}&sid=${getUrlParam('sid')}`, {
          data: {
            filter: {
              id: getUrlParam('recordfk'),
              fileurl: getUrlParam('fileurl')
            }
          }
        }).then((res) => {
          // console.log(res)
          loading.hide(() => {
            // console.log('`loading` has been hidden')
            this.$weui.toast('操作成功', {
              duration: 300
            })
            setTimeout(() => {
              this.$emit('showSuccessDom')
            }, 300)
          })
        }).catch((err) => {
          console.log(err)
          loading.hide(() => {
            this.$weui.toast('操作失败，请重新提交', {
              duration: 500
            })
          })
        })
      })
    },
    backToApp () {
      // console.log('关闭页面返回APP')
      window.WebViewJavascriptBridge.callHandler('question', {'action': 'finish'})
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import "~@/common/stylus/variable"
  @import "~@/common/stylus/mixin"

  .answer
    position fixed
    top 0
    bottom 0
    left 0
    right 0
    background-color $color-background

    .answer-wrapper
      height 100%
      overflow hidden

      .answer-content
        width 100%
        padding-top $header-height
        padding-bottom $footer-height

        ul li
          padding 40px 60px 0 60px

          .title
            font-size $font-size-30

  fieldset
    display block
    border none
    min-height auto

    &:first-child
      display inline-block

    .field
      clear both
      width 100%
      font-weight 400
      box-sizing border-box

      & >>> b
        font-weight bold !important

      .field-classify, .field-premise, .field-label
        position relative
        font-size $font-size-28
        word-break break-word
        line-height 35px
        padding-bottom 10px

      .field-classify, .field-premise
        font-weight bold
        margin-bottom 10px

      .field-tip
        color $color-gray
        font-size $font-size-20
        padding-bottom 30px

      .field-controlgroup
        margin 10px 0

        .field-radio
          font-size $font-size-28
          position relative
          min-height 40px
          margin-bottom 50px

          .radiowrapper
            display block
            float left

            & > input
              display none

            .radio
              display inline-block
              width 40px
              height 40px
              vertical-align middle
              cursor pointer
              bg-image('unchecked')

              &.checked
                bg-image('checked')

          .label
            display inline-block
            font-size $font-size-28
            margin-left 30px
            padding-top 5px

            .label-desc
              color $color-light-gray
              font-weight normal
              font-size $font-size-16
              margin-top 15px

            .label-desc-alert
              font-size $font-size-20
              text-decoration underline

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
