import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
    },
    {
      path: '/',
      redirect: () => {
        const userStore = useUserStore()
        return userStore.isLoggedIn ? '/lobby' : '/login'
      },
    },
    {
      path: '/setup',
      name: 'setup',
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
      path: '/room/new/waiting',
      name: 'room-create-waiting',
      component: () => import('@/views/RoomWaitingView.vue'),
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
  const userStore = useUserStore()

  // 로그인 페이지: 이미 로그인 상태면 로비로
  if (to.name === 'login') {
    if (userStore.isLoggedIn) return { name: 'lobby' }
    return true
  }

  // 미인증 → 로그인으로
  if (!userStore.isLoggedIn) return { name: 'login' }

  return true
})

export default router
