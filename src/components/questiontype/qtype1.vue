<!--    题目类型一：单选题-->
<template>
  <div class="qtype1">
    <div class="field-controlgroup">
      <div class="field-radio" v-for="(radio, id) in question.option" :key="id">
        <div class="radio-container" @click.stop="Radio(radio)">
          <span class="radiowrapper">
          <i class="radio" :class="{'checked': radio.isChecked}"></i>
          <input type="radio" :value="radio.value" :checked='radio.isChecked' :name="`q${question.idx}`"
                 v-model="picked">
        </span>
          <div class="label" :for="`q${question.idx}_${id+1}`">
            <div class="label-text" v-html="radio.label"></div>
            <div class="label-desc" v-if="radio.isdesc === 1" v-html="radio.descr"></div>
            <div class="label-desc label-desc-alert" v-if="radio.isdesc === 2" @click.stop="alertDialog(radio)">选项说明
            </div>
          </div>
        </div>
        <div class="field-child" v-if="showQchild(radio)">
          <q-child :qchild="radio.qchild"></q-child>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import qChild from '@/components/questiontype/qchild'

export default {
  props: {
    question: {
      type: Object
    }
  },
  components: {
    qChild
  },
  data () {
    return {
      // radios: this.question.option,
      picked: '',
      jumpTo: 0,
      radioAnswer: {}
    }
  },
  created () {
  },
  mounted () {
  },
  methods: {
    // 单选框点击
    Radio (data) {
      // console.log(data)
      // 先取消所有选中项
      this.question.option.forEach(_ => {
        _.isChecked = false
      })
      // 再设置当前点击项选中
      this.picked = data.optionfk
      // 设置值，以供传递
      data.isChecked = true

      if (data.jumpto) this.jumpTo = data.jumpto

      if (data.isChecked && !data.child) this.$emit('radioGoNext', this.question)
    },
    // 选项说明弹出框
    alertDialog (d) {
      this.$weui.alert(d.desc)
    },
    // 子问题显示
    showQchild (data) {
      if (data.isChecked && data.child) {
        data.qchild.map(_ => {
          _.isChild = true
        })
        return true
      }
    }
  },
  watch: {}
}
</script>

<style lang="stylus">
  @import "~@/common/stylus/variable"
  @import "~@/common/stylus/mixin"

  .field-controlgroup
    margin 10px 0

    .field-radio
      font-size $font-size-28
      position relative
      min-height 40px
      margin-bottom 50px

      .radio-container
        display flex
        justify-content flex-start
        align-items center

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

</style>
