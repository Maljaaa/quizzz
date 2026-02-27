<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useRoomStore } from '@/stores/room'

const router = useRouter()
const userStore = useUserStore()
const roomStore = useRoomStore()

const pinInput = ref('')
const joinError = ref('')

function goToQuestions() {
  router.push('/questions')
}

function joinRoom() {
  joinError.value = ''
  const pin = pinInput.value.trim()
  if (!pin || pin.length !== 6) {
    joinError.value = '6자리 PIN을 입력해주세요'
    return
  }
  const success = roomStore.joinRoom(pin)
  if (!success) {
    joinError.value = '방을 찾을 수 없거나 이미 시작된 방입니다'
    return
  }
  router.push(`/room/${pin}/waiting`)
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center p-4">
    <div class="w-full max-w-md flex flex-col gap-4">
      <!-- 헤더 -->
      <div class="text-center mb-2">
        <span class="text-3xl">{{ userStore.emoji }}</span>
        <span class="text-white font-bold ml-2">{{ userStore.nickname }}</span>
      </div>

      <!-- 방 만들기 -->
      <div class="bg-white/10 backdrop-blur rounded-2xl p-6">
        <h2 class="text-white font-black text-xl mb-1">방 만들기</h2>
        <p class="text-white/60 text-sm mb-4">문제 세트를 선택해 퀴즈 방을 열어보세요</p>
        <button
          class="w-full bg-purple-500 hover:bg-purple-400 text-white font-bold py-3 rounded-xl transition-all active:scale-95"
          @click="goToQuestions"
        >
          📝 문제 세트 관리 / 방 만들기
        </button>
      </div>

      <!-- 방 참여하기 -->
      <div class="bg-white/10 backdrop-blur rounded-2xl p-6">
        <h2 class="text-white font-black text-xl mb-1">방 참여하기</h2>
        <p class="text-white/60 text-sm mb-4">방장에게 받은 6자리 PIN을 입력하세요</p>
        <div class="flex gap-2">
          <input
            v-model="pinInput"
            type="text"
            maxlength="6"
            inputmode="numeric"
            placeholder="123456"
            class="flex-1 bg-white/20 text-white placeholder-white/40 rounded-xl px-4 py-3 font-bold text-center text-xl outline-none focus:ring-2 focus:ring-white/50 tracking-widest"
            @keyup.enter="joinRoom"
          />
          <button
            class="bg-green-500 hover:bg-green-400 text-white font-bold px-5 rounded-xl transition-all active:scale-95"
            @click="joinRoom"
          >
            입장
          </button>
        </div>
        <p v-if="joinError" class="text-red-300 text-sm mt-2">{{ joinError }}</p>
      </div>

      <!-- 프로필 변경 -->
      <button
        class="text-white/40 text-sm hover:text-white/70 transition-colors text-center"
        @click="router.push('/')"
      >
        ← 프로필 변경
      </button>
    </div>
  </div>
</template>
