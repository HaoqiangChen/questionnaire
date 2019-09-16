<template>
  <div class="score">
    <iiw-header :headerTitle="headerTitle" :rightBtn="rightBtn"></iiw-header>
    <scroll ref="scroll" class="score-content">
      <div class="score-wrapper" v-if="score">
        <scale-face :wjDetail="wjDetail" v-if="wjDetail.userDetail"></scale-face>
        <div class="score-subtext" v-if="score.weidu">一、测评结果及解释</div>
        <div class="score-table" v-if="score.weidu && score.weidu.length" v-for="(group, index) in score.weidu" :key="index">
          <table class="alone-table" v-if="group.alone.length">
            <caption v-if="group.name">{{group.name}}</caption>
            <colgroup>
              <col width="1%">
              <col width="24%">
              <col width="15%">
              <col width="60%">
            </colgroup>
            <thead>
            <th>序号</th>
            <th>维度</th>
            <th>得分</th>
            <th>解释</th>
            </thead>
            <tbody>
            <tr v-for="(item, index) in group.alone" :key="index">
              <td>{{index + 1}}</td>
              <td>{{item.name}}</td>
              <td>{{item.value}}</td>
              <td>{{item.describes}}</td>
            </tr>
            </tbody>
          </table>
          <table border="2" cellpadding=“10” cellspacing="0" class="weidu-table" v-if="group.rows.length">
            <caption v-if="group.name">{{group.name}}</caption>
            <colgroup>
              <col width="1%">
              <col width="24%">
              <col width="15%">
              <col width="60%">
            </colgroup>
            <thead>
            <th>序号</th>
            <th>维度</th>
            <th>得分</th>
            <th>解释</th>
            </thead>
            <tbody>
            <tr v-for="(item, index) in group.rows" :key="index">
              <td>{{index + 1}}</td>
              <td>{{item.name}}</td>
              <td>{{item.value}}</td>
              <td>{{item.describes}}</td>
            </tr>
            <tr v-if="group.total">
              <td colspan="3">平均分</td>
              <td>{{group.total}}</td>
            </tr>
            <tr v-if="score.total && index === 0">
              <td v-if="score.describes" colspan="2">总分</td>
              <td v-else colspan="3">总分</td>
              <td>{{score.total}}</td>
              <td v-if="score.describes">{{score.describes}}</td>
            </tr>
            <tr v-if="score.minutes && index === 0">
              <td colspan="3">答题时长</td>
              <td>{{score.minutes}}</td>
            </tr>
            </tbody>
          </table>
        </div>
<!--        <div id="scoreChart">-->
<!--          <div id="scorePie" style="width: 100%; height: 300px; margin-top: 30px"></div>-->
<!--          <div id="scoreBar" style="width: 100%; height: 300px; margin-top: 30px"></div>-->
<!--        </div>-->
        <div class="score-subtext" v-if="answerList.length">二、作答明细</div>
        <a-scale :answerList="answerList"></a-scale>
      </div>
    </scroll>
<!--    <record v-if="fileUrl" :fileUrl="fileUrl"></record>-->
    <div v-show="showAudit" class="iiw-footer">
      <div class="container">
        <div class="btn danger" @click="reinvestigation">重新调查</div>
        <div class="btn success" @click="audit">审核通过</div>
      </div>
    </div>
    <success :action="action" v-show="showSuccess"></success>
  </div>
</template>

<script>
import axios from 'axios'
import iiwHeader from '@/components/iiw-header/iiw-header'
import {getUrlParam} from '@/common/js/util'
import {ERR_OK} from '@/common/js/global'
import Scroll from '@/components/scroll/scroll'
import scaleFace from '@/components/preface/scaleface'
import aScale from '@/components/questiontype/ascale'
// import record from '@/components/record/record'
import success from '@/components/success/success'
import echarts from 'echarts'

export default {
  components: {
    iiwHeader,
    Scroll,
    scaleFace,
    aScale,
    // record,
    success
  },
  data () {
    return {
      headerTitle: '量表审核',
      rightBtn: 0,
      score: {},
      wjDetail: {},
      answerList: [],
      showSuccess: false,
      action: 'audit',
      fileUrl: '',
      view: ''
    }
  },
  created () {
    this.view = getUrlParam('type')
    if (this.view === 'lbck') this.headerTitle = '量表查看'
    this.getWjData()
  },
  mounted () {
  },
  computed: {
    showAudit () {
      if (this.view === 'lbsh') {
        return true
      } else {
        return false
      }
    }
  },
  methods: {
    getWjData () {
      let loading = this.$weui.loading('量表数据加载中...', {
        className: 'question-loading'
      })
      let ajaxUrl = 'http://iotimc8888.goho.co:17783/security/wjdc/scale.do?action=getQuestionNaireDetail'

      axios.post(`${ajaxUrl}&authorization=${getUrlParam('token')}`, {
        data: {
          filter: {
            id: getUrlParam('paperfk'),
            recordfk: getUrlParam('recordfk')
          }
        }
      }).then((res) => {
        // console.log(res)
        if (res.data.status === ERR_OK) {
          this.answerList = res.data.result.rows[0].question
          if (!this.answerList.length) {
            this.$weui.alert('抱歉，无该量表数据! 点击确认返回。', () => {
              this.backToApp()
            })
          }

          let detail = {
            name: res.data.result.rows[0].name,
            // usertype: res.data.result.rows[0].usertype,
            introduce: res.data.result.rows[0].introduce
          }
          this.wjDetail = detail
          this.wjDetail.userDetail = res.data.result.rows[0].userdetail
          if (this.wjDetail.userDetail.fileurl) {
            this.fileUrl = `http://iotimc8888.goho.co:17783/security/deviceComm.do?action=getFileDetail&authorization=${getUrlParam('token')}&url=${this.wjDetail.userDetail.fileurl}`
          }

          this.getScore()
          loading.hide()
        } else {
          loading.hide(() => {
            console.log(res.data.stacktrace.substring(0, 300))
            this.$weui.alert(`${res.data.message} <br/>点击确认返回。`, () => {
              this.backToApp()
            }, {
              title: '请求失败'
            })
          })
        }
      }).catch((err) => {
        console.log(err)
        loading.hide(() => {
          console.log(err)
          this.$weui.alert(`${err} <br/>点击确认返回。`, () => {
            this.backToApp()
          }, {
            title: '请求失败'
          })
        })
      })
    },
    getScore () {
      let ajaxUrl = 'http://iotimc8888.goho.co:17783/security/wjdc/scale.do?action=getQuestionNaireScore'

      axios.post(`${ajaxUrl}&authorization=${getUrlParam('token')}`, {
        data: {
          filter: {
            id: getUrlParam('recordfk')
          }
        }
      }).then((res) => {
        // console.log(res)
        if (res.data.status === ERR_OK) {
          this.score = res.data.result.rows[0]
          // console.log(this.score)
          if (!this.score.weidu.length) {
            this.$weui.alert('该量表无需计分， 点击确认返回。', () => {
              console.log('该量表无需计分，点击确定返回APP')
              this.backToApp()
            }, {
              title: '提示'
            })
          }
          this.score.weidu.map(_a => {
            _a.alone = []
            _a.rows.map(_b => {
              if (_b.alone === 'Y') {
                _a.alone.push(_b)
              }
            })
            _a.rows = _a.rows.filter(v => v.alone !== 'Y')
          })
          // this.drawLine()
        } else {
          console.log(res.data.stacktrace.substring(0, 300))
          this.$weui.alert(`${res.data.message}  点击确认返回。`, () => {
            this.backToApp()
          }, {
            title: '请求失败'
          })
        }
      }).catch((err) => {
        console.log(err)
        this.$weui.alert(`${err} <br/>点击确认返回。`, () => {
          this.backToApp()
        }, {
          title: '请求失败'
        })
      })
    },
    drawLine () {
      // 基于准备好的dom，初始化echarts实例
      let scorePie = echarts.init(document.getElementById('scorePie'))
      // let scoreBar = echarts.init(document.getElementById('scoreBar'))
      // 绘制饼图
      scorePie.setOption({
        title: {
          text: '量表的总分以及各维度分数',
          subtext: '饼图',
          x: 'center'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          data: this.score.weidu.map(_ => _.name)
        },
        series: [
          {
            name: '分数',
            type: 'pie',
            radius: '55%',
            center: ['50%', '60%'],
            data: this.score.weidu,
            itemStyle: {
              emphasis: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      })
      // 绘制柱形图
      // scoreBar.setOption({
      //   title: {text: '柱形图'},
      //   tooltip: {},
      //   xAxis: {
      //     data: this.score.weidu.map(_ => _.name)
      //   },
      //   yAxis: {},
      //   series: [{
      //     name: '分数',
      //     type: 'bar',
      //     data: this.score.weidu.map(_ => _.value)
      //   }]
      // })
    },
    reinvestigation () {
      this.$weui.confirm('重新调查会将问卷打回重新访问，请问是否确定？', () => {
        // console.log('返回问卷')
        let ajaxUrl = 'http://iotimc8888.goho.co:17783/security/wjdc/scale.do?action=modTalkRecord'
        axios.post(`${ajaxUrl}&authorization=${getUrlParam('token')}`, {
          data: {
            filter: {
              id: getUrlParam('recordfk'),
              fileUrl: getUrlParam('fileUrl'),
              status: 'N'
            }
          }
        }).then((res) => {
          // console.log(res)
          if (res.data.status === ERR_OK) {
            this.$weui.toast('操作成功', {
              duration: 300
            })
            setTimeout(() => {
              this.backToApp()
            }, 300)
          } else {
            this.$weui.toast('操作失败，请重新操作', {
              duration: 500
            })
          }
        }).catch((err) => {
          console.log(err)
          this.$weui.alert(`${err} <br/>点击确认返回。`, () => {
            this.backToApp()
          }, {
            title: '请求失败'
          })
        })
      }, () => {
        console.log('取消重新调查')
      }, {
        title: '是否确定重新调查'
      })
    },
    audit () {
      let loading = this.$weui.loading('提交审核中...', {
        className: 'question-loading'
      })
      let ajaxUrl = 'http://iotimc8888.goho.co:17783/security/wjdc/scale.do?action=modTalkRecord'

      axios.post(`${ajaxUrl}&authorization=${getUrlParam('token')}`, {
        data: {
          filter: {
            id: getUrlParam('recordfk'),
            fileUrl: getUrlParam('fileUrl')
          }
        }
      }).then((res) => {
        // console.log(res)
        if (res.data.status === ERR_OK) {
          loading.hide(() => {
            this.$weui.toast('操作成功', {
              duration: 300
            })
            setTimeout(() => {
              this.showSuccess = true
            }, 300)
          })
        } else {
          this.$weui.toast('操作失败，请重新提交', {
            duration: 500
          })
        }
      }).catch((err) => {
        console.log(err)
        loading.hide(() => {
          console.log(err)
          this.$weui.alert(`${err} <br/>点击确认返回。`, () => {
            this.backToApp()
          }, {
            title: '请求失败'
          })
        })
      })
    },
    backToApp () {
      window.WebViewJavascriptBridge.callHandler('question', {'action': 'finish'})
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import "~@/common/stylus/variable"

  .score-content
    position fixed
    top 40PX
    bottom 60PX
    width 100%

  .score-wrapper
    padding 40px 30px

    .score-subtext
      margin 30px 0
      font-size $font-size-30
      font-weight bold

    table
      margin-top 40px
      width 100%
      font-size $font-size-26
      text-align center

      caption, th
        border 1px solid $color-theme
        padding 10px 0
        font-weight bold
        vertical-align middle

      td
        border 1px solid $color-theme
        padding 10px 0
        text-align center
        vertical-align middle

        &:nth-child(4)
          font-size $font-size-20
          line-height 1.5

  .iiw-footer
    position fixed
    bottom 0
    width 100%
    height 60px
    font-size $font-size-18
    background-color $color-background

    .container
      position relative
      display flex
      justify-content center
      align-items center
      font-size $font-size-16
      color $color-white
      padding 10px 0

      &:after
        display block
        position absolute
        top 0
        left 0
        width 100%
        border-top 1px solid #a4b3c1
        content ''

      .btn
        box-sizing border-box
        width 40%
        text-align center
        padding 12px 0
        border-radius 3px

        &.danger
          background-color #f00
          margin-right 8%

        &.success
          background-color #090

</style>
