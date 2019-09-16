<!--    题目类型三：填空题-->
<template>
  <div class="qtype3" id="qtype3">
    <div ref="fieldInput" class="field-input">
      <span v-for="(input, index) in question.option" :key="index">
        {{input.prefix}}
        <!-- 多行文本框 -->
        <div class="field-textarea" v-if="input.type === '0'">
          <textarea ref="fieldText" v-model="input.value" @input="textareaOnchange($event, input)"
                    @blur="blurOnchange($event, input)"></textarea>
          <div class="field-corner" v-if="input.maxwords">{{inputCorner}}/{{input.maxwords}}</div>
        </div>
        <!-- 属性验证，单行文本框，4-手机号 -->
        <div v-else-if="input.type === '4'" class="special">
          <i class="icon icon-phone"></i>
          <input :type="inputType(input.type)" v-model="input.value" placeholder="请输入11位手机号"
                 @blur="blurOnchange($event, input)">
        </div>
        <!-- 属性验证，单行文本框，5-邮箱 -->
        <div v-else-if="input.type === '5'" class="special">
          <i class="icon icon-email"></i>
          <input :type="inputType(input.type)" v-model="input.value" placeholder="" @blur="blurOnchange($event, input)">
        </div>
        <!-- 属性验证，单行文本框，6-时间选择控件 -->
        <div v-else-if="input.type === '6'" class="special">
          <i class="icon icon-date"></i>
          <input :type="inputType(input.type)" v-model="input.value" placeholder="" @click.stop="datePicker(input)"
                 readonly='readonly'>
        </div>
        <!-- 属性验证，单行文本框，1-无属性 2-整数 3-百分数 -->
        <input ref="inputText" v-else :type="inputType(input.type)" v-model="input.value"
               @input="inputOnchange($event, input)"
               @blur="blurOnchange($event, input)" :class="{'underline': input.prefix || input.suffix}"
               :style="{width:initWidth(input.prefix, input.suffix)}" @click="inputClick($event)">
        {{input.suffix}}
        <div class="field-child" v-if="showQchild(input)">
          <q-child :qchild="input.qchild"></q-child>
        </div>
      </span>
    </div>
  </div>
</template>

<script>
import qChild from '@/components/questiontype/qchild'
import {inputOption, weuiOption} from '@/common/js/global'
import {addClass, removeClass} from '@/common/js/dom'
import {inputReg} from '@/common/js/reg'
import {weuiFormatTime} from '@/common/js/util'

const defaultWidth = inputOption.defaultWidth
const warmDuration = weuiOption.warmDuration

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
      inputs: this.question.option,
      screenWidth: document.body.clientWidth, // 屏幕宽度
      screenHeight: document.documentElement.clientHeight, // 屏幕高度
      inputCorner: 0,
      inputAnswer: {},
      inputChildAnswer: ''
    }
  },
  created () {
  },
  mounted () {
    window.onresize = () => {
      return (() => {
        window.screenWidth = document.body.clientWidth
        this.screenWidth = window.screenWidth
      })()
    }
  },
  updated () {
  },
  computed: {},
  methods: {
    inputType (type) {
      if (type === '2' || type === '3') {
        return 'number'
      } else if (type === '4') {
        return 'tel'
      } else if (type === '5') {
        return 'email'
      } else {
        return 'text'
      }
    },
    initWidth (a, b) {
      if (a || b) {
        return `${defaultWidth}px`
      } else {
        return '100%'
      }
    },
    inputClick (e) {
      // this.$refs.inputText[0].scrollIntoView()
      if (e.clientY > this.screenHeight / 2) {
        setTimeout(() => {
          this.$refs.inputText[0].scrollIntoView(false)
        }, 1000)
      }
    },
    inputOnchange (e, data) {
      let inputLen = e.target.value.length
      let inputWidth = inputLen * 20 > defaultWidth ? inputLen * 20 : defaultWidth

      if (inputWidth > parseInt(this.screenWidth) - 60) {
        e.target.style['width'] = '100%'
        removeClass(e.target, 'underline')
      } else {
        e.target.style.width = inputWidth + 'px'
        addClass(e.target, 'underline')
      }

      if (inputLen > data.maxwords && data.maxwords) {
        data.value = e.target.value.slice(0, parseInt(data.maxwords))
        this.$weui.topTips(`至多输入${data.maxwords}个字符`, {
          duration: warmDuration
        })
      }
    },
    blurOnchange (e, data) {
      let inputLen = e.target.value.length

      if (inputLen < data.minwords && data.minwords) {
        this.$weui.topTips(`至少输入${data.minwords}个字符`, {
          duration: warmDuration,
          callback: function callback () {
            e.target.focus()
          }
        })
      }
      if (data.maxnumber && parseInt(e.target.value) > parseInt(data.maxnumber)) {
        data.value = ''
        this.$weui.topTips(`输入数不能大于${data.maxnumber}`, {
          duration: warmDuration
        })
      }

      if (data.type === '2' && inputReg.isInt(e.target.value)) {
        this.$weui.topTips('只能输入整数')
        // data.value = e.target.value.replace(/[^\d]/g, '')
        data.value = e.target.value.substr(0, e.target.value.search(/[^\d]/g))
      } else if (data.type === '3' && !inputReg.isPercent(e.target.value)) {
        this.$weui.topTips('请输入0-100的百分数，最多保留3位小数')
        // data.value = e.target.value.substr(0, e.target.value.indexOf('.') + 4)
        data.value = ''
      } else if (data.type === '4' && !inputReg.isPhone(e.target.value)) {
        this.$weui.topTips('请输入正确的手机号')
      } else if (data.type === '5' && !inputReg.isEmail(e.target.value)) {
        this.$weui.topTips('请输入正确格式的邮件地址')
      } else if (data.type === '7' && !inputReg.isFloor(e.target.value)) {
        this.$weui.topTips('只能输入有且仅保留两位小数(不包括整数)')
        data.value = e.target.value.substr(0, e.target.value.indexOf('.') + 3)
      } else if (inputReg.isEmoji(e.target.value)) {
        this.$weui.topTips('不能输入表情等特殊字符')
        data.value = ''
      }
    },
    textareaOnchange (e, data) {
      let inputLen = e.target.value.length
      if (inputLen > data.maxwords) {
        this.$weui.topTips(`至多输入${data.maxwords}个字符`, {
          duration: warmDuration
        })
        data.value = e.target.value.slice(0, data.maxwords)
        this.inputCorner = `${data.maxwords}`
      } else {
        this.inputCorner = `${inputLen}`
      }
    },
    showQchild (data) {
      if (data.child) {
        data.qchild.map(_ => {
          _.isChild = true
        })
        return true
      }
    },
    datePicker (data) {
      this.$weui.datePicker({
        start: weuiOption.dateStart,
        end: weuiOption.dateEnd,
        cron: '* * *',
        defaultValue: [1980, 6, 15],
        depth: data.format,
        onChange: function onChange (date) {
          data.value = weuiFormatTime(date, this.depth)
        },
        onConfirm: function onConfirm (date) {
          data.value = weuiFormatTime(date, this.depth)
        }
      })
    }
  },
  watch: {}
}
</script>

<style lang="stylus">
  @import "~@/common/stylus/variable"
  @import "~@/common/stylus/mixin"

  .field-input
    font-size $font-size-28

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
</style>
