<!--    题目类型四：下拉题-->
<template>
  <div class="qtype4">
    <div class="field-select">
      <div class="text" @click.stop="picker(select)">{{selectValue}}</div>
      <i class="icon icon-dropdown"></i>
    </div>
  </div>
</template>

<script>
// import qChild from '@/components/questiontype/qchild'

export default {
  props: {
    question: {
      type: Object
    }
  },
  components: {
    // qChild
  },
  data () {
    return {
      select: this.question.option,
      picked: '',
      jumpTo: 0,
      selectIndex: 0,
      selectValue: ''
    }
  },
  created () {
    if (this.select.filter(_ => _.isChecked).length) {
      this.selectValue = this.select.filter(_ => _.isChecked)[0].label
      this.selectIndex = this.select.filter(_ => _.isChecked)[0].value
    }
  },
  mounted () {
  },
  methods: {
    // 下拉框点击
    picker (data) {
      // console.log(data)
      this.$weui.picker(this.select, {
        defaultValue: [this.selectIndex],
        onChange: (res) => {
          // console.log(res)
        },
        onConfirm: (res) => {
          data.forEach(_ => {
            _.isChecked = false
          })
          this.selectValue = res[0].label
          this.selectIndex = res[0].value
          data[this.selectIndex].isChecked = true
        },
        id: 'picker'
      })
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

  .field-select
    position relative
    font-size $font-size-28

    .text
      display inline-block
      width 100%
      min-height 55px
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

      & + i.icon
        width 25px
        height 25px
        position absolute
        top 25px
        right 10px

        &.icon-dropdown
          bg-image('dropdown')

</style>
