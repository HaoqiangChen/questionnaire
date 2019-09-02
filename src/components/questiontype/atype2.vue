<!--    题目类型二：多选题-->
<template>
  <div class="atype2">
    <div class="field-controlgroup">
      <div class="field-checkbox" v-for="(checkbox, id) in checkBoxes" :key="id">
        <div class="checkbox-container">
          <span class="checkboxwrapper">
          <i class="checkbox" :class="{'checked': checkbox.isChecked}"></i>
          <input type="checkbox" v-model="checkValue" :value="checkbox.value" :checked='checkbox.isChecked'
                 :name="`q${answer.idx}`">
        </span>
          <div class="label" :for="`q${answer.idx}_${checkbox.value}`">
            <span v-html="checkbox.label"></span>
            <div class="label-desc" v-if="checkbox.isdesc === 1" v-html="checkbox.descr"></div>
            <div class="label-desc label-desc-alert" v-if="checkbox.isdesc === 2" @click.stop="alertDialog(checkbox)">
              选项说明
            </div>
          </div>
        </div>
        <div class="field-child" v-if="showQchild(checkbox)">
          <a-child :qchild="checkbox.qchild"></a-child>
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
      checkBoxes: this.answer.option,
      checkValue: [],
      checkAnswer: {}
    }
  },
  methods: {
    alertDialog (d) {
      this.$weui.alert(d.desc)
    },
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
    margin 10px 0

    .field-checkbox
      font-size $font-size-28
      position relative
      min-height 40px
      margin-bottom 10px

      .checkbox-container
        display flex
        justify-content flex-start
        align-items center

      .checkboxwrapper
        display inline-block

        & > input
          display none

        .checkbox
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
        padding-top 8px

        .label-desc
          color $color-light-gray
          font-weight normal
          font-size $font-size-16
          margin-top 15px

        .label-desc-alert
          font-size $font-size-20
          text-decoration underline

</style>
