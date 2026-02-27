import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/lobby',
      name: 'lobby',
      component: () => import('@/views/LobbyView.vue'),
    },
    {
      path: '/questions',
      name: 'question-list',
      component: () => import('@/views/QuestionSetListView.vue'),
    },
    {
      path: '/questions/new',
      name: 'question-new',
      component: () => import('@/views/QuestionSetFormView.vue'),
    },
    {
      path: '/questions/:id',
      name: 'question-edit',
      component: () => import('@/views/QuestionSetFormView.vue'),
    },
    {
      path: '/room/:pin/waiting',
      name: 'room-waiting',
      component: () => import('@/views/RoomWaitingView.vue'),
    },
    {
      path: '/room/:pin/game',
      name: 'room-game',
      component: () => import('@/views/GameView.vue'),
    },
    {
      path: '/room/:pin/result',
      name: 'room-result',
      component: () => import('@/views/ResultView.vue'),
    },
  ],
})

router.beforeEach((to) => {
  if (to.name === 'home') return true
  const userStore = useUserStore()
  if (!userStore.isProfileSet) return { name: 'home' }
  return true
})

export default router
