<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useGameStore } from '@/stores/game'
import { useRoomStore } from '@/stores/room'
import { useUserStore } from '@/stores/user'
import { gameService } from '@/services/game.mock'
import TimerBar from '@/components/TimerBar.vue'
import ChoiceButton from '@/components/ChoiceButton.vue'
import LeaderBoard from '@/components/LeaderBoard.vue'

const router = useRouter()
const route = useRoute()
const gameStore = useGameStore()
const roomStore = useRoomStore()
const userStore = useUserStore()

const pin = route.params.pin as string

onMounted(() => {
  if (!roomStore.roomInfo) {
    router.replace('/lobby')
    return
  }

  gameService.setCallbacks({
    onParticipantJoined(p) {
      roomStore.addParticipant(p)
    },
    onParticipantLeft(id) {
      roomStore.removeParticipant(id)
    },
    onGameStarted() {
      /* 이미 게임 화면이므로 무시 */
    },
    onQuestionStart(payload) {
      gameStore.startQuestion(payload.question, payload.questionIndex, payload.totalQuestions)
    },
    onAnswerLocked() {
      /* 이미 선택 반영됨 */
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
    onRoomClosed() {
      roomStore.clearRoom()
      gameStore.reset()
      router.replace('/lobby')
    },
  })
})

function selectAnswer(choiceId: string) {
  if (gameStore.isAnswerLocked || gameStore.phase !== 'question') return
  gameStore.lockAnswer(choiceId)
  gameService.submitAnswer(choiceId)
}

function nextQuestion() {
  gameService.nextQuestion()
}

function getChoiceCorrect(choiceId: string): boolean | undefined {
  if (gameStore.phase === 'question') return undefined
  const correctId = gameStore.currentQuestion?.correctChoiceId
  if (gameStore.phase === 'answer_reveal' || gameStore.phase === 'leaderboard') {
    return choiceId === correctId
  }
  return undefined
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex flex-col">
    <!-- 진행 헤더 -->
    <div class="px-4 pt-4 pb-2">
      <div class="flex items-center justify-between mb-3">
        <span class="text-white/60 text-sm">
          {{ gameStore.questionIndex + 1 }} / {{ gameStore.totalQuestions }}
        </span>
        <span class="text-white/60 text-sm">{{ roomStore.roomInfo?.questionSetTitle }}</span>
      </div>
      <TimerBar
        v-if="gameStore.phase === 'question'"
        :time-left="gameStore.timeLeft"
        :time-limit="gameStore.currentQuestion?.timeLimit ?? 20"
      />
    </div>

    <!-- 질문 -->
    <div class="flex-1 flex flex-col px-4 gap-4">
      <!-- phase: question / answer_reveal -->
      <template v-if="gameStore.phase !== 'leaderboard'">
        <div class="bg-white/10 backdrop-blur rounded-2xl p-6 text-center min-h-32 flex items-center justify-center">
          <p class="text-white font-bold text-xl leading-relaxed">
            {{ gameStore.currentQuestion?.text }}
          </p>
        </div>

        <!-- 정답 공개 피드백 -->
        <div v-if="gameStore.phase === 'answer_reveal'" class="text-center py-2">
          <div v-if="gameStore.isCorrect" class="text-green-400 font-black text-2xl animate-bounce">
            🎉 정답! +{{ gameStore.earnedScore.toLocaleString() }}점
          </div>
          <div v-else class="text-red-400 font-black text-2xl">
            😢 오답...
          </div>
        </div>

        <!-- 답변 버튼 -->
        <div class="grid grid-cols-2 gap-3 pb-4">
          <ChoiceButton
            v-for="(choice, i) in gameStore.currentQuestion?.choices"
            :key="choice.id"
            :index="i"
            :text="choice.text"
            :disabled="gameStore.isAnswerLocked || gameStore.phase !== 'question'"
            :selected="gameStore.selectedChoiceId === choice.id"
            :correct="getChoiceCorrect(choice.id)"
            @click="selectAnswer(choice.id)"
          />
        </div>

        <!-- 답변 완료 메시지 -->
        <div v-if="gameStore.isAnswerLocked && gameStore.phase === 'question'" class="text-center text-white/70 text-sm pb-4">
          ✅ 답변 완료! 다른 참여자를 기다리는 중...
        </div>
      </template>

      <!-- phase: leaderboard -->
      <template v-else>
        <div class="flex-1 flex flex-col gap-4 pb-4">
          <h2 class="text-white font-black text-xl text-center">
            {{ gameStore.questionIndex + 1 === gameStore.totalQuestions ? '최종 순위' : '중간 순위' }}
          </h2>
          <LeaderBoard
            :entries="gameStore.leaderboard"
            :highlight-id="userStore.id"
          />

          <!-- 방장: 다음 문제 버튼 -->
          <div v-if="roomStore.isHost" class="mt-auto">
            <button
              v-if="gameStore.questionIndex + 1 < gameStore.totalQuestions"
              class="w-full bg-purple-500 hover:bg-purple-400 text-white font-black text-lg py-4 rounded-2xl transition-all active:scale-95"
              @click="nextQuestion"
            >
              다음 문제 →
            </button>
          </div>
          <!-- 참여자: 다음 문제 대기 -->
          <div v-else-if="gameStore.questionIndex + 1 < gameStore.totalQuestions" class="text-center text-white/60 text-sm">
            방장이 다음 문제를 눌러주길 기다리는 중...
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
