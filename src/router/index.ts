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

  // 프로필 설정 페이지는 로그인만 되면 통과
  if (to.name === 'setup') return true

  // 프로필 미설정 → 설정으로
  if (!userStore.isProfileSet) return { name: 'setup' }

  return true
})

export default router
