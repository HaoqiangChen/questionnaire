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
            <!--            <div class="question-button">-->
            <!--              <button class="question-btn questionPrev" @click="goPrevPage(question)"-->
            <!--                      v-show="currentPage !== 1">上一题-->
            <!--              </button>-->
            <!--              <button class="question-btn questionNext" @click="goNextPage(question)">下一题</button>-->
            <!--            </div>-->
          </fieldset>
        </transition>
      </div>
    </scroll>

    <div v-show="showPrevQuestion" class="progress-bar-mask"></div>
    <div class="iiw-footer" v-show="footerShow">
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
import {autoDuration, weuiOption} from '@/common/js/global'
import {addClass, removeClass} from '@/common/js/dom'
import {getLocalCache, setLocalCache, getLocalAnswer, setLocalAnswer, deleteQuestionAnswer} from '@/common/js/cache'
import {getUrlParam, getTimestamp, getAge} from '@/common/js/util'

// 定义滑动距离百分比，如果为10说明只有滑动大于（100/10）距离才触发
const touchPercent = 15
const warmDuration = weuiOption.warmDuration
const USER_KEY = `${getUrlParam('criminalfk')}-${getUrlParam('paperfk')}-user`

export default {
  props: {
    userDetail: {
      type: Object,
      default () {
        return {}
      }
    },
    questionData: {
      type: Array
    },
    contentsList: {
      type: Array
    },
    cachePage: {
      type: Number
    },
    isFontSet: {
      type: Boolean
    }
    // submitToQ: {
    //   type: Boolean
    // }
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
      userDetails: this.userDetail,
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
      showPrevQuestion: false,
      windowHeight: document.documentElement.clientHeight, // 网页屏幕高度
      screenHeight: document.documentElement.clientHeight, // 实时屏幕高度
      footerShow: true // 显示或者隐藏footer
    }
  },
  created () {
    // this.questionList.map(_ => {
    //   _.show = false
    // })
    this.touch = {}
    this.totalPage = this.questionList.length

    let localAnswer = getLocalAnswer()

    if (localAnswer.length) {
      this.answerIdx = localAnswer.map(_ => parseInt(_.idx))
      // if (this.submitToQ) this.cachePage = parseInt(localAnswer[localAnswer.length - 1].idx)
    }

    if (this.cachePage) {
      this._showQuestionIndex(this.cachePage, true)
      this.currentPage = this.cachePage
    } else {
      this._showQuestionIndex(1, true)
    }

    let userDetails = getLocalCache(USER_KEY, '')
    if (!userDetails) {
      // let obj = {birthday: '1980年06月15日', age: 40, firstCrime: '2000年8月', firstCrimeAge: 20, punishment: '有期徒刑缓刑', sentence: 39}
      // setLocalCache(USER_KEY, Object.assign(this.userDetails, obj))
      setLocalCache(USER_KEY, this.userDetails)
    } else {
      this.userDetails = userDetails
    }
  },
  computed: {
    percent () {
      return this.currentPage / this.totalPage
    }
  },
  mounted () {
    // window.onresize监听页面高度的变化
    // window.onresize = () => { // 不知道为什么这个方法在这里没有效果
    //   return (() => {
    //     this.screenHeight = document.documentElement.clientHeight
    //   })()
    // }

    window.addEventListener('resize', () => {
      this.screenHeight = document.documentElement.clientHeight
      // this.$refs.scroll.refresh()
    })
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
      if (this.questionList[data - 1].jumpback) delete this.questionList[data - 1].jumpback
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
            return this.logicalJudgment(question)
          }
        } else {
          return true
        }
      } else if (parseInt(question.type) === 3) {
        let inputDom = this.$refs.fieldset[0].getElementsByClassName('field-input')[0].getElementsByTagName('input')
        for (let i = 0; i < inputDom.length; i++) {
          inputDom[i].blur()
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
            return this.logicalJudgment(question)
          }
        } else {
          return this.logicalJudgment(question)
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
        // 一、获取多选题所选选项
        // 二、循环所选选项，如果该选项有配置跳转题，说明该跳转题必答，赋予 relationSkip属性，汇总这些跳转题为数组，进行去重排序
        let jumpto = Array.from(new Set(data.option.filter(_a => _a.isChecked).map(_b => {
          if (_b.jumpto) {
            // _b.relationSkip = true
            this.questionList.filter(_c => parseInt(_c.idx) === _b.jumpto)[0].relationSkip = true
            return _b.jumpto
          } else {
            return parseInt(data.idx) + 1
          }
        }))).sort((a, b) => a - b)

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
        let answerback = this.answerIdx.findIndex(_ => _ === parseInt(data.idx))
        if (answerback === -1) {
          this.prevQuestion = this._getNear(this.answerIdx, parseInt(data.idx))
        } else {
          this.prevQuestion = this.answerIdx[answerback - 1]
        }
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
      }, autoDuration)
    },
    onProgressBarChange (percent) {
      let percentPage = this.totalPage * percent | 0
      if (!percentPage) {
        this.$weui.topTips(`请按顺序作答`, {duration: 1000})
        return
      }
      let maxPage = Math.max.apply(null, Array.from(new Set(this.answerIdx)).sort((a, b) => a - b))
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
    // 应客户特殊性要求的逻辑判断
    logicalJudgment (question) {
      // console.log(question)
      // 逻辑1：保存出生日期，并且年龄范围应≥14周岁，≤95周岁
      if (question.formula === '1') {
        if (question.option[0].value === '记不清') {
          this.$weui.toast('该题必填，不可选择 记不清', {duration: warmDuration, className: 'weui-toast-warning'})
          return false
        }
        let age = getAge(question.option[0].value)
        if (age >= 14 && age <= 95) {
          this.userDetails.birthday = question.option[0].value
          this.userDetails.age = age
          setLocalCache(USER_KEY, this.userDetails)
          return true
        } else {
          this.$weui.toast('年龄范围应≥14周岁，≤95周岁', {duration: warmDuration, className: 'weui-toast-warning'})
          return false
        }
      } else if (question.formula === '2') { // 逻辑2：年龄范围应≥18周岁，≤95周岁
        if (question.option[0].value === '记不清') return true
        let age = getAge(this.userDetails.birthday, question.option[0].value)
        if (age >= 18 && age <= 95) {
          return true
        } else {
          this.$weui.toast('年龄范围应≥18周岁，≤95周岁', {duration: warmDuration, className: 'weui-toast-warning'})
          return false
        }
      } else if (question.formula === '3') { // 逻辑3：年龄范围应≥0周岁，≤95周岁
        if (parseInt(question.type) === 1 || parseInt(question.type) === 2) {
          let isLogic = false
          question.option.filter(_ => _.child && _.isChecked).map(i => {
            i.qchild.filter(j => parseInt(j.type) === 3).map(k => {
              if (k.option.filter(l => parseInt(l.type) === 6)[0].value === '记不清了') return true
              let age = getAge(this.userDetails.birthday, k.option.filter(l => parseInt(l.type) === 6)[0].value)
              if (age >= 0 && age <= 95) {
                isLogic = true
              } else {
                this.$weui.toast('年龄范围应≥0周岁，≤95周岁', {duration: warmDuration, className: 'weui-toast-warning'})
                isLogic = false
              }
            })
          })
          return isLogic
        } else {
          if (question.option[0].value === '记不清') return true
          let age = getAge(this.userDetails.birthday, question.option[0].value)
          if (age >= 0 && age <= 95) {
            return true
          } else {
            this.$weui.toast('年龄范围应≥0周岁，≤95周岁', {duration: warmDuration, className: 'weui-toast-warning'})
            return false
          }
        }
      } else if (question.formula === '4') { // 逻辑4：家里共有__个小孩， 其中男孩__个， 女孩__个，你排行第__。
        if (parseInt(question.option[0].value) !== parseInt(question.option[1].value) + parseInt(question.option[2].value)) {
          this.$weui.toast('小孩总数应为男孩与女孩之和', {duration: warmDuration, className: 'weui-toast-warning'})
          return false
        } else if (parseInt(question.option[3].value) > parseInt(question.option[0].value)) {
          this.$weui.toast('排行数不能大于孩子总数', {duration: warmDuration, className: 'weui-toast-warning'})
          return false
        } else if (!parseInt(question.option[3].value)) {
          this.$weui.toast('排行数不能为0', {duration: warmDuration, className: 'weui-toast-warning'})
          return false
        } else return true
      } else if (question.formula === '5') { // 逻辑5：起始时间不早于出生年月，累计时间≤14年0月
        let startTime = question.option.filter(_ => _.child && _.isChecked)[0].qchild[0].option[0].value
        if (startTime === '记不清了') return true
        let age = getAge(this.userDetails.birthday, startTime)
        if (age >= 0 && age <= 14) {
          let year = question.option.filter(_ => _.child && _.isChecked)[0].qchild[0].option[1].value
          let month = question.option.filter(_ => _.child && _.isChecked)[0].qchild[0].option[2].value
          if (parseInt(year) === 14 && parseInt(month) > 0) {
            this.$weui.toast('起始时间应该为你出生年月至14岁之间，累计时间≤14年0月', {duration: warmDuration, className: 'weui-toast-warning'})
            question.option.filter(_ => _.child && _.isChecked)[0].qchild[0].option[2].value = 0
            return false
          } else return true
        } else {
          this.$weui.toast('起始时间应该为你出生年月至14岁之间，累计时间≤14年0月', {duration: warmDuration, className: 'weui-toast-warning'})
          return false
        }
      } else if (question.formula === '6') { // 逻辑6：初犯，本题=1。重犯，2≤本题≤30。未重新，1~30，填1的话，F3跳到I1，否则跳到F4。
        if (this.userDetails.usertypename === '初犯') {
          if (parseInt(question.option[0].value) !== 1) {
            this.$weui.toast('初犯为第一次犯罪,请填1', {
              duration: warmDuration,
              className: 'weui-toast-warning',
              callback: function callback () {
                question.option[0].value = 1
              }
            })
            return false
          } else return true
        } else if (this.userDetails.usertypename === '刑罚执行完毕后未重新犯罪者') {
          if (parseInt(question.option[0].value) > 0 && parseInt(question.option[0].value) <= 30) {
            if (parseInt(question.option[0].value) === 1 && this.questionList.filter(_ => _.code === 'I1.1').length) {
              let idx = this.questionList.filter(_ => _.code === 'I1.1')[0].idx
              this.questionList.filter(_ => _.code === 'C3')[0].anyjump = parseInt(idx)
            } else {
              console.log('继续顺序作答')
            }
            return true
          } else {
            this.$weui.toast('刑罚执行完毕后未重新犯罪者的犯罪数目范围为 1~30', {
              duration: warmDuration,
              className: 'weui-toast-warning',
              callback: function callback () {
                question.option[0].value = ''
              }
            })
            return false
          }
        } else {
          if (question.option[0].value >= 2 && question.option[0].value <= 30) {
            return true
          } else {
            this.$weui.toast('重犯的犯罪数目范围为 2~30', {
              duration: warmDuration,
              className: 'weui-toast-warning',
              callback: function callback () {
                question.option[0].value = ''
              }
            })
            return false
          }
        }
      } else if (question.formula === '7') { // 逻辑7：保存第一次犯罪时间，并且时间不早于14周岁
        if (question.option[0].value === '记不清') {
          this.userDetails.firstCrime = '记不清'
          return true
        }
        this.userDetails.firstCrime = question.option[0].value
        let age = getAge(this.userDetails.birthday, question.option[0].value)
        this.userDetails.firstCrimeAge = age
        setLocalCache(USER_KEY, this.userDetails)
        if (age >= 14 && age <= 95) return true
        else {
          this.$weui.toast('年龄范围应≥14周岁，≤95周岁', {duration: warmDuration, className: 'weui-toast-warning'})
          return false
        }
      } else if (question.formula === '8') { // 逻辑8：≤第一次犯罪时年龄
        if (this.userDetails.firstCrime === '记不清') return true
        let age = getAge(this.userDetails.birthday, this.userDetails.firstCrime)
        if (parseInt(question.option[0].value) > age) {
          this.$weui.toast('所填时长不得超过 第一次犯罪时年龄', {duration: warmDuration, className: 'weui-toast-warning'})
          return false
        } else return true
      } else if (question.formula === '9') { // 逻辑9：保存第一次犯罪后被判刑罚，刑期最大为 25年0月
        if (parseInt(question.type) === 1) {
          let issue = question.option.filter(_ => _.isChecked)[0]
          let sentence = 300
          this.userDetails.punishment = issue.label
          if (issue.child) {
            sentence = parseInt(issue.qchild[0].option[0].value) * 12 + parseInt(issue.qchild[0].option[1].value)
          }
          if (sentence > 0 && sentence <= 300) {
            this.userDetails.sentence = sentence
            setLocalCache(USER_KEY, this.userDetails)
            return true
          } else {
            this.$weui.toast('刑期最大为 25年0月，最小填写 0年1月', {duration: warmDuration, className: 'weui-toast-warning'})
            return false
          }
        } else {
          let num = parseInt(question.option[0].value) * 12 + parseInt(question.option[1].value)
          if (num > 0 && num <= 300) {
            return true
          } else {
            this.$weui.toast('刑期最大为 25年0月，最小填写 0年1月', {duration: warmDuration, className: 'weui-toast-warning'})
            return false
          }
        }
      } else if (question.formula === '10') { // 逻辑10：减刑 ≤第一次犯罪刑期的1/2，判处无期徒刑的，≤12年
        let num = parseInt(question.option[1].value) * 12 + parseInt(question.option[2].value)
        if (this.userDetails.punishment.search('有期') !== -1) {
          if (num > 0 && num <= this.userDetails.sentence / 2) return true
          else {
            this.$weui.toast('减刑 ≤第一次犯罪刑期的1/2，不可填写 0年0月', {duration: warmDuration, className: 'weui-toast-warning'})
            return false
          }
        } else {
          if (num > 0 && num <= 144) return true
          else {
            this.$weui.toast('判处有期徒刑之外的减刑 ≤12年，不可填写 0年0月', {duration: warmDuration, className: 'weui-toast-warning'})
            return false
          }
        }
      } else if (question.formula === '11') { // 逻辑11：≥第一次犯罪时间
        if (this.userDetails.firstCrime === '记不清') return true
        if (getTimestamp(this.userDetails.firstCrime) > getTimestamp(question.option[0].value)) {
          this.$weui.toast('所填不得晚于 第一次犯罪时间', {duration: warmDuration, className: 'weui-toast-warning'})
          return false
        } else return true
      } else if (question.formula === '12') { // 逻辑12：年份所填数字≤受访者年龄
        if (parseInt(question.option[0].value) === 0 && parseInt(question.option[1].value) === 0) {
          this.$weui.toast('不可填写 0年0月', {duration: warmDuration, className: 'weui-toast-warning'})
          return false
        } else if (parseInt(question.option[0].value) > this.userDetails.age) {
          this.$weui.toast('所填时长不得超过 你的年龄', {duration: warmDuration, className: 'weui-toast-warning'})
          return false
        } else return true
      } else if (question.formula === '13') { // 逻辑13：6岁≤当时年纪≤受访者年龄
        if (parseInt(question.option[0].value) >= 6 && parseInt(question.option[0].value) <= this.userDetails.age) {
          return true
        } else {
          this.$weui.toast('6岁 ≤ 所填数 ≤ 你的年龄', {
            duration: warmDuration,
            className: 'weui-toast-warning',
            callback: function callback () {
              question.option[0].value = ''
            }
          })
          return false
        }
      } else if (question.formula === '14') { // 逻辑14：年份≤受访者年龄，若≥25，提示访员确认；0年0月，提示访员确认
        if (parseInt(question.option[0].value) > this.userDetails.age) {
          this.$weui.toast('所填年份不可大于 你的年龄', {
            duration: warmDuration,
            className: 'weui-toast-warning',
            callback: function callback () {
              question.option[0].value = ''
            }
          })
          return false
        } else if (parseInt(question.option[0].value) >= 25) {
          this.$weui.toast('所填年份 ≥25，请确认', {duration: warmDuration, className: 'weui-toast-warning'})
        } else if (parseInt(question.option[0].value) === 0 && parseInt(question.option[1].value) === 0) {
          this.$weui.toast('0年0月，请确认是否符合事实', {duration: warmDuration, className: 'weui-toast-warning'})
        }
        return true
      } else if (question.formula === '15') { // 逻辑15：保存第一次使用毒品年份
        if (question.option[0].value === '记不清') {
          this.userDetails.firstDrug = '记不清'
          return true
        }
        let firstDrug = getTimestamp(question.option[0].value)
        if (firstDrug < getTimestamp(this.userDetails.birthday)) {
          this.$weui.toast('不可选择你 出生年月 之前', {duration: warmDuration, className: 'weui-toast-warning'})
          return false
        } else {
          let age = getAge(this.userDetails.birthday, question.option[0].value)
          this.userDetails.firstDrug = question.option[0].value
          this.userDetails.firstDrugAge = age
          setLocalCache(USER_KEY, this.userDetails)
          return true
        }
      } else if (question.formula === '16') { // 逻辑16：≤第一次使用毒品的年龄
        if (this.userDetails.firstDrug === '记不清') return true
        let drug = question.option.filter(_ => _.isChecked && _.child)
        if (drug.length && drug[0].qchild[0].option[0].value > this.userDetails.firstDrugAge) {
          this.$weui.toast('不可大于 第一次使用毒品的时间', {duration: warmDuration, className: 'weui-toast-warning'})
          return false
        } else return true
      } else if (question.formula === '17') { // 逻辑17：
        return true
      } else {
        return true
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
    },
    screenHeight (newVal, oldVal) {
      if (newVal < oldVal) {
        this.$refs.questionSlider.style.paddingBottom = `${newVal}px`
        this.footerShow = false
      } else {
        this.footerShow = true
        this.$refs.questionSlider.style.paddingBottom = '100px'
      }
    }
  }
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

    .question-button
      /*position fixed*/
      /*bottom 90PX*/
      width 100%
      text-align center

      .question-btn
        width 35%
        padding 10PX 0
        background transparent
        border 1px solid $color-border
        border-radius 5PX
        font-weight bold

        &.questionNext
          background-color $color-header-theme
          color $color-white

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
