import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useUserStore } from '@/stores/user'
import type { Question, QuestionSet } from '@/types'

function storageKey(userId: string): string {
  return `quizzz_questions_${userId}`
}

function loadForUser(userId: string): QuestionSet[] {
  try {
    return JSON.parse(localStorage.getItem(storageKey(userId)) ?? '[]')
  } catch {
    return []
  }
}

export const useQuestionStore = defineStore('question', () => {
  const userStore = useUserStore()
  const questionSets = ref<QuestionSet[]>(userStore.id ? loadForUser(userStore.id) : [])

  function reload() {
    questionSets.value = userStore.id ? loadForUser(userStore.id) : []
  }

  function save() {
    if (!userStore.id) return
    localStorage.setItem(storageKey(userStore.id), JSON.stringify(questionSets.value))
  }

  function createQuestionSet(title: string): QuestionSet {
    const newSet: QuestionSet = {
      id: crypto.randomUUID(),
      title,
      questions: [],
      createdAt: new Date().toISOString(),
    }
    questionSets.value.push(newSet)
    save()
    return newSet
  }

  function updateQuestionSet(id: string, title: string, questions: Question[]) {
    const index = questionSets.value.findIndex((s) => s.id === id)
    if (index === -1) return
    const existing = questionSets.value[index]
    if (!existing) return
    questionSets.value[index] = { id: existing.id, createdAt: existing.createdAt, title, questions }
    save()
  }

  function deleteQuestionSet(id: string) {
    questionSets.value = questionSets.value.filter((s) => s.id !== id)
    save()
  }

  function getQuestionSet(id: string): QuestionSet | undefined {
    return questionSets.value.find((s) => s.id === id)
  }

  function clear() {
    questionSets.value = []
  }

  return { questionSets, reload, createQuestionSet, updateQuestionSet, deleteQuestionSet, getQuestionSet, clear }
})
