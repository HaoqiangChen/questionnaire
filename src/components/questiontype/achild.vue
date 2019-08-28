<template>
  <div class="achild">
    <div class="qchild-list" v-for="(child, index) in qchild" :key="index">
      <div class='field field-qchild' :type='child.type'>

        <div class='field-label' v-html="child.name"></div>
        <div v-if="child.qtip" class='field-tip'>{{child.qtip}}</div>

        <div v-if="child.type === '1'" class="field-controlgroup">
          <div class="field-radio" v-for="(radio, id) in child.option" :key="id">
          <span class="radiowrapper">
            <i class="radio" :class="{'checked': radio.isChecked}"></i>
            <input type="radio" :value="radio.value" :checked='radio.isChecked' name="" v-model="picked">
          </span>
            <div class="label" for="">{{radio.label}}</div>
          </div>
        </div>

        <div v-else-if="child.type === '2'" class="field-controlgroup">
          <div class="field-checkbox" v-for="(checkbox, id) in child.option" :key="id">
          <span class="checkboxwrapper">
            <i class="checkbox" :class="{'checked': checkbox.isChecked}"></i>
            <input type="checkbox" v-model="checkValue" :value="checkbox.value" :checked='checkbox.isChecked' name="">
          </span>
            <div class="label" for="">{{checkbox.label}}</div>
          </div>
        </div>

        <div v-else ref="fieldInput" class="field-input">
      <span v-for="(input, index) in child.option" :key="index">
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
      </span>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    qchild: {
      type: Array
    }
  },
  data () {
    return {
      picked: '',
      checkValue: []
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import "~@/common/stylus/variable"
  @import "~@/common/stylus/mixin"

  .achild
    width 100%
    margin-top 20px
    margin-left 30px

    .field-qchild
      padding 0

      .field-controlgroup
        /*display flex*/
        /*width 100%*/
        /*justify-content space-around*/
        /*flex-wrap wrap*/
        margin 10px 0

        .field-radio
          position relative
          min-height 40px
          margin-bottom 10px
          display flex
          justify-content flex-start
          align-items center
          font-size $font-size-28

          .radiowrapper
            display inline-block

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
