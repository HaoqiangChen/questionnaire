<template>
  <div class="qscale">
    <iiw-header :headerTitle="headerTitle" :rightBtn="rightBtn" @showFontSet="showFontSet"></iiw-header>
    <scroll ref="scroll" class="qscale-wrapper">
      <div class="qscale-slider" ref="questionSlider">
        <transition name="touchMove">
          <fieldset v-if="question.show" ref="fieldset" class='fieldset' v-for="(question, qnumber) in questionList"
                    :key="qnumber" @touchstart="touchStart"
                    @touchmove='touchMove($event, question)' @touchend='touchEnd($event, question)'>
            <div class='field' :req='question.ismust' :topic='question.idx' :type='question.type'>
              <div v-if="question.qclassify" class='field-classify'>【{{question.qclassify}}】</div>
              <div v-if="question.qpremise" class='field-premise'>{{question.qpremise}}</div>

              <div class='field-label' v-if="question.type === '1'" v-html="`(单选) ${question.name}`"></div>
              <div class='field-label' v-else v-html="`${question.name}`"></div>

              <div v-if="question.qtip" class='field-tip'>{{question.qtip}}</div>

              <div class="field-controlgroup" v-if="question.type === '1'">
                <div class="field-radio" v-for="(radio, id) in question.option" :key="id"
                     @click.stop="Radio(radio, question)">
        <span class="radiowrapper">
          <i class="radio" :class="{'checked': radio.isChecked}"></i>
          <input type="radio" :value="radio.value" :checked='radio.isChecked' :name="`q${question.qnumber}`"
                 v-model="picked">
        </span>
                  <div class="label" :for="`q${question.qnumber}_${id+1}`">{{radio.label}}</div>
                </div>
              </div>

              <q-type3 v-else :question="question"></q-type3>

              <div v-show="parseInt(question.idx) === cachePage" class="field-finger">
                <div class="left">
                  <img src="../question/right.png" alt="">
                  <div class="tip">向右滑动 上一题</div>
                </div>
                <div class="right">
                  <img src="../question/left.png" alt="">
                  <div class="tip">向左滑动 下一题</div>
                </div>
              </div>
            </div>
          </fieldset>
        </transition>
      </div>
    </scroll>
    <div class="iiw-footer">
      <progress-bar :currentPage="currentPage" :totalPage="totalPage"
                    @percentChange="onProgressBarChange"></progress-bar>
      <div class="container">
        <timer v-if="showTimer"></timer>
        <div class="finish">
          <i></i><span>{{currentPage}}</span>
        </div>
        <div class="unfinish">
          <i></i><span>{{totalPage - currentPage}}</span>
        </div>
        <div class="page">
          <span>{{currentPage}}</span>/<span>{{totalPage}}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import iiwHeader from '@/components/iiw-header/iiw-header'
import Scroll from '@/components/scroll/scroll'
import Timer from '@/components/timer/timer'
import progressBar from '@/components/progressbar/progressbar'
import {autoDuration, weuiOption} from '@/common/js/global'
import {addClass, removeClass} from '@/common/js/dom'
import {getLocalAnswer, setLocalAnswer} from '@/common/js/cache'

// 定义滑动距离百分比，如果为10说明只有滑动大于（100/10）距离才触发
const touchPercent = 15
const warmDuration = weuiOption.warmDuration

export default {
  props: {
    scaleData: {
      type: Array
    },
    cachePage: {
      type: Number
    },
    isFontSet: {
      type: Boolean
    }
  },
  components: {
    Scroll,
    iiwHeader,
    progressBar,
    Timer
  },
  data () {
    return {
      headerTitle: '量表调查',
      rightBtn: 1,
      questionList: this.scaleData,
      picked: '',
      jumpTo: 0,
      radioAnswer: {},
      // 题目是否已答
      hasAnswer: false,
      answer: [],
      showTimer: true,
      currentPage: 1,
      totalPage: 1,
      // 上一题
      prevQuestion: 0,
      // 当前题目
      nowQuestion: 1,
      // 下一题
      nextQuestion: 0,
      answerIdx: []
    }
  },
  created () {
    this.touch = {}
    this.totalPage = this.questionList.length

    if (this.cachePage) {
      this._showQuestionIndex(this.cachePage, true)
      this.currentPage = this.cachePage
    } else {
      this._showQuestionIndex(1, true)
    }

    if (getLocalAnswer().length) {
      this.answerIdx = getLocalAnswer().map(_ => parseInt(_.idx))
    }
  },
  mounted () {
  },
  computed: {
    percent () {
      return this.currentPage / this.totalPage
    }
  },
  methods: {
    // 单选框点击
    Radio (e, data) {
      // console.log(data)
      // 先取消所有选中项
      data.option.forEach(_ => {
        _.isChecked = false
      })
      // 再设置当前点击项选中
      this.picked = e.value
      // 设置值，以供传递
      e.isChecked = true

      setTimeout(() => {
        this.goNextPage(data)
      }, autoDuration)
    },
    showFontSet () {
      this.$emit('showFontSet')
    },
    isAnswer (data) {
      if (parseInt(data.type) === 1) {
        this.hasAnswer = data.option.some(_ => _.isChecked)
      } else {
        this.hasAnswer = data.option.every(_ => _.value !== '')
      }
    },
    touchStart (e) {
      this.touch.initiated = true
      // 用来判断是否是一次移动
      this.touch.moved = false
      // 获取第一个手指
      const touch = e.touches[0]
      // 记录 x y 坐标
      this.touch.startX = touch.pageX
      this.touch.startY = touch.pageY
    },
    touchMove (e, data) {
      if (!this.touch.initiated) {
        return
      }
      const touch = e.touches[0]
      // x y 偏移
      const slideWidth = this.$refs.questionSlider.offsetWidth
      const deltaX = touch.pageX - this.touch.startX
      const deltaY = touch.pageY - this.touch.startY
      // y轴偏移大于x轴偏移什么都不做
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        return
      }
      if (!this.touch.moved) {
        this.touch.moved = true
      }
      // 只有滑动大于10%距离才触发
      if (Math.abs(deltaX) > (slideWidth / touchPercent)) {
        if (deltaX < 0) {
          this.showNextPage(data)
        } else {
          this.showPrevPage(data)
        }
      }
    },
    touchEnd (e, data) {
      // console.log(data)
      if (!this.touch.moved) {
        return
      }
      const slideWidth = this.$refs.questionSlider.offsetWidth
      const endX = e.changedTouches[0].clientX
      const disX = endX - this.touch.startX
      // 只有滑动大于10%距离才触发
      if (Math.abs(disX) > (slideWidth / touchPercent)) {
        if (disX < 0) {
          this.goNextPage(data)
        } else {
          this.goPrevPage(data)
        }
      }
    },
    // 手指滑动未松手时，到下一题的交互效果
    showNextPage (data) {
      this.isAnswer(data)
      // 该题未回答提示并跳出
      if (!this.hasAnswer) {
        this.$weui.topTips(`请答完题后翻页`, {duration: warmDuration})
      }
      if (this.lastPage) return false
    },
    // 手指滑动松手后跳到下一题
    goNextPage (data) {
      // console.log(data) // 为当前页问题数据
      this.isAnswer(data)
      if (!this.hasAnswer) return
      // 该题已回答
      this.nowQuestion = parseInt(data.idx)
      this.nextQuestion = this.nowQuestion + 1

      if (this.nowQuestion < this.questionList[this.questionList.length - 1].idx) {
        this.questionList.filter(_ => parseInt(_.idx) === this.nextQuestion)[0].jumpback = this.nowQuestion
        this.currentPage = this.nextQuestion
        removeClass(this.$refs.fieldset[0], 'fieldset-hook')
        this._hideQuestionIndex(this.nowQuestion)
        this._showQuestionIndex(this.nextQuestion)
      } else {
        this.showTimer = false
        this.$emit('showSubmitDom')
      }
      this.saveAnswer(data)
      this.answerIdx.push(parseInt(data.idx))
    },
    // 手指滑动未松手时，到上一题的交互效果
    showPrevPage (data) {
      // 第一题无上一页跳出
      if (parseInt(data.idx) === 1) return false
    },
    // 手指滑动松手后跳回上一题
    goPrevPage (data) {
      if (parseInt(data.idx) === 1) return
      if (!data.jumpback) {
        return
      } else {
        this.prevQuestion = parseInt(data.jumpback)
      }
      this.nowQuestion = parseInt(data.idx)
      this.currentPage = this.prevQuestion
      addClass(this.$refs.fieldset[0], 'fieldset-hook')
      this._hideQuestionIndex(this.nowQuestion)
      this._showQuestionIndex(this.prevQuestion)
    },
    saveAnswer (data) {
      let answer = getLocalAnswer()
      let option = []
      if (parseInt(data.type) === 1) {
        option = [{
          value: data.option.filter(_ => _.isChecked)[0].value
        }]
      } else {
        data.option.map(_ => {
          option.push({value: _.optionfk, content: _.value})
        })
      }
      this.radioAnswer = {
        'idx': data.idx,
        'jumpback': data.jumpback,
        'option': option
      }
      answer.push(this.radioAnswer)
      let _tmp = {}
      answer.map(_ => {
        _tmp[_.idx] = _
      })
      answer = Object.values(_tmp)
      setLocalAnswer(answer)
    },
    onProgressBarChange (percent) {
      let maxPage = Math.max.apply(null, Array.from(new Set(this.answerIdx)).sort((a, b) => a - b))
      let percentPage = this.totalPage * percent | 0
      // console.log(percentPage, maxPage)
      if (percentPage + 1 >= maxPage) {
        // this.showPrevQuestion = false
        this.$weui.topTips(`才答到${maxPage}题，请按顺序继续作答`, {duration: 1000})
        this._showQuestionIndex(maxPage, true)
      } else {
        // this.showPrevQuestion = true
        percentPage = this._getNear(this.answerIdx, percentPage)
        // console.log(percentPage)
        this._showQuestionIndex(percentPage, true)
      }
    },
    _hideQuestionIndex (index) {
      if (!index) {
        this.questionList.map(_ => {
          _.show = false
        })
      } else {
        this.questionList.filter(_ => parseInt(_.idx) === index)[0].show = false
      }
      this.questionList = JSON.parse(JSON.stringify(this.questionList))
    },
    _showQuestionIndex (index, all = false) {
      if (all) {
        this.questionList.map(_ => {
          _.show = false
        })
      }
      this.questionList.filter(_ => parseInt(_.idx) === index)[0].show = true
      this.questionList = JSON.parse(JSON.stringify(this.questionList))
    },
    _getNear (arr, num) {
      arr = Array.from(new Set(arr)).sort((a, b) => a - b)
      let c = arr.map(_ => _ - num)
      let d = c.filter(_ => _ >= 0)
      let e = c.filter(_ => _ < 0)
      let _min1 = Math.max(...e)
      let _min2 = Math.min(...d)
      if (Math.abs(_min1) > Math.abs(_min2)) {
        return arr[arr.indexOf(num + _min2)]
      } else if (Math.abs(_min1) < Math.abs(_min2)) {
        return arr[arr.indexOf(num + _min1)]
      } else {
        return arr[arr.indexOf(num + _min2)]
      }
    }
  },
  watch: {
    isFontSet () {
      this.$refs.scroll.refresh()
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import "~@/common/stylus/variable"
  @import "~@/common/stylus/mixin"

  .qscale
    position fixed
    top 0
    bottom 0
    left 0
    right 0
    background-color $color-background

    .qscale-wrapper
      height 100%
      overflow hidden

    .qscale-slider
      width 100%
      padding $header-height 0 $footer-height

  fieldset
    border none
    width 100%
    min-height calc(100vh - 100PX)
    transition all .3s linear

    &.touchMove-enter, &.touchMove-leave-to
      opacity 0
      transform translate3d(-100%, 0, 0)

    &.fieldset-hook.touchMove-enter, &.fieldset-hook.touchMove-leave-to
      opacity 0
      transform translate3d(100%, 0, 0)

    .field
      clear both
      width 100%
      font-weight 400
      box-sizing border-box
      padding 40px 60px 0 60px

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
        margin 10px 0

        .field-radio
          display flex
          justify-content flex-start
          align-items center
          font-size $font-size-28
          position relative
          min-height 40px
          margin-bottom 50px

          .radiowrapper
            display inline-block
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

    .field-finger
      display flex
      justify-content space-between
      font-size $font-size-28
      color #999
      box-sizing border-box
      padding 0 10px
      background-color $color-white
      margin 60px -50px 0

  .iiw-footer
    position fixed
    bottom 0
    width 100%
    font-size $font-size-18
    background-color $color-background

    .container
      position relative
      display flex
      justify-content flex-end
      align-items center
      padding 5px 0 15px

      /*&:after*/
      /*  display block*/
      /*  position absolute*/
      /*  top 0*/
      /*  left 0*/
      /*  width 100%*/
      /*  border-top 1px solid #a4b3c1*/
      /*  content ''*/

      .timer
        padding-right 50px

      .finish, .unfinish
        padding-right 30px

        i
          display inline-block
          width 23px
          height 23px
          vertical-align middle
          margin-right 8px
          background-size 100% 100%
          background-repeat no-repeat

        span
          display inline-block
          vertical-align middle

      .finish
        color #00CC00

        i
          bg-image('finish')

      .unfinish
        color #FF0000

        i
          bg-image('danger')

      .page
        padding-right 25px
        color $color-text

</style>
