<template>
  <scroll class="answerlist" :data="data" ref="answerlist" :listen-scroll="listenScroll" :probeType="probeType"
          @scroll="scroll">
    <div class="answer-content">
      <ul>
        <li v-for="(group, index) in data" :key="index" class="answer-list answer-list-hook" ref="listGroup">
          <h1 class="title">{{group.type}}、{{group.name}}</h1>
          <fieldset class='fieldset' v-for="(answer, qnumber) in group.question" :key="qnumber">
            <div class='field' :req='answer.ismust' :topic='answer.idx' :type='answer.type'>
              <div v-if="answer.qclassify" class='field-classify'>【{{answer.qclassify}}】</div>
              <div v-if="answer.qpremise" class='field-premise'>{{answer.qpremise}}</div>

              <div class='field-label' v-if="answer.type === '1'" v-html="`${answer.code}、 (单选) ${answer.name}`"></div>
              <div class='field-label' v-else-if="answer.type === '2'"
                   v-html="`${answer.code}、 (多选) ${answer.name}`"></div>
              <div class='field-label' v-else v-html="`${answer.code}、 ${answer.name}`"></div>

              <div v-if="answer.qtip" class='field-tip'>{{answer.qtip}}</div>

              <a-type1 v-if="answer.type === '1'" :answer="answer"></a-type1>
              <a-type2 v-else-if="answer.type === '2'" :answer="answer"></a-type2>
              <a-type3 v-else-if="answer.type === '3'" :answer="answer"></a-type3>
              <div class="atype4" v-else>
                <div class="field-select">
                  <div class="text" v-for="(option, index) in answer.option" :key="index" v-if="option.isChecked">{{option.label}}</div>
                  <i class="icon icon-dropdown"></i>
                </div>
              </div>

            </div>
          </fieldset>
        </li>
      </ul>
    </div>
    <div class="iiw-answer-shortcut" @touchstart="onShortcutTouchStart" @touchmove.stop.prevent="onShortcutTouchMove">
      <ul>
        <li v-for="(item, index) in shortcutList" :key="index" class="item" :data-index="index"
            :class="{'current': currentIndex === index}">{{item}}
        </li>
      </ul>
    </div>
    <div class="list-fixed" ref="fixed" v-show="fixedTitle">
      <div class="fixed-title">{{fixedTitle}}</div>
    </div>
  </scroll>
</template>

<script>
import iiwHeader from '@/components/iiw-header/iiw-header'
import Scroll from '@/components/scroll/scroll'
import aType1 from '@/components/questiontype/atype1'
import aType2 from '@/components/questiontype/atype2'
import aType3 from '@/components/questiontype/atype3'
import {getAttrData} from '@/common/js/dom'

// 定义右侧快速入口锚点高度
const ANCHOR_HEIGHT = 26
const TITLE_HEIGHT = 40

export default {
  props: {
    data: {
      type: Array,
      default () {
        return []
      }
    }
  },
  components: {
    iiwHeader,
    Scroll,
    aType1,
    aType2,
    aType3
  },
  created () {
    this.probeType = 3
    this.touch = {}
    this.listenScroll = true
    this.listHeight = []
  },
  data () {
    return {
      scrollY: -1,
      currentIndex: 0,
      diff: -1
    }
  },
  mounted () {
    setTimeout(() => {
      this._calculateHeight()
    }, 20)
  },
  computed: {
    shortcutList () {
      return this.data.map((group) => {
        return group.type.substr(0, 1)
      })
    },
    fixedTitle () {
      if (this.scrollY > 0) {
        return ''
      }
      return this.data[this.currentIndex] ? `${this.data[this.currentIndex].type}、${this.data[this.currentIndex].name}` : ''
    }
  },
  methods: {
    onShortcutTouchStart (e) {
      let anchorIndex = getAttrData(e.target, 'index')
      let firstTouch = e.touches[0]
      this.touch.y1 = firstTouch.pageY
      this.touch.anchorIndex = anchorIndex
      this._scrollTo(anchorIndex)
    },
    onShortcutTouchMove (e) {
      let firstTouch = e.touches[0]
      this.touch.y2 = firstTouch.pageY
      let delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT | 0
      let anchorIndex = parseInt(this.touch.anchorIndex) + delta
      this._scrollTo(anchorIndex)
    },
    scroll (pos) {
      this.scrollY = pos.y
    },
    _scrollTo (index) {
      if (!index && index !== 0) return
      if (index < 0) index = 0
      else if (index > this.listHeight.length - 2) index = this.listHeight.length - 2
      this.scrollY = -this.listHeight[index]
      // scrollToElement(元素，缓动时间)
      this.$refs.answerlist.scrollToElement(this.$refs.listGroup[index], 0)
    },
    _calculateHeight () {
      this.listHeight = []
      const list = this.$refs.listGroup
      // console.log(list)
      let height = 0
      this.listHeight.push(height)
      for (let i = 0; i < list.length; i++) {
        let item = list[i]
        height += item.clientHeight
        this.listHeight.push(height)
      }
    }
  },
  watch: {
    scrollY (newY) {
      const listHeight = this.listHeight
      // 当滚动到顶部，newY>0
      if (newY > 0) {
        this.currentIndex = 0
        return
      }
      // 在中间部分滚动
      for (let i = 0; i < listHeight.length - 1; i++) {
        let height1 = listHeight[i]
        let height2 = listHeight[i + 1]
        if (-newY >= height1 && -newY < height2) {
          this.currentIndex = i
          this.diff = height2 + newY
          return
        }
      }
      // 当滚动到底部，且-newY大于最后一个元素的上限
      this.currentIndex = listHeight.length - 2
    },
    diff (newVal) {
      let fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0
      if (this.fixedTop === fixedTop) {
        return
      }
      this.fixedTop = fixedTop
      this.$refs.fixed.style.transform = `translate3d(0,${fixedTop}px,0)`
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import "~@/common/stylus/variable"
  @import "~@/common/stylus/mixin"

  .answerlist
    position fixed
    top $header-height
    bottom $footer-height
    width 100%
    height 100%
    overflow hidden
    background $color-background

    .answer-content
      width 100%

      ul li
        padding-bottom 50px

        &:last-child
          padding-bottom 200px

        .title
          height 40PX
          line-height 40PX
          padding-left 30px
          font-size $font-size-24
          color $color-white
          background-color $color-header-theme

        fieldset
          display block
          border none
          padding 30px 60px 0
          min-height auto

          .field
            clear both
            width 100%
            font-weight 400
            box-sizing border-box

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
                font-size $font-size-28
                position relative
                min-height 40px
                margin-bottom 50px

                .radiowrapper
                  display block
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

  .iiw-answer-shortcut
    position absolute
    z-index 30
    right 0
    top 40%
    transform translateY(-50%)
    width 20px
    padding 3px
    border-radius 10px
    text-align center
    background-color rgba(255, 255, 255, .8)
    font-family Helvetica

    .item
      padding 4px
      line-height 1
      color $color-text
      font-size $font-size-18

      &.current
        color $color-header-theme

  .list-fixed
    position absolute
    top 0
    left 0
    width 100%

    .fixed-title
      height 40PX
      line-height 40PX
      padding-left 30px
      font-size $font-size-24
      color $color-white
      background-color $color-header-theme
</style>
