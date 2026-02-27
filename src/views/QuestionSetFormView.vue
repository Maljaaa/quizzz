<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuestionStore } from '@/stores/question'
import type { Choice, Question } from '@/types'

const router = useRouter()
const route = useRoute()
const questionStore = useQuestionStore()

const isEdit = ref(false)
const setId = ref('')
const title = ref('')
const questions = ref<Question[]>([])

onMounted(() => {
  const id = route.params.id as string | undefined
  if (id) {
    isEdit.value = true
    setId.value = id
    const existing = questionStore.getQuestionSet(id)
    if (existing) {
      title.value = existing.title
      questions.value = JSON.parse(JSON.stringify(existing.questions))
    }
  }
})

function newChoice(): Choice {
  return { id: crypto.randomUUID(), text: '' }
}

function addQuestion() {
  questions.value.push({
    id: crypto.randomUUID(),
    text: '',
    choices: [newChoice(), newChoice(), newChoice(), newChoice()],
    correctChoiceId: '',
    timeLimit: 20,
  })
}

function removeQuestion(index: number) {
  questions.value.splice(index, 1)
}

function addChoice(question: Question) {
  if (question.choices.length < 4) {
    question.choices.push(newChoice())
  }
}

function removeChoice(question: Question, choiceId: string) {
  if (question.choices.length <= 2) return
  question.choices = question.choices.filter((c) => c.id !== choiceId)
  if (question.correctChoiceId === choiceId) question.correctChoiceId = ''
}

function isValid(): boolean {
  if (!title.value.trim()) return false
  if (questions.value.length === 0) return false
  return questions.value.every(
    (q) =>
      q.text.trim() &&
      q.choices.every((c) => c.text.trim()) &&
      q.correctChoiceId !== '',
  )
}

function save() {
  if (!isValid()) return
  if (isEdit.value) {
    questionStore.updateQuestionSet(setId.value, title.value.trim(), questions.value)
  } else {
    const newSet = questionStore.createQuestionSet(title.value.trim())
    questionStore.updateQuestionSet(newSet.id, title.value.trim(), questions.value)
  }
  router.push('/questions')
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-4">
    <div class="max-w-lg mx-auto">
      <!-- 헤더 -->
      <div class="flex items-center justify-between mb-6 pt-4">
        <button class="text-white/60 hover:text-white transition-colors" @click="router.push('/questions')">
          ← 뒤로
        </button>
        <h1 class="text-white font-black text-xl">{{ isEdit ? '문제 세트 편집' : '문제 세트 만들기' }}</h1>
        <button
          class="bg-white text-purple-900 font-bold px-4 py-2 rounded-xl transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/90"
          :disabled="!isValid()"
          @click="save"
        >
          저장
        </button>
      </div>

      <!-- 제목 -->
      <div class="bg-white/10 backdrop-blur rounded-2xl p-4 mb-4">
        <label class="text-white font-bold text-sm block mb-2">세트 제목</label>
        <input
          v-model="title"
          type="text"
          placeholder="예) 2024 팀 워크샵 퀴즈"
          class="w-full bg-white/20 text-white placeholder-white/40 rounded-xl px-4 py-3 font-bold outline-none focus:ring-2 focus:ring-white/50"
        />
      </div>

      <!-- 문제 목록 -->
      <div class="flex flex-col gap-4 mb-4">
        <div
          v-for="(question, qi) in questions"
          :key="question.id"
          class="bg-white/10 backdrop-blur rounded-2xl p-4"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="text-white font-bold">문제 {{ qi + 1 }}</span>
            <div class="flex items-center gap-2">
              <!-- 제한시간 -->
              <select
                v-model="question.timeLimit"
                class="bg-white/20 text-white text-sm rounded-lg px-2 py-1 outline-none"
              >
                <option :value="10">10초</option>
                <option :value="20">20초</option>
                <option :value="30">30초</option>
              </select>
              <button
                class="text-red-400 hover:text-red-300 text-sm hover:bg-white/10 px-2 py-1 rounded-lg"
                @click="removeQuestion(qi)"
              >
                삭제
              </button>
            </div>
          </div>

          <!-- 질문 텍스트 -->
          <textarea
            v-model="question.text"
            rows="2"
            placeholder="질문을 입력하세요"
            class="w-full bg-white/20 text-white placeholder-white/40 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-white/50 resize-none mb-3"
          />

          <!-- 보기 -->
          <div class="flex flex-col gap-2">
            <div
              v-for="(choice, ci) in question.choices"
              :key="choice.id"
              class="flex items-center gap-2"
            >
              <button
                class="w-6 h-6 rounded-full border-2 shrink-0 transition-all"
                :class="
                  question.correctChoiceId === choice.id
                    ? 'border-green-400 bg-green-400'
                    : 'border-white/40 hover:border-white'
                "
                type="button"
                @click="question.correctChoiceId = choice.id"
              />
              <input
                v-model="choice.text"
                type="text"
                :placeholder="`보기 ${ci + 1}`"
                class="flex-1 bg-white/10 text-white placeholder-white/30 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/30"
              />
              <button
                v-if="question.choices.length > 2"
                class="text-white/40 hover:text-red-400 text-sm"
                type="button"
                @click="removeChoice(question, choice.id)"
              >
                ✕
              </button>
            </div>
          </div>

          <button
            v-if="question.choices.length < 4"
            class="mt-2 text-white/50 hover:text-white text-sm"
            type="button"
            @click="addChoice(question)"
          >
            + 보기 추가
          </button>

          <p v-if="!question.correctChoiceId" class="text-yellow-400 text-xs mt-2">
            ⚠ 정답을 선택해주세요 (동그라미 버튼)
          </p>
        </div>
      </div>

      <!-- 문제 추가 버튼 -->
      <button
        class="w-full border-2 border-dashed border-white/30 hover:border-white/60 text-white/60 hover:text-white font-bold py-4 rounded-2xl transition-all"
        @click="addQuestion"
      >
        + 문제 추가
      </button>
    </div>
  </div>
</template>
