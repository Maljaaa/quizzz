<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useGameStore } from '@/stores/game'
import { useRoomStore } from '@/stores/room'
import { useUserStore } from '@/stores/user'
import { gameService } from '@/services/game.mock'
import LeaderBoard from '@/components/LeaderBoard.vue'

const router = useRouter()
useRoute()
const gameStore = useGameStore()
const roomStore = useRoomStore()
const userStore = useUserStore()

const myRank = gameStore.leaderboard.find((e) => e.participantId === userStore.id)

onMounted(() => {
  if (!roomStore.roomInfo) {
    router.replace('/lobby')
  }
})

function leaveRoom() {
  gameService.leaveRoom()
  roomStore.clearRoom()
  gameStore.reset()
  router.push('/lobby')
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-4">
    <div class="max-w-lg mx-auto flex flex-col gap-4 pt-6">
      <!-- 헤더 -->
      <div class="text-center">
        <p class="text-5xl mb-2">🏆</p>
        <h1 class="text-white font-black text-3xl">최종 결과</h1>
        <p class="text-white/60 text-sm mt-1">{{ roomStore.roomInfo?.questionSetTitle }}</p>
      </div>

      <!-- 내 순위 -->
      <div v-if="myRank" class="bg-white/20 backdrop-blur rounded-2xl p-4 text-center">
        <p class="text-white/70 text-sm">나의 최종 순위</p>
        <p class="text-white font-black text-4xl">
          {{ myRank.rank === 1 ? '🥇' : myRank.rank === 2 ? '🥈' : myRank.rank === 3 ? '🥉' : `${myRank.rank}위` }}
        </p>
        <p class="text-white text-xl font-bold mt-1">{{ myRank.score.toLocaleString() }}점</p>
      </div>

      <!-- 전체 순위 -->
      <div class="bg-white/10 backdrop-blur rounded-2xl p-4">
        <h2 class="text-white font-bold text-sm mb-3">전체 순위</h2>
        <LeaderBoard
          :entries="gameStore.leaderboard"
          :highlight-id="userStore.id"
        />
      </div>

      <!-- 나가기 -->
      <button
        class="w-full bg-white/20 hover:bg-white/30 text-white font-bold py-4 rounded-2xl transition-all"
        @click="leaveRoom"
      >
        로비로 돌아가기
      </button>
    </div>
  </div>
</template>
