<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useQuestionStore } from '@/stores/question'
import type { OAuthProvider } from '@/types'

const router = useRouter()
const userStore = useUserStore()
const questionStore = useQuestionStore()

async function handleLogin(provider: OAuthProvider) {
  userStore.login(provider)
  questionStore.reload()

  if (userStore.isProfileSet) {
    router.push('/lobby')
  } else {
    router.push('/setup')
  }
}

const PROVIDERS: { id: OAuthProvider; label: string; emoji: string; bg: string; text: string }[] = [
  {
    id: 'google',
    label: 'Google로 시작하기',
    emoji: '🔵',
    bg: 'bg-white hover:bg-gray-50',
    text: 'text-gray-800',
  },
  {
    id: 'kakao',
    label: '카카오로 시작하기',
    emoji: '💛',
    bg: 'bg-yellow-400 hover:bg-yellow-300',
    text: 'text-gray-900',
  },
  {
    id: 'github',
    label: 'GitHub으로 시작하기',
    emoji: '⚫',
    bg: 'bg-gray-900 hover:bg-gray-800',
    text: 'text-white',
  },
]
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center p-4">
    <div class="w-full max-w-sm flex flex-col items-center gap-8">
      <!-- 로고 -->
      <div class="text-center">
        <h1 class="text-6xl font-black text-white tracking-tight">🎮 QUIZZZ</h1>
        <p class="text-white/60 mt-2">팀 워크샵 퀴즈 플랫폼</p>
      </div>

      <!-- 소셜 로그인 버튼 -->
      <div class="w-full flex flex-col gap-3">
        <button
          v-for="p in PROVIDERS"
          :key="p.id"
          class="w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold text-base transition-all active:scale-95"
          :class="[p.bg, p.text]"
          @click="handleLogin(p.id)"
        >
          <span class="text-xl">{{ p.emoji }}</span>
          <span class="flex-1 text-left">{{ p.label }}</span>
          <span class="text-sm opacity-60">→</span>
        </button>
      </div>

      <!-- 안내 문구 -->
      <p class="text-white/30 text-xs text-center leading-relaxed">
        소셜 계정으로 로그인하면 나만의 문제 세트를 저장하고<br />
        언제든지 다시 사용할 수 있어요
      </p>
    </div>
  </div>
</template>
