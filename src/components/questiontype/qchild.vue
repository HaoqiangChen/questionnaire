<template>
  <div class="qchild">
    <div class="qchild-list" v-for="(child, index) in qchild" :key="index">
      <div class='field field-qchild' :type='child.type'>

        <div class='field-label' v-html="child.name"></div>
        <div v-if="child.qtip" class='field-tip'>{{child.qtip}}</div>

        <div v-if="child.type === '1'" class="field-controlgroup">
          <div class="field-radio" v-for="(radio, id) in child.option" :key="id"
               @click.stop="Radio(radio, child.option)">
          <span class="radiowrapper">
            <i class="radio" :class="{'checked': radio.isChecked}"></i>
            <input type="radio" :value="radio.value" :checked='radio.isChecked' name="" v-model="picked">
          </span>
            <div class="label" for="" v-html="radio.label"></div>
          </div>
        </div>

        <div v-else-if="child.type === '2'" class="field-controlgroup">
          <div class="field-checkbox" v-for="(checkbox, id) in child.option" :key="id"
               @click.stop="checkBox(checkbox)">
          <span class="checkboxwrapper">
            <i class="checkbox" :class="{'checked': checkbox.isChecked}"></i>
            <input type="checkbox" v-model="checkValue" :value="checkbox.value" :checked='checkbox.isChecked'
                   name="">
          </span>
            <div class="label" for="" v-html="checkbox.label"></div>
          </div>
        </div>

        <q-type3 v-else :question="child"></q-type3>

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
  components: {},
  data () {
    return {
      picked: '',
      checkValue: [],
      childQuestion: [],
      childAnswer: []
    }
  },
  created () {
  },
  mounted () {
  },
  methods: {
    Radio (e, data) {
      // console.log(data)
      // 先取消所有选中项
      data.forEach(_ => {
        _.isChecked = false
      })
      // 再设置当前点击项选中
      this.picked = e.optionfk
      // 设置值，以供传递
      e.isChecked = true
    },
    checkBox (data) {
      // 如果该选项互斥，先取消所有选中项
      if (data.isreject) {
        this.checkBoxes.forEach(_ => {
          _.isChecked = false
          this.checkValue = []
        })
      }
      // 设置当前点击项切换选中
      data.isChecked = !data.isChecked
      if (data.isChecked) {
        this.checkValue.push(data.optionfk)
      } else {
        this.checkValue.splice(this.checkValue.findIndex(_ => _ === data.optionfk), 1)
      }
    },
    saveChildAnswer (data) {
      data.map(item => {
        if (item.type === '1') {
          item.option.map(_ => {
            if (_.isChecked) {
              this.picked = _.optionfk
            }
          })
          if (!this.picked) this.hasAnswer = false
          else {
            this.childAnswer.push([{
              type: '1',
              value: this.picked
            }])
          }
          // this.$emit('getChildAnswer', this.picked)
        } else if (item.type === '2') {
          if (!(item.option.filter(_ => _.isChecked)).length) return false
          else {
            this.checkValue = item.option.filter(_ => _.isChecked).map(_ => _.optionfk)
            let checkbox = this.checkValue.map(_ => {
              return {
                type: '2',
                value: _
              }
            })
            if (!this.checkValue.length) this.hasAnswer = false
            else this.childAnswer = this.childAnswer.concat(checkbox)
          }
        } else {
          let input = item.option.map(_ => {
            return {
              type: '3',
              value: _.optionfk,
              content: _.value
            }
          })
          if (!(input.map(_ => _.content).every(_ => _ !== ''))) this.hasAnswer = false
          else this.childAnswer = this.childAnswer.concat(input)
        }
      })
      if (this.childAnswer.length >= data.length) this.hasAnswer = true

      let _tmp = {}
      this.childAnswer.map(_ => {
        _tmp[_.value] = _
      })
      this.childAnswer = Object.values(_tmp)

      let childAnswer = {
        hasAnswer: this.hasAnswer,
        option: this.childAnswer
      }
      this.$emit('getChildAnswer', childAnswer)
    }
  },
  watch: {}
}
</script>

<style lang="stylus" scoped>
  @import "~@/common/stylus/mixin"

  .qchild
    width 100%
    margin-top 20px
    margin-left 30px

    .field-qchild
      padding 0

      >>> .field-controlgroup
        display flex
        width 100%
        justify-content flex-start
        flex-wrap wrap

        .field-radio
          /*flex 0 0 50%*/
          margin-right 15px
          margin-bottom 20px

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
            margin-left 5px
            padding-top 5px

        .field-checkbox
          /*flex 0 0 50%*/
          margin-right 15px
          margin-bottom 20px

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
            margin-left 5px
            padding-top 5px
</style>
