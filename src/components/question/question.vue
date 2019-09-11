<template>
  <div class="question">
    <div class='field' :topic='question.idx' :type='question.type'>

      <div v-if="question.qclassify" class='field-classify'>【{{question.qclassify}}】</div>
      <div v-if="question.qpremise" class='field-premise'>{{question.qpremise}}</div>

      <div class='field-label' v-if="question.type === '1'"
           v-html="`${question.code}、 (单选) ${question.name}`"></div>
      <div class='field-label' v-else-if="question.type === '2'"
           v-html="`${question.code}、 (多选) ${question.name}`"></div>
      <div class='field-label' v-else v-html="`${question.code}、${question.name}`"></div>

      <div v-if="question.qtip" class='field-tip'>{{question.qtip}}</div>

      <q-type1 v-if="question.type === '1'" :question.sync="question" @radioGoNext="radioGoNext"></q-type1>
      <q-type2 v-else-if="question.type === '2'" :question="question"></q-type2>
      <q-type3 v-else-if="question.type === '3'" :question="question"></q-type3>
      <q-type4 v-else :question="question"></q-type4>

    </div>
  </div>
</template>

<script>
import qType1 from '@/components/questiontype/qtype1'
import qType2 from '@/components/questiontype/qtype2'
import qType4 from '@/components/questiontype/qtype4'
import {getLocalAnswer, deleteQuestionAnswer} from '@/common/js/cache'

export default {
  props: {
    question: {
      type: Object
    }
  },
  components: {
    qType1,
    qType2,
    qType4
  },
  data () {
    return {}
  },
  created () {
    this.init()
  },
  computed: {},
  mounted () {
  },
  methods: {
    init () {
      if (this.question.relationSkip) {
        this.$emit('goSkip', parseInt(this.question.idx))
        return false
      } else if (this.question.relation && this.question.relation !== '') { // 题目关联逻辑
        let relation = false
        let answer = getLocalAnswer()

        // 获取题目关联配置
        let relationOption = JSON.parse(this.question.relation).option
        // 获取题目关联配置的逻辑运算符
        let relationLogic = JSON.parse(this.question.relation).logic
        // 获取题目关联配置的跳题序号
        let relationJumpto = JSON.parse(this.question.relation).jumpto

        for (let i = 0; i < relationOption.length; i++) {
          let relationId = relationOption[i].split(',')[0]
          let relationFk = relationOption[i].split(',')[1]
          let relationQestion = answer.filter(_ => parseInt(_.idx) === parseInt(relationId))

          if (!relationQestion.length) {
            relation = false
            break
          } else {
            if (!(relationQestion[0].option.filter(_ => _.isChecked).map(_ => _.optionfk).includes(relationFk))) {
              relation = false
            } else {
              relation = true
            }
          }
          if (relationLogic && relationLogic === '&' && !relation) {
            relation = false
            break
          } else if ((!relationLogic || relationLogic !== '&') && relation) {
            relation = true
            break
          }
        }

        if (!relation && relationJumpto) {
          this.$emit('goSkip', parseInt(relationJumpto))
        } else if (!relation) {
          deleteQuestionAnswer(parseInt(this.question.idx))
          this.$emit('goSkip', parseInt(this.question.idx) + 1)
        }
      }
    },
    radioGoNext (data) {
      this.$emit('radioGoNext', data)
    }
  },
  watch: {}
}
</script>

<style lang="stylus" scoped>
  @import "~@/common/stylus/variable"
  @import "~@/common/stylus/mixin"

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

</style>
