<!--    题目类型一：单选题-->
<template>
  <div class="atype1">
    <div class="field-controlgroup">
      <div class="field-radio" v-for="(radio, id) in radios" :key="id">
        <div class="radio-container">
          <span class="radiowrapper">
          <i class="radio" :class="{'checked': radio.isChecked}"></i>
          <input type="radio" :value="radio.value" :checked='radio.isChecked' :name="`q${answer.idx}`"
                 v-model="picked">
        </span>
          <div class="label" :for="`q${answer.idx}_${id+1}`"><span v-html="radio.label"></span>
            <div class="label-desc" v-if="radio.isdesc === 1" v-html="radio.descr"></div>
            <div class="label-desc label-desc-alert" v-if="radio.isdesc === 2" @click.stop="alertDialog(radio)">选项说明
            </div>
          </div>
        </div>
        <div class="field-child" v-if="showQchild(radio)">
          <a-child :qchild="radio.qchild"></a-child>
        </div>
      </div>
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
      radios: this.answer.option,
      picked: ''
    }
  },
  created () {
  },
  methods: {
    // 选项说明弹出框
    alertDialog (d) {
      this.$weui.alert(d.desc)
    },
    // 子问题显示
    showQchild (data) {
      if (data.isChecked && data.child) {
        return true
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import "~@/common/stylus/variable"
  @import "~@/common/stylus/mixin"

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

</style>
