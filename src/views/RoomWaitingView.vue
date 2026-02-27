<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useRoomStore } from '@/stores/room'
import { useGameStore } from '@/stores/game'
import { useUserStore } from '@/stores/user'
import { gameService } from '@/services/game.mock'
import type { Participant } from '@/types'

const router = useRouter()
const route = useRoute()
const roomStore = useRoomStore()
const gameStore = useGameStore()
const userStore = useUserStore()

const pin = route.params.pin as string

onMounted(() => {
  if (!roomStore.roomInfo) {
    router.replace('/lobby')
    return
  }

  gameService.setCallbacks({
    onParticipantJoined(p: Participant) {
      roomStore.addParticipant(p)
    },
    onParticipantLeft(id: string) {
      roomStore.removeParticipant(id)
    },
    onGameStarted() {
      router.push(`/room/${pin}/game`)
    },
    onRoomClosed() {
      roomStore.clearRoom()
      router.replace('/lobby')
    },
    onQuestionStart(payload) {
      gameStore.startQuestion(payload.question, payload.questionIndex, payload.totalQuestions)
    },
    onAnswerLocked() {
      /* waiting view에서는 처리 불필요 */
    },
    onQuestionEnd(payload) {
      gameStore.revealAnswer(
        payload.correctChoiceId,
        payload.earnedScore,
        payload.isCorrect,
        payload.leaderboard,
      )
    },
    onGameEnd(leaderboard) {
      gameStore.endGame(leaderboard)
      router.push(`/room/${pin}/result`)
    },
  })
})

onUnmounted(() => {
  // 페이지를 벗어날 때 콜백은 GameView에서 재등록하므로 여기서는 초기화하지 않음
})

function startGame() {
  gameService.startGame()
}

function leaveRoom() {
  gameService.leaveRoom()
  roomStore.clearRoom()
  router.push('/lobby')
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-4">
    <div class="max-w-lg mx-auto">
      <div class="pt-6 pb-4 flex items-center justify-between">
        <button class="text-white/50 hover:text-white text-sm" @click="leaveRoom">
          {{ roomStore.isHost ? '방 닫기' : '나가기' }}
        </button>
        <span class="text-white/60 text-sm">
          {{ roomStore.roomInfo?.questionSetTitle }}
        </span>
      </div>

      <!-- PIN 표시 -->
      <div class="bg-white/10 backdrop-blur rounded-2xl p-6 text-center mb-4">
        <p class="text-white/60 text-sm mb-1">참여 코드 (PIN)</p>
        <p class="text-white font-black text-5xl tracking-widest">{{ pin }}</p>
        <p class="text-white/50 text-xs mt-2">이 코드를 팀원에게 공유하세요</p>
      </div>

      <!-- 참여자 목록 -->
      <div class="bg-white/10 backdrop-blur rounded-2xl p-4 mb-4">
        <p class="text-white/60 text-sm mb-3">
          참여자 {{ roomStore.roomInfo?.participants.length ?? 0 }}명
        </p>
        <div class="grid grid-cols-4 gap-2">
          <div
            v-for="participant in roomStore.roomInfo?.participants"
            :key="participant.id"
            class="flex flex-col items-center gap-1"
          >
            <div class="text-3xl">{{ participant.emoji }}</div>
            <span class="text-white text-xs font-bold text-center truncate w-full text-center">
              {{ participant.nickname }}
            </span>
            <span v-if="participant.isHost" class="text-yellow-400 text-xs">방장</span>
          </div>
        </div>
      </div>

      <!-- 방장 시작 버튼 / 참여자 대기 메시지 -->
      <div v-if="roomStore.isHost">
        <button
          class="w-full bg-green-500 hover:bg-green-400 text-white font-black text-xl py-5 rounded-2xl transition-all active:scale-95"
          @click="startGame"
        >
          🚀 퀴즈 시작!
        </button>
      </div>
      <div v-else class="text-center py-6">
        <div class="flex items-center justify-center gap-2">
          <div class="w-2 h-2 bg-white/60 rounded-full animate-bounce" style="animation-delay: 0ms" />
          <div class="w-2 h-2 bg-white/60 rounded-full animate-bounce" style="animation-delay: 150ms" />
          <div class="w-2 h-2 bg-white/60 rounded-full animate-bounce" style="animation-delay: 300ms" />
        </div>
        <p class="text-white/60 mt-3 text-sm">방장이 퀴즈를 시작하길 기다리는 중...</p>
      </div>

      <!-- 내 프로필 -->
      <div class="text-center mt-4">
        <span class="text-2xl">{{ userStore.emoji }}</span>
        <span class="text-white/60 text-sm ml-2">{{ userStore.nickname }}으로 참여 중</span>
      </div>
    </div>
  </div>
</template>
