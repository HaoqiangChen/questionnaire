<template>
  <transition name="viewSlide">
    <div class="submit">
      <iiw-header :headerTitle="headerTitle" :rightBtn="rightBtn" @submit="submit"
                  @backToQuestion="backToQuestion"></iiw-header>
      <div class="container">
        <img src="./success.png" alt="">
        <h3>{{msg}}</h3>
        <h3>请提交后耐心等待督导员审核</h3>
        <div class="field-submit" @click.stop="submit">提交</div>
      </div>
    </div>
  </transition>
</template>

<script>
import iiwHeader from '@/components/iiw-header/iiw-header'
import {getLocalAnswer, getLocalCache, removeLocalCache} from '@/common/js/cache'
import {getUrlParam} from '@/common/js/util'

const TIMER_KEY = `${getUrlParam('criminalfk')}-${getUrlParam('paperfk')}-timer`
const ANSWER_KEY = `${getUrlParam('criminalfk')}-${getUrlParam('paperfk')}`

export default {
  props: {
    questionData: {
      type: Array,
      default () {
        return []
      }
    },
    scaleData: {
      type: Array,
      default () {
        return []
      }
    }
  },
  components: {
    iiwHeader
  },
  data () {
    return {
      headerTitle: '问卷提交',
      msg: '问卷调查完成',
      rightBtn: 2,
      answer: []
    }
  },
  created () {
    if (getUrlParam('type') === 'lbdc') {
      this.headerTitle = '量表提交'
      this.msg = '量表调查完成'
    }
    this._getLocalAnswer()
  },
  methods: {
    _getLocalAnswer () {
      let answer = getLocalAnswer()
      if (getUrlParam('type') === 'lbdc') {
        if (answer.length) answer = [].concat(...(answer.map(_ => _.option)))
        this.answer = answer
      } else {
        let option = []
        answer.map(item => {
          if (parseInt(item.type) === 1 || parseInt(item.type) === 2) {
            item.option.filter(_ => _.isChecked).map(_ => {
              option.push({value: _.optionfk})
            })
            if (item.option.filter(_ => _.isChecked && _.child).length) {
              item.option.filter(_ => _.isChecked && _.child).map(i => {
                i.qchild.map(j => {
                  if (parseInt(j.type) === 1 || parseInt(j.type) === 2) {
                    j.option.filter(_ => _.isChecked).map(_ => {
                      option.push({value: _.optionfk})
                    })
                  } else {
                    j.option.map(_ => {
                      option.push({value: _.optionfk, content: _.value})
                    })
                  }
                })
              })
            }
          } else if (parseInt(item.type) === 3) {
            item.option.map(_ => {
              option.push({value: _.optionfk, content: _.value})
            })
            if (item.option.filter(_ => _.child).length) {
              item.option.filter(_ => _.child).map(i => {
                i.qchild.map(j => {
                  if (parseInt(j.type) === 1 || parseInt(j.type) === 2) {
                    j.option.filter(_ => _.isChecked).map(_ => {
                      option.push({value: _.optionfk})
                    })
                  } else {
                    j.option.map(_ => {
                      option.push({value: _.optionfk, content: _.value})
                    })
                  }
                })
              })
            }
          } else {
            item.option.filter(_ => _.isChecked).map(_ => {
              option.push({value: _.optionfk})
            })
          }
        })
        this.answer = option
      }
    },
    submit () {
      let loading = this.$weui.loading('提交中...', {
        className: 'question-loading'
      })
      this.minutes = getLocalCache(TIMER_KEY, '')
      window.WebViewJavascriptBridge.callHandler('question', {
        'action': 'submit',
        'value': this.answer,
        'minutes': this.minutes,
        'localstorage': getLocalAnswer()
      }, (res) => {
        // console.log(res)
        if (JSON.parse(res) === '0') {
          loading.hide(() => {
            this.$weui.toast('上传成功', {
              duration: 1000
            })
            removeLocalCache(ANSWER_KEY)
            removeLocalCache(TIMER_KEY)
            setTimeout(() => {
              this.$emit('showSuccessDom')
            }, 1000)
          })
        } else {
          loading.hide(() => {
            console.log(JSON.parse(res))
            this.$weui.toast('上传失败，请重新提交', {
              duration: 3000
            })
          })
        }
      })
    },
    /**
     * 将问卷问题数据进行重组，分类出一级标题（按A、B、C等等分类）
     * @param list
     */
    _normalizeAnswer (list) {
      let map = []
      list.forEach(_ => {
        const key = _.code.charAt(0)
        const classify = _.classify
        if (!map[key]) {
          map[key] = {
            name: classify,
            type: key,
            question: []
          }
        }
        map[key].question.push(_)
      })
      // console.log(map)
      return map
    },
    backToQuestion () {
      this.$emit('backToQuestion')
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import "~@/common/stylus/variable"

  .submit
    position fixed
    top 0
    bottom 0
    left 0
    right 0
    background-color $color-background
    transition all .2s linear

    &.viewSlide-enter, &.viewSlide-leave-to
      transform translate3d(100%, 0, 0)

    .container
      padding 0 30px
      padding-top $header-height
      font-size $font-size-28
      text-align center

      img
        display block
        width 50%
        margin 60px auto 30px

      h3
        margin-bottom 10px

      .field-submit
        width 100%
        padding 20px 0
        font-size $font-size-22
        color $color-white
        background-color $color-header-theme
        border-radius 5px
        margin-top 60px
</style>
