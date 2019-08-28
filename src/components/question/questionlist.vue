<template>
  <div class="questionlist">
    <iiw-header :headerTitle="headerTitle" :rightBtn="rightBtn" @showFontSet="showFontSet"></iiw-header>
    <timer v-if="showTimer"></timer>
    <scroll ref="scroll" class="question-wrapper">
      <div class="question-slider" ref="questionSlider">
        <transition name="touchMove">
          <fieldset v-if="question.show" ref="fieldset" class='fieldset'
                    v-for="(question, qnumber) in questionList"
                    :key="qnumber" @touchstart="touchStart"
                    @touchmove='touchMove($event, question)' @touchend='touchEnd($event, question)'>
            <question :question="question" @goSkip="goSkip" @radioGoNext="radioGoNext"></question>
            <div v-show="parseInt(question.idx) === cachePage + 1" class="field-finger">
              <div class="left">
                <img src="./right.png" alt="">
                <div class="tip">向右滑动 上一题</div>
              </div>
              <div class="right">
                <img src="./left.png" alt="">
                <div class="tip">向左滑动 下一题</div>
              </div>
            </div>
          </fieldset>
        </transition>
      </div>
    </scroll>
    <div v-show="showPrevQuestion" class="progress-bar-mask"></div>
    <div class="iiw-footer">
      <progress-bar :currentPage="currentPage" :totalPage="totalPage"
                    @percentChange="onProgressBarChange"></progress-bar>
      <div class="container">
        <div class="question-catelog" @click.stop="showContentsDom"><i></i>目录</div>
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
    <contents v-if="contentsList.length && showContents" :contentsList="contentsList"
              @hideContentsDom="hideContentsDom" @selectIdx="selectIdx"></contents>
  </div>
</template>

<script>
import iiwHeader from '@/components/iiw-header/iiw-header'
import Scroll from '@/components/scroll/scroll'
import question from '@/components/question/question'
import progressBar from '@/components/progressbar/progressbar'
import contents from '@/components/contents/contents'
import Timer from '@/components/timer/timer'
import {weuiOption} from '@/common/js/global'
import {addClass, removeClass} from '@/common/js/dom'
import {getLocalAnswer, setLocalAnswer, deleteQuestionAnswer} from '@/common/js/cache'

// 定义滑动距离百分比，如果为10说明只有滑动大于（100/10）距离才触发
const touchPercent = 15
const warmDuration = weuiOption.warmDuration

export default {
  props: {
    questionData: {
      type: Array
    },
    contentsList: {
      type: Array
    },
    cachePage: {
      type: Number
    }
  },
  components: {
    iiwHeader,
    Scroll,
    question,
    progressBar,
    contents,
    Timer
  },
  data () {
    return {
      headerTitle: '问卷调查',
      rightBtn: 1,
      questionList: this.questionData,
      // 题目是否已答
      hasAnswer: false,
      showContents: false,
      answer: [],
      currentPage: 1,
      totalPage: 1,
      // 上一题
      prevQuestion: 0,
      // 当前题目
      nowQuestion: 1,
      // 下一题
      nextQuestion: 0,
      showTimer: true,
      answerIdx: [],
      showPrevQuestion: false
    }
  },
  created () {
    // this.questionList.map(_ => {
    //   _.show = false
    // })
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
  computed: {
    percent () {
      return this.currentPage / this.totalPage
    }
  },
  mounted () {
  },
  methods: {
    showFontSet () {
      this.$emit('showFontSet')
    },
    showContentsDom () {
      this.showContents = true
    },
    hideContentsDom () {
      this.showContents = false
    },
    goSkip (data) {
      this._showQuestionIndex(data, true)
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
    isAnswer (question) {
      let step1 = false
      let step2 = []
      if (parseInt(question.type) === 1 || parseInt(question.type) === 2) {
        step1 = question.option.some(_ => _.isChecked === true)
        if (!step1) {
          return false
        } else if (question.option.filter(_ => _.isChecked && _.child).length) {
          question.option.filter(_ => _.isChecked && _.child).map(i => {
            i.qchild.map(j => {
              if (parseInt(j.type) === 1 || parseInt(j.type) === 2) {
                step2.push(j.option.some(_ => _.isChecked === true))
              } else {
                step2.push(j.option.every(_ => _.value !== ''))
              }
            })
          })
          if (step2.length && !step2.every(_ => _ === true)) {
            return false
          } else {
            return true
          }
        } else {
          return true
        }
      } else if (parseInt(question.type) === 3) {
        let inputDom = this.$refs.fieldset[0].getElementsByClassName('field-input')[0].getElementsByTagName('input')
        for (let i = 0; i < inputDom.length; i++) {
          inputDom[i].blur()
        }
        // 一些特殊题目还有客户的特殊要求效果
        if (parseInt(question.formula) === 1) {
          if (parseInt(question.option[0].value) !== parseInt(question.option[1].value) + parseInt(question.option[2].value)) {
            this.$weui.topTips(`小孩总数应为男孩与女孩之和`, {duration: warmDuration})
            return false
          } else if (parseInt(question.option[3].value) > parseInt(question.option[0].value)) {
            this.$weui.topTips(`排行数不能大于孩子总数`, {duration: warmDuration})
            return false
          }
        }
        step1 = question.option.every(_ => _.value !== '')
        if (!step1) {
          return false
        } else if (question.option.filter(_ => _.child).length) {
          question.option.filter(_ => _.child).map(i => {
            i.qchild.map(j => {
              if (parseInt(j.type) === 1 || parseInt(j.type) === 2) {
                step2.push(j.option.some(_ => _.isChecked === true))
              } else {
                step2.push(j.option.every(_ => _.value !== ''))
              }
            })
          })
          if (step2.length && !step2.every(_ => _ === true)) {
            return false
          } else {
            return true
          }
        } else {
          return true
        }
      } else {
        step1 = question.option.some(_ => _.isChecked === true)
        if (!step1) {
          return false
        } else {
          return true
        }
      }
    },
    // 手指滑动未松手时，到下一题的交互效果
    showNextPage (data) {
      // 该题未回答提示并跳出
      // if (!this.isAnswer(data)) {
      //   setTimeout(() => {
      //     this.$weui.topTips(`请完整答完该题目后翻页`, {duration: warmDuration})
      //   }, 500)
      // }
      if (this.lastPage) return false
    },
    // 手指滑动松手后跳到下一题
    goNextPage (data) {
      // console.log(data) // 为当前页问题数据
      if (!this.isAnswer(data)) {
        setTimeout(() => {
          this.$weui.topTips(`请完整答完该题目后翻页`, {duration: warmDuration})
        }, 150)
        return false
      }
      // 该题已回答
      this.nowQuestion = parseInt(data.idx)
      if (data.anyjump) { // 无条件跳题逻辑
        this.nextQuestion = parseInt(data.anyjump)
      } else if (parseInt(data.type) === 1) { // 单选题按选项跳题
        let jumpto = parseInt(data.option.filter(_ => _.isChecked)[0].jumpto)
        if (jumpto) {
          this.nextQuestion = data.jumpto = jumpto
        } else {
          this.nextQuestion = data.jumpto = this.nowQuestion + 1
        }
      } else if (parseInt(data.type) === 2) { // 多选跳题
        let jumpto = Array.from(new Set(data.option.filter(_ => _.isChecked).map(_ => {
          if (_.jumpto) {
            _.relationSkip = true
            return _.jumpto
          } else {
            return parseInt(data.idx) + 1
          }
        }))).sort()

        this.questionList.forEach(item => { // 多选跳题
          for (let i = 0; i < jumpto.length; i++) {
            for (let j = i + 1; j < jumpto.length; j++) {
              if (parseInt(item.idx) === jumpto[j]) {
                item['jumpback'] = jumpto[i]
              }
              if (parseInt(item.idx) === jumpto[i]) {
                item['jumpto'] = jumpto[j]
              }
              break
            }
          }
        })

        if (jumpto.length) {
          this.nextQuestion = data.jumpto = parseInt(jumpto[0])
        } else {
          this.nextQuestion = data.jumpto = this.nowQuestion + 1
        }
      } else {
        this.nextQuestion = data.jumpto = this.nowQuestion + 1
      }

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

      // 跳转后删除中间的不用回答的问题
      for (let i = 1; i < parseInt(data.jumpto) - parseInt(data.idx); i++) {
        // console.log(parseInt(data.idx) + i)
        deleteQuestionAnswer(parseInt(data.idx) + i)
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
      if (data.jumpback) {
        this.prevQuestion = parseInt(data.jumpback)
      } else {
        this.answerIdx.findIndex(_ => _ === parseInt(data.idx))
        this.prevQuestion = this.answerIdx[this.answerIdx.findIndex(_ => _ === parseInt(data.idx)) - 1]
      }
      // console.log(this.prevQuestion)
      this.nowQuestion = parseInt(data.idx)
      this.currentPage = this.prevQuestion
      // deleteQuestionAnswer(this.nowQuestion)
      addClass(this.$refs.fieldset[0], 'fieldset-hook')
      this._hideQuestionIndex(this.nowQuestion)
      this._showQuestionIndex(this.prevQuestion)
    },
    saveAnswer (data) {
      let answer = getLocalAnswer()
      answer.push(data)
      let _tmp = {}
      answer.map(_ => {
        _tmp[_.idx] = _
      })
      answer = Object.values(_tmp)
      setLocalAnswer(answer)
    },
    radioGoNext (data) {
      setTimeout(() => {
        this.goNextPage(data)
      }, 20)
    },
    onProgressBarChange (percent) {
      let maxPage = Math.max.apply(null, Array.from(new Set(this.answerIdx)).sort((a, b) => a - b))
      let percentPage = this.totalPage * percent | 0
      // console.log(maxPage, percentPage)
      if (percentPage >= maxPage) {
        // this.showPrevQuestion = false
        this.$weui.topTips(`才答到${maxPage}题，请按顺序继续作答`, {duration: 1000})
        this._showQuestionIndex(maxPage, true)
      } else {
        // this.showPrevQuestion = true
        percentPage = this._getNear(this.answerIdx, percentPage)
        this._showQuestionIndex(percentPage, true)
      }
    },
    selectIdx (idx) {
      let jumpIdx = this.answerIdx.find(_ => _ === parseInt(idx))
      if (jumpIdx) {
        this.currentPage = parseInt(idx)
        this._showQuestionIndex(this.currentPage, true)
        this.hideContentsDom()
      } else {
        this.$weui.topTips(`抱歉，已回答题库中无该类型，请选择其他类型跳转`, {duration: 1000})
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
  watch: {}
}
</script>

<style lang="stylus" scoped>
  @import "~@/common/stylus/variable"
  @import "~@/common/stylus/mixin"

  .questionlist
    position fixed
    top 0
    bottom 0
    left 0
    right 0
    background-color $color-background

    .question-wrapper
      height 100%
      overflow hidden

      .question-slider
        width 100%
        padding 50PX 0 100PX

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

    .field-finger
      //position fixed
      //top calc(100vh / 2)
      //left 0
      /*width 100%*/
      display flex
      justify-content space-between
      font-size $font-size-28
      color #999
      box-sizing border-box
      padding 0 10px
      background-color $color-white

  //margin 60px -50px 0

  .progress-bar-mask
    position fixed
    top 0
    bottom 80PX
    left 0
    right 0
    width 100%
    background-color rgba(0, 0, 0, .6)
    z-index 1

  .timer
    position fixed
    top 40PX
    right 20px

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

      .question-catelog
        position absolute
        top 0
        left 0
        font-size $font-size-16
        padding 5px 15px

        i
          display inline-block
          width 23px
          height 23px
          vertical-align middle
          bg-image('catelog')

      .finish, .unfinish
        padding-right 20px

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
