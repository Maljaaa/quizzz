<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useQuestionStore } from '@/stores/question'
import { useRoomStore } from '@/stores/room'
import type { QuestionSet } from '@/types'

const router = useRouter()
const questionStore = useQuestionStore()
const roomStore = useRoomStore()

function createNew() {
  router.push('/questions/new')
}

function edit(id: string) {
  router.push(`/questions/${id}`)
}

function deleteSet(id: string) {
  if (confirm('이 문제 세트를 삭제할까요?')) {
    questionStore.deleteQuestionSet(id)
  }
}

function startRoom(set: QuestionSet) {
  if (set.questions.length === 0) {
    alert('문제가 하나 이상 있어야 방을 만들 수 있어요')
    return
  }
  const pin = roomStore.createRoom(set)
  router.push(`/room/${pin}/waiting`)
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-4">
    <div class="max-w-lg mx-auto">
      <!-- 헤더 -->
      <div class="flex items-center justify-between mb-6 pt-4">
        <button class="text-white/60 hover:text-white transition-colors" @click="router.push('/lobby')">
          ← 뒤로
        </button>
        <h1 class="text-white font-black text-xl">문제 세트</h1>
        <button
          class="bg-purple-500 hover:bg-purple-400 text-white font-bold px-4 py-2 rounded-xl transition-all text-sm"
          @click="createNew"
        >
          + 새로 만들기
        </button>
      </div>

      <!-- 빈 상태 -->
      <div v-if="questionStore.questionSets.length === 0" class="text-center py-16">
        <p class="text-5xl mb-4">📭</p>
        <p class="text-white/60">아직 문제 세트가 없어요</p>
        <button
          class="mt-4 bg-purple-500 hover:bg-purple-400 text-white font-bold px-6 py-3 rounded-xl transition-all"
          @click="createNew"
        >
          첫 번째 문제 세트 만들기
        </button>
      </div>

      <!-- 목록 -->
      <div class="flex flex-col gap-3">
        <div
          v-for="set in questionStore.questionSets"
          :key="set.id"
          class="bg-white/10 backdrop-blur rounded-2xl p-4"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="flex-1 min-w-0">
              <h3 class="text-white font-bold truncate">{{ set.title }}</h3>
              <p class="text-white/50 text-sm mt-1">{{ set.questions.length }}개 문제</p>
            </div>
            <div class="flex gap-2 shrink-0">
              <button
                class="text-white/60 hover:text-white text-sm px-2 py-1 rounded-lg hover:bg-white/10 transition-all"
                @click="edit(set.id)"
              >
                편집
              </button>
              <button
                class="text-red-400 hover:text-red-300 text-sm px-2 py-1 rounded-lg hover:bg-white/10 transition-all"
                @click="deleteSet(set.id)"
              >
                삭제
              </button>
            </div>
          </div>
          <button
            class="w-full mt-3 bg-green-500 hover:bg-green-400 text-white font-bold py-2.5 rounded-xl transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
            :disabled="set.questions.length === 0"
            @click="startRoom(set)"
          >
            🚀 이 세트로 방 만들기
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
