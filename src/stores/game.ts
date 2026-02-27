import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { GamePhase, LeaderboardEntry, Question } from '@/types'

export const useGameStore = defineStore('game', () => {
  const phase = ref<GamePhase>('question')
  const currentQuestion = ref<Question | null>(null)
  const questionIndex = ref(0)
  const totalQuestions = ref(0)
  const timeLeft = ref(0)
  const selectedChoiceId = ref<string | null>(null)
  const isAnswerLocked = ref(false)
  const isCorrect = ref<boolean | null>(null)
  const earnedScore = ref(0)
  const leaderboard = ref<LeaderboardEntry[]>([])
  const isFinished = ref(false)

  let timerId: ReturnType<typeof setInterval> | null = null

  function startQuestion(question: Question, index: number, total: number) {
    phase.value = 'question'
    currentQuestion.value = question
    questionIndex.value = index
    totalQuestions.value = total
    timeLeft.value = question.timeLimit
    selectedChoiceId.value = null
    isAnswerLocked.value = false
    isCorrect.value = null
    earnedScore.value = 0

    if (timerId) clearInterval(timerId)
    timerId = setInterval(() => {
      if (timeLeft.value > 0) {
        timeLeft.value--
      } else {
        stopTimer()
      }
    }, 1000)
  }

  function lockAnswer(choiceId: string) {
    selectedChoiceId.value = choiceId
    isAnswerLocked.value = true
  }

  function revealAnswer(correctChoiceId: string, earned: number, correct: boolean, board: LeaderboardEntry[]) {
    stopTimer()
    phase.value = 'answer_reveal'
    isCorrect.value = correct
    earnedScore.value = earned
    leaderboard.value = board

    if (currentQuestion.value) {
      currentQuestion.value = { ...currentQuestion.value, correctChoiceId }
    }

    setTimeout(() => {
      phase.value = 'leaderboard'
    }, 2500)
  }

  function endGame(board: LeaderboardEntry[]) {
    stopTimer()
    leaderboard.value = board
    isFinished.value = true
  }

  function stopTimer() {
    if (timerId) {
      clearInterval(timerId)
      timerId = null
    }
  }

  function reset() {
    stopTimer()
    phase.value = 'question'
    currentQuestion.value = null
    questionIndex.value = 0
    totalQuestions.value = 0
    timeLeft.value = 0
    selectedChoiceId.value = null
    isAnswerLocked.value = false
    isCorrect.value = null
    earnedScore.value = 0
    leaderboard.value = []
    isFinished.value = false
  }

  return {
    phase,
    currentQuestion,
    questionIndex,
    totalQuestions,
    timeLeft,
    selectedChoiceId,
    isAnswerLocked,
    isCorrect,
    earnedScore,
    leaderboard,
    isFinished,
    startQuestion,
    lockAnswer,
    revealAnswer,
    endGame,
    reset,
  }
})
