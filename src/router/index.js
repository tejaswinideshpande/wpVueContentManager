import Vue from 'vue'
import Router from 'vue-router'
import Drafts from './../components/Drafts.vue'
import Pending from './../components/Pending.vue'
import Scheduled from './../components/Scheduled.vue'
import Login from './../components/Login.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Login',
      component: Login,
	  props: true
    },
    {
      path: '/drafts', 
      name: 'Drafts',
      component: Drafts,
	  props: true
    },
	{
      path: '/pending', 
      name: 'Pending',
      component: Pending,
	  props: true
    },
	{
      path: '/scheduled', 
      name: 'Scheduled',
      component: Scheduled,
	  props: true
    },
  ],
  scrollBehavior (to, from, savedPosition) { // gives normal scolling behavior through app
    if (savedPosition) {
      return savedPosition
    } else {
      return { x: 0, y: 0 }
    }
  }
})
