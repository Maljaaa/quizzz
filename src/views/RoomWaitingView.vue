<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useRoomStore } from '@/stores/room'
import { useGameStore } from '@/stores/game'
import { useUserStore } from '@/stores/user'
import { useQuestionStore } from '@/stores/question'
import { gameService } from '@/services/game.mock'
import EmojiPicker from '@/components/EmojiPicker.vue'
import type { Participant } from '@/types'

const router = useRouter()
const route = useRoute()
const roomStore = useRoomStore()
const gameStore = useGameStore()
const userStore = useUserStore()
const questionStore = useQuestionStore()

const pin = route.params.pin as string | undefined
const isCreateMode = !pin || pin === 'new'

// Profile setup state — 마지막 사용값을 localStorage에서 직접 읽어 프리필
const savedProfile = userStore.id
  ? (() => { try { return JSON.parse(localStorage.getItem(`quizzz_profile_${userStore.id}`) ?? 'null') } catch { return null } })()
  : null

const profileReady = ref(false)
const nicknameInput = ref<string>(savedProfile?.nickname ?? '')
const emojiInput = ref<string>(savedProfile?.emoji ?? '🦊')
const profileError = ref('')

// The actual PIN (known after room creation)
const actualPin = computed(() => roomStore.roomInfo?.pin ?? pin ?? '')

function setupCallbacks() {
  gameService.setCallbacks({
    onParticipantJoined(p: Participant) {
      roomStore.addParticipant(p)
    },
    onParticipantLeft(id: string) {
      roomStore.removeParticipant(id)
    },
    onGameStarted() {
      router.push(`/room/${actualPin.value}/game`)
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
      router.push(`/room/${actualPin.value}/result`)
    },
  })
}

function submitProfile() {
  profileError.value = ''
  const trimmed = nicknameInput.value.trim()
  if (!trimmed) {
    profileError.value = '닉네임을 입력해주세요'
    return
  }

  userStore.setProfile(trimmed, emojiInput.value)

  if (isCreateMode) {
    const state = history.state as Record<string, unknown>
    const questionSetId = typeof state.questionSetId === 'string' ? state.questionSetId : null
    if (!questionSetId) {
      router.replace('/questions')
      return
    }
    const set = questionStore.getQuestionSet(questionSetId)
    if (!set) {
      router.replace('/questions')
      return
    }
    roomStore.createRoom(set)
  } else {
    const success = roomStore.joinRoom(pin!)
    if (!success) {
      profileError.value = '방을 찾을 수 없거나 이미 시작된 방입니다'
      return
    }
  }

  profileReady.value = true
  setupCallbacks()
}

function startGame() {
  gameService.startGame()
}

function leaveRoom() {
  gameService.leaveRoom()
  roomStore.clearRoom()
  userStore.clearProfile()
  router.push('/lobby')
}

onMounted(() => {
  // 이미 방에 입장된 상태라면 프로필 설정 단계 건너뜀 (ex: 게임 뷰에서 뒤로가기)
  if (roomStore.roomInfo) {
    profileReady.value = true
    setupCallbacks()
  }
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center p-4">

    <!-- 프로필 설정 단계 -->
    <div v-if="!profileReady" class="w-full max-w-md">
      <div class="text-center mb-6">
        <h1 class="text-white font-black text-2xl">
          {{ isCreateMode ? '방 만들기' : '방 참여하기' }}
        </h1>
        <p class="text-white/60 text-sm mt-1">이 방에서 사용할 닉네임과 캐릭터를 설정하세요</p>
      </div>

      <div class="bg-white/10 backdrop-blur rounded-2xl p-6 flex flex-col gap-5">
        <!-- 닉네임 -->
        <div>
          <label class="text-white font-bold text-sm block mb-2">닉네임</label>
          <input
            v-model="nicknameInput"
            type="text"
            maxlength="12"
            placeholder="닉네임을 입력하세요"
            class="w-full bg-white/20 text-white placeholder-white/40 rounded-xl px-4 py-3 font-bold outline-none focus:ring-2 focus:ring-white/50"
            @keyup.enter="submitProfile"
          />
        </div>

        <!-- 캐릭터 선택 -->
        <div>
          <label class="text-white font-bold text-sm block mb-2">캐릭터 선택</label>
          <div class="mb-3 flex items-center gap-3">
            <span class="text-4xl">{{ emojiInput }}</span>
            <span class="text-white/70 text-sm">선택된 캐릭터</span>
          </div>
          <EmojiPicker v-model="emojiInput" />
        </div>

        <p v-if="profileError" class="text-red-300 text-sm">{{ profileError }}</p>

        <div class="flex gap-3">
          <button
            class="flex-1 bg-white/20 hover:bg-white/30 text-white font-bold py-3 rounded-xl transition-all"
            @click="router.push('/lobby')"
          >
            취소
          </button>
          <button
            class="flex-1 bg-purple-500 hover:bg-purple-400 text-white font-black py-3 rounded-xl transition-all active:scale-95 disabled:opacity-50"
            :disabled="!nicknameInput.trim()"
            @click="submitProfile"
          >
            {{ isCreateMode ? '방 만들기 →' : '입장 →' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 대기실 -->
    <div v-else class="w-full max-w-lg">
      <div class="pt-2 pb-4 flex items-center justify-between">
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
        <p class="text-white font-black text-5xl tracking-widest">{{ actualPin }}</p>
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
