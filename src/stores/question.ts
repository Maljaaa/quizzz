import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Question, QuestionSet } from '@/types'

const STORAGE_KEY = 'kahoot_question_sets'

function load(): QuestionSet[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

function save(sets: QuestionSet[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sets))
}

export const useQuestionStore = defineStore('question', () => {
  const questionSets = ref<QuestionSet[]>(load())

  function createQuestionSet(title: string): QuestionSet {
    const newSet: QuestionSet = {
      id: crypto.randomUUID(),
      title,
      questions: [],
      createdAt: new Date().toISOString(),
    }
    questionSets.value.push(newSet)
    save(questionSets.value)
    return newSet
  }

  function updateQuestionSet(id: string, title: string, questions: Question[]) {
    const index = questionSets.value.findIndex((s) => s.id === id)
    if (index === -1) return
    const existing = questionSets.value[index]
    if (!existing) return
    questionSets.value[index] = { id: existing.id, createdAt: existing.createdAt, title, questions }
    save(questionSets.value)
  }

  function deleteQuestionSet(id: string) {
    questionSets.value = questionSets.value.filter((s) => s.id !== id)
    save(questionSets.value)
  }

  function getQuestionSet(id: string): QuestionSet | undefined {
    return questionSets.value.find((s) => s.id === id)
  }

  return { questionSets, createQuestionSet, updateQuestionSet, deleteQuestionSet, getQuestionSet }
})
