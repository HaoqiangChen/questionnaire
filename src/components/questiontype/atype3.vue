<!--    题目类型三：填空题-->
<template>
  <div class="atype3" id="atype3">
    <div ref="fieldInput" class="field-input">
      <span v-for="(input, index) in inputs" :key="index">
        {{input.prefix}}
        <!-- 多行文本框 -->
        <div class="field-textarea" v-if="input.type === '0'">
          <span class="input-text">{{input.value}}</span>
        </div>
        <!-- 属性验证，单行文本框，4-手机号 -->
        <div v-else-if="input.type === '4'" class="special">
          <i class="icon icon-phone"></i>
          <input type="tel" v-model="input.value" disabled="disabled">
        </div>
        <!-- 属性验证，单行文本框，5-邮箱 -->
        <div v-else-if="input.type === '5'" class="special">
          <i class="icon icon-email"></i>
          <input type="email" v-model="input.value" disabled="disabled">
        </div>
        <!-- 属性验证，单行文本框，6-时间选择控件 -->
        <div v-else-if="input.type === '6'" class="special">
          <i class="icon icon-date"></i>
          <input type="text" v-model="input.value" disabled="disabled">
        </div>
        <!-- 属性验证，单行文本框，1-无属性 2-整数 3-百分数 -->
        <span v-else class="input-text">{{input.value}}</span>
        {{input.suffix}}
        <div class="field-child" v-if="showQchild(input)">
          <a-child :qchild="input.qchild"></a-child>
        </div>
      </span>
    </div>
  </div>
</template>

<script>
import aChild from '@/components/questiontype/achild'

export default {
  props: {
    answer: {
      type: Object
    }
  },
  components: {
    aChild
  },
  data () {
    return {
      inputs: this.answer.option
    }
  },
  methods: {
    initWidth (data) {
      console.log(data)
      if (!(data.prefix || data.suffix)) return '100%'
    },
    showQchild (data) {
      if (data.child) {
        data.qchild.map(_ => {
          _.isChild = true
        })
        return true
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import "~@/common/stylus/variable"
  @import "~@/common/stylus/mixin"

  .field-input
    font-size $font-size-28
    line-height 1.5

    .field-aside
      display inline-block

    input
      display inline-block
      border 1px solid $color-border
      border-radius 4px
      box-sizing border-box
      padding 10px
      font-size $font-size-24
      text-align center
      background-color #fff
      margin 10px 0

      &.underline
        border none
        border-bottom 1px solid $color-theme
        border-radius inherit

    .special
      position relative

      i.icon
        width 25px
        height 25px
        position absolute
        top 25px
        left 10px

        &.icon-date
          bg-image('date')

        &.icon-phone
          bg-image('phone')

        &.icon-email
          bg-image('email')

      & > input
        width 100%
        font-size $font-size-24
        text-align left
        padding-left 45px
        margin 10px 0

  .field-textarea
    position relative

    textarea
      resize none
      color $color-text
      font-size $font-size-24
      padding 10px
      box-sizing border-box
      width 100%
      min-height 200px
      background-color #fff
      border-radius 4px
      border solid 1px $color-border

    .field-corner
      position absolute
      right 10px
      bottom 10px
      font-size $font-size-16

  .input-text
    padding 5px 15px 3px
    margin 0 5px
    border-bottom 1px solid $color-theme
</style>
