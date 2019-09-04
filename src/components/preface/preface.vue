<template>
  <div class="preface">
    <iiw-header :headerTitle="headerTitle" :rightBtn="rightBtn"></iiw-header>
    <scroll ref="scroll" class="preface-content">
      <div class="container">
        <h3 class="name" v-if="wjDetail.name">{{wjDetail.name}}</h3>
        <h4 class="time">{{wjDetail.describe}}</h4>
        <form>
          <v-touch @swipeleft="touchLeft">
            <div ref="prefaceList">
              <ul class="preface-list">
                <li class="preface-item">
                  访谈员编号: <span v-if="interviewer_code.length > 10" class="underline">{{userDetail.interviewercode}}</span>
                  <span v-else-if="interviewer_code.length >= 1"><i v-for="(num, i) in interviewer_code" :key="i">{{num}}</i></span>
                  <span v-else><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>
                </li>
                <li class="preface-item">
                  访谈员姓名: <span class="underline">{{userDetail.interviewername}}</span>
                </li>
                <li class="preface-item">
                  联系方式: <span class="underline">{{userDetail.phone}}</span>
                </li>
                <li class="preface-item">
                  督导员编号: <span v-if="supervisor_code.length > 10" class="underline">{{userDetail.supervisorcode}}</span>
                  <span v-else-if="supervisor_code.length >= 1"><i v-for="(num, i) in supervisor_code" :key="i">{{num}}</i></span>
                  <span v-else><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>
                </li>
                <li class="preface-item">
                  督导员姓名: <span class="underline">{{userDetail.supervisor}}</span>
                </li>
                <li class="preface-item">
                  联系方式: <span class="underline">{{userDetail.supervisorphone}}</span>
                </li>
                <li class="preface-item">
                  被访谈人员编号: <span v-if="interviewee_code.length > 10" class="underline">{{userDetail.bm}}</span>
                  <span v-else-if="interviewee_code.length >= 1"><i v-for="(num, i) in interviewee_code" :key="i">{{num}}</i></span>
                  <span v-else><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>
                </li>
                <li class="preface-item">
                  被访谈人员姓名: <span class="underline">{{userDetail.criminalname}}</span>
                </li>
                <li class="preface-item">
                  被访谈人员类型: <span class="underline">{{userDetail.usertype}}</span>
                </li>
                <li class="preface-item">
                  访谈日期: <span class="underline">{{userDetail.starttime}}</span>
                </li>
              </ul>
              <div class="field-finger">
                <div class="right">
                  <img src="./left.png" alt="">
                  <div class="tip">请右滑</div>
                </div>
              </div>
            </div>
          </v-touch>
          <v-touch @swipeleft="touchJump" @swiperight="touchRight">
            <div ref="prefaceIntroduce" class="preface-introduce" style="display: none">
              <h3 class="title">{{wjDetail.introTitle}}</h3>
              <h4>【指导语】</h4>
              <p>{{wjDetail.introduce}}</p>
            </div>
          </v-touch>

        </form>
      </div>
    </scroll>
  </div>
</template>

<script>
import Scroll from '@/components/scroll/scroll'
import iiwHeader from '@/components/iiw-header/iiw-header'
import {getUrlParam} from '@/common/js/util'

export default {
  props: {
    wjDetail: {
      type: Object,
      default () {
        return {}
      }
    }
  },
  components: {
    Scroll,
    iiwHeader
  },
  data () {
    return {
      headerTitle: '',
      rightBtn: 0,
      userDetail: {},
      interviewer_code: [],
      supervisor_code: [],
      interviewee_code: []
    }
  },
  created () {
    this.userDetail = this.wjDetail.userDetail
    this.dataDeal()
  },
  mounted () {
  },
  computed: {},
  methods: {
    dataDeal () {
      if (this.userDetail.interviewercode) this.interviewer_code = this.userDetail.interviewercode.split('')
      if (this.userDetail.supervisorcode) this.supervisor_code = this.userDetail.supervisorcode.split('')
      if (this.userDetail.bm) this.interviewee_code = this.userDetail.bm.split('')

      // if (this.wjDetail.usertype === 0) this.wjDetail.usertypename = '初犯'
      // else if (this.wjDetail.usertype === 1) this.wjDetail.usertypename = '重犯'
      // else if (this.wjDetail.usertype === 2) this.wjDetail.usertypename = '刑罚执行完毕后未重新犯罪者'

      if (getUrlParam('type') === 'lbdc') {
        this.headerTitle = '量表调查'
        this.wjDetail.introTitle = ''
        if (!this.wjDetail.introduce) {
          this.wjDetail.introduce = '你好！我们是司法部预防犯罪研究所《重新犯罪问题调查》课题组。目前，我所正在就“人为什么会走到犯罪这一步”这个问题进行一项全国性调查。目的是深入了解和分析服刑人员走上犯罪的原因与过程，为预防犯罪以及帮助服刑人员顺利回归社会提供制定对策、措施的依据或参考。\n' +
            '请你根据最真实的情况和想法回答以下问题，没有标准答案，也无对错之分。请你放心，你的回答不会对你现有的管理处遇、减刑假释等产生任何影响！同时，我们也将对你的所有回答严格保密。\n' +
            '感谢你的配合！有问题请举手示意。'
        }
      } else {
        if (getUrlParam('type') === 'wjdc') this.headerTitle = '问卷调查'
        else if (getUrlParam('type') === 'wjsh') this.headerTitle = '问卷审核'
        else this.headerTitle = '问卷查看'
        this.wjDetail.introTitle = '访谈员自我介绍'
        if (!this.wjDetail.introduce) {
          this.wjDetail.introduce = '目前，司法部预防犯罪研究所正在就“人为什么会走到犯罪这一步”这个问题进行一项全国性调查。调查的目的是深入了解和分析服刑人员走上犯罪的原因与过程，为预防犯罪以及帮助服刑人员顺利回归社会提供制定对策、措施的依据或参考。我是该调查项目的一名调查人员。'
        }
      }
    },
    touchLeft (e) {
      this.$refs.prefaceList.style.display = 'none'
      this.$refs.prefaceIntroduce.style.display = 'block'
    },
    touchRight (e) {
      this.$refs.prefaceIntroduce.style.display = 'none'
      this.$refs.prefaceList.style.display = 'block'
    },
    touchJump (e) {
      this.$emit('showQuestionDom')
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import "~@/common/stylus/variable"

  .preface
    position fixed
    top 0
    bottom 0
    left 0
    right 0
    background-color $color-background

    .preface-content
      height 100%
      overflow hidden

    .container
      font-size $font-size-28
      padding 120px 40px

      .name
        font-size $font-size-30
        font-weight bold
        text-align center
        margin-bottom 15px

      .time
        font-size $font-size-22
        text-align center

      form
        margin-top 50px

        .preface-item
          margin-bottom 10px

          span
            display inline-block
            margin-left 10px
            padding 10px 0 5px

            &.underline
              min-width 50%
              border-bottom 1px solid $color-theme

            i
              padding 0px 5px
              margin-right 5px
              border 1px solid $color-theme

        .field-finger
          display flex
          justify-content flex-end

          .right
            text-align center
            font-size $font-size-28

        .preface-introduce
          .title
            font-size $font-size-30
            margin-bottom 20px

          h4
            margin-bottom 50px

          p
            text-indent 2em
            line-height 1.5
            min-height 500px
</style>
