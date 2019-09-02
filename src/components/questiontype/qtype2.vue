<!--    题目类型二：多选题-->
<template>
  <div class="qtype2">
    <div class="field-controlgroup">
      <div class="field-checkbox" v-for="(checkbox, id) in checkBoxes" :key="id">
        <div class="checkbox-container" @click.stop="checkBox(checkbox, question.maxchoose)">
          <span class="checkboxwrapper">
          <i class="checkbox" :class="{'checked': checkbox.isChecked}"></i>
          <input type="checkbox" v-model="checkValue" :value="checkbox.value" :checked='checkbox.isChecked'
                 :name="`q${question.idx}`">
        </span>
          <div class="label" :for="`q${question.idx}_${checkbox.value}`">
            <span v-html="checkbox.label"></span>
            <div class="label-desc" v-if="checkbox.isdesc === 1" v-html="checkbox.descr"></div>
            <div class="label-desc label-desc-alert" v-if="checkbox.isdesc === 2" @click.stop="alertDialog(checkbox)">
              选项说明
            </div>
          </div>
        </div>
        <div class="field-child" v-if="showQchild(checkbox)">
          <q-child :qchild="checkbox.qchild"></q-child>
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
      checkBoxes: this.question.option,
      checkValue: [],
      checkAnswer: {},
      childAnswer: []
    }
  },
  created () {
    if (this.checkBoxes.some(_ => _.isChecked)) {
      this.checkBoxes.map(_ => {
        if (_.isChecked) this.checkValue.push(_.optionfk)
      })
    }
  },
  methods: {
    checkBox (data, maxChoose) {
      // 如果该选项互斥，先取消所有选中项
      if (data.isreject && !data.isChecked) {
        this.checkBoxes.forEach(_ => {
          _.isChecked = false
          this.checkValue = []
        })
        // 设置当前点击项切换选中
        data.isChecked = true
        this.checkValue.push(data.optionfk)
      } else if (data.isreject && data.isChecked) {
        data.isChecked = false
        this.checkValue = []
      } else {
        // 设置当前点击项切换选中
        if (this.checkBoxes.some(_ => _.isreject && _.isChecked)) return

        // 判断该题是否设置多选选项个数限制
        data.isChecked = !data.isChecked
        if (data.isChecked) {
          this.checkValue.push(data.optionfk)
        } else {
          this.checkValue.splice(this.checkValue.findIndex(_ => _ === data.optionfk), 1)
        }
        if (maxChoose && (this.checkValue.length > parseInt(maxChoose))) {
          this.$weui.topTips(`最多选择${maxChoose}个`)
          this.checkBoxes.forEach(_ => {
            if (_.optionfk === this.checkValue[0]) _.isChecked = false
          })
          this.checkValue.shift()
        }
      }
    },
    alertDialog (d) {
      this.$weui.alert(d.desc)
    },
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

    .field-checkbox
      font-size $font-size-28
      position relative
      min-height 40px
      margin-bottom 50px

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
