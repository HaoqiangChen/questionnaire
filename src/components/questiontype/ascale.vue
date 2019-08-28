<template>
  <div class="ascale">
    <div class="answer-content">
<!--      <h3 class="answer-name" v-if="answerList.length">二、作答明细</h3>-->
      <fieldset class='fieldset' v-for="(answer, qnumber) in answerList" :key="qnumber">
        <div class='field' :req='answer.ismust' :topic='answer.idx' :type='answer.type'>
          <div v-if="answer.qclassify" class='field-classify'>【{{answer.qclassify}}】</div>
          <div v-if="answer.qpremise" class='field-premise'>{{answer.qpremise}}</div>

          <div class='field-label' v-if="answer.type === '1'" v-html="` (单选) ${answer.name}`"></div>
          <div class='field-label' v-else v-html="`${answer.name}`"></div>

          <div v-if="answer.qtip" class='field-tip'>{{answer.qtip}}</div>

          <div class="field-controlgroup" v-if="answer.type === '1'">
            <div class="field-radio" v-for="(radio, id) in answer.option" :key="id">
            <span class="radiowrapper">
              <i class="radio" :class="{'checked': radio.isChecked}"></i>
              <input type="radio" :value="radio.value" :checked='radio.isChecked' :name="`q${answer.idx}`">
            </span>
              <div class="label" :for="`q${answer.idx}_${id+1}`">{{radio.label}}</div>
            </div>
          </div>

          <div ref="fieldInput" v-else class="field-input">
            <span v-for="(input, index) in answer.option" :key="index">
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
      </fieldset>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    answerList: {
      type: Array,
      default () {
        return []
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import "~@/common/stylus/variable"
  @import "~@/common/stylus/mixin"

  .answer-content
    width 100%

    .answer-name
      font-size $font-size-30
      font-weight bold

    fieldset
      display block
      border none
      padding-top 20px
      min-height auto

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
          /*display flex*/
          /*width 100%*/
          /*justify-content space-around*/
          /*flex-wrap wrap*/
          margin 10px 0

          .field-radio
            font-size $font-size-28
            position relative
            min-height 40px
            margin-bottom 10px

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
