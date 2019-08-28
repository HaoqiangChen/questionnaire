import Vue from 'vue'
import Router from 'vue-router'
import {getUrlParam} from '@/common/js/util'
import scale from '@/components/scale/scale'
import scaleOff from '@/components/scale/scaleoff'
import survey from '@/components/survey/survey'
import surveyOff from '@/components/survey/surveyoff'
import score from '@/components/score/score'
import scoreOff from '@/components/score/scoreoff'
import audit from '@/components/audit/audit'
import auditOff from '@/components/audit/auditoff'
import extra from '@/components/extra/extra'

import lbdc from '@/components/scale/lbdc'
import wjdc from '@/components/survey/wjdc'
import lbck from '@/components/score/lbck'
import wjck from '@/components/audit/wjck'

Vue.use(Router)

const type = getUrlParam('type')
const isonline = parseInt(getUrlParam('isonline'))
// alert(window.location.href)
// alert(getUrlParam('recordfk'))
let index = ''

if (type === 'lbdc' && isonline === 3) {
  index = '/lbdc'
} else if (type === 'wjdc' && isonline === 3) {
  index = '/wjdc'
} else if ((type === 'lbsh' || type === 'lbck') && isonline === 3) {
  index = '/lbck'
} else if ((type === 'wjsh' || type === 'wjck') && isonline === 3) {
  index = '/wjck'
} else if (type === 'lbdc' && !isonline) {
  index = '/scaleoff'
} else if (type === 'wjdc' && !isonline) {
  index = '/surveyoff'
} else if (type === 'lbdc') {
  index = '/scale'
} else if (type === 'wjdc') {
  index = '/survey'
} else if ((type === 'lbsh' || type === 'lbck') && !isonline) {
  index = '/scoreoff'
} else if (type === 'lbsh' || type === 'lbck') {
  index = '/score'
} else if ((type === 'wjsh' || type === 'wjck') && !isonline) {
  index = '/auditoff'
} else if (type === 'wjsh' || type === 'wjck') {
  index = '/audit'
} else if (type === 'extradc') {
  index = '/extra'
}

export default new Router({
  // mode: 'history',
  routes: [
    {
      path: '/',
      redirect: index
    },
    {
      path: '/lbdc',
      component: lbdc
    },
    {
      path: '/wjdc',
      component: wjdc
    },
    {
      path: '/lbck',
      component: lbck
    },
    {
      path: '/wjck',
      component: wjck
    },

    {
      path: '/scale',
      component: scale
    },
    {
      path: '/scaleoff',
      component: scaleOff
    },
    {
      path: '/survey',
      component: survey
    },
    {
      path: '/surveyoff',
      component: surveyOff
    },
    {
      path: '/score',
      component: score
    },
    {
      path: '/scoreoff',
      component: scoreOff
    },
    {
      path: '/audit',
      component: audit
    },
    {
      path: '/auditoff',
      component: auditOff
    },
    {
      path: '/extra',
      component: extra
    }
  ]
})
