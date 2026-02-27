<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import EmojiPicker from '@/components/EmojiPicker.vue'

const router = useRouter()
const userStore = useUserStore()

const nickname = ref(userStore.nickname)
const emoji = ref(userStore.emoji || '🦊')

function submit() {
  if (!nickname.value.trim() || !emoji.value) return
  userStore.setProfile(nickname.value.trim(), emoji.value)
  router.push('/lobby')
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <h1 class="text-5xl font-black text-white text-center mb-2 tracking-tight">🎮 퀴즈!</h1>
      <p class="text-white/60 text-center mb-8">팀 워크샵 퀴즈 플랫폼</p>

      <div class="bg-white/10 backdrop-blur rounded-2xl p-6 flex flex-col gap-6">
        <!-- 닉네임 -->
        <div>
          <label class="text-white font-bold text-sm block mb-2">닉네임</label>
          <input
            v-model="nickname"
            type="text"
            maxlength="12"
            placeholder="닉네임을 입력하세요"
            class="w-full bg-white/20 text-white placeholder-white/40 rounded-xl px-4 py-3 font-bold outline-none focus:ring-2 focus:ring-white/50"
            @keyup.enter="submit"
          />
        </div>

        <!-- 캐릭터 선택 -->
        <div>
          <label class="text-white font-bold text-sm block mb-2">캐릭터 선택</label>
          <div class="mb-3 flex items-center gap-3">
            <span class="text-4xl">{{ emoji }}</span>
            <span class="text-white/70 text-sm">선택된 캐릭터</span>
          </div>
          <EmojiPicker v-model="emoji" />
        </div>

        <button
          class="w-full bg-white text-purple-900 font-black text-lg py-4 rounded-xl hover:bg-white/90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="!nickname.trim() || !emoji"
          @click="submit"
        >
          시작하기 →
        </button>
      </div>
    </div>
  </div>
</template>
