export type OAuthProvider = 'google' | 'kakao' | 'github'

export interface AuthSession {
  userId: string
  provider: OAuthProvider
  loggedInAt: string
}

export interface User {
  id: string
  nickname: string
  emoji: string
}

export interface Choice {
  id: string
  text: string
}

export interface Question {
  id: string
  text: string
  choices: Choice[]
  correctChoiceId: string
  timeLimit: number // 10 | 20 | 30
}

export interface QuestionSet {
  id: string
  title: string
  questions: Question[]
  createdAt: string
}

export interface Participant {
  id: string
  nickname: string
  emoji: string
  score: number
  isHost: boolean
}

export type RoomStatus = 'waiting' | 'playing' | 'finished'
export type GamePhase = 'question' | 'answer_reveal' | 'leaderboard'

export interface LeaderboardEntry {
  rank: number
  participantId: string
  nickname: string
  emoji: string
  score: number
  earnedScore?: number
}

export interface QuestionStartPayload {
  question: Question
  questionIndex: number
  totalQuestions: number
}

export interface QuestionEndPayload {
  correctChoiceId: string
  earnedScore: number
  isCorrect: boolean
  leaderboard: LeaderboardEntry[]
}

export interface RoomInfo {
  pin: string
  hostId: string
  questionSetTitle: string
  participants: Participant[]
}
