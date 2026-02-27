/**
 * Mock WebSocket 게임 서비스
 * 백엔드(Spring Boot WebSocket) 연동 시 이 파일만 교체하면 됩니다.
 */
import type {
  Participant,
  QuestionSet,
  LeaderboardEntry,
  RoomInfo,
  QuestionStartPayload,
  QuestionEndPayload,
} from '@/types'

interface ConnectionCallbacks {
  onParticipantJoined?: (p: Participant) => void
  onParticipantLeft?: (id: string) => void
  onGameStarted?: () => void
  onQuestionStart?: (payload: QuestionStartPayload) => void
  onAnswerLocked?: () => void
  onQuestionEnd?: (payload: QuestionEndPayload) => void
  onGameEnd?: (leaderboard: LeaderboardEntry[]) => void
  onRoomClosed?: () => void
}

interface MockServerRoom {
  pin: string
  hostId: string
  questionSet: QuestionSet
  participants: Map<string, Participant>
  status: 'waiting' | 'playing' | 'finished'
  currentQuestionIndex: number
  questionStartTime: number
  answers: Map<string, { choiceId: string; timeUsed: number }>
  questionTimerId?: ReturnType<typeof setTimeout>
  connections: Map<string, ConnectionCallbacks>
}

const BOTS: Omit<Participant, 'score' | 'isHost'>[] = [
  { id: 'bot-1', nickname: '김철수', emoji: '🦊' },
  { id: 'bot-2', nickname: '이영희', emoji: '🐧' },
  { id: 'bot-3', nickname: '박민준', emoji: '🦁' },
]

const serverRooms = new Map<string, MockServerRoom>()

function generatePin(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

function calcScore(timeLimit: number, timeUsed: number): number {
  const remaining = Math.max(0, timeLimit - timeUsed)
  return Math.round(500 + (remaining / timeLimit) * 500)
}

function buildLeaderboard(room: MockServerRoom): LeaderboardEntry[] {
  return Array.from(room.participants.values())
    .sort((a, b) => b.score - a.score)
    .map((p, i) => ({
      rank: i + 1,
      participantId: p.id,
      nickname: p.nickname,
      emoji: p.emoji,
      score: p.score,
    }))
}

function broadcast(room: MockServerRoom, fn: (cb: ConnectionCallbacks) => void) {
  room.connections.forEach((cb) => fn(cb))
}

function endQuestion(room: MockServerRoom) {
  if (room.questionTimerId) clearTimeout(room.questionTimerId)

  const question = room.questionSet.questions[room.currentQuestionIndex]
  if (!question) return

  // 점수 계산
  room.participants.forEach((participant, id) => {
    const answer = room.answers.get(id)
    if (answer?.choiceId === question.correctChoiceId) {
      participant.score += calcScore(question.timeLimit, answer.timeUsed)
    }
  })

  const leaderboard = buildLeaderboard(room)

  // 각 연결에 개인화된 결과 전송
  room.connections.forEach((cb, connectionId) => {
    const answer = room.answers.get(connectionId)
    const isCorrect = answer?.choiceId === question.correctChoiceId
    const earnedScore = isCorrect
      ? calcScore(question.timeLimit, answer?.timeUsed ?? question.timeLimit)
      : 0
    cb.onQuestionEnd?.({ correctChoiceId: question.correctChoiceId, earnedScore, isCorrect, leaderboard })
  })

  const isLast = room.currentQuestionIndex >= room.questionSet.questions.length - 1
  if (isLast) {
    setTimeout(() => {
      room.status = 'finished'
      broadcast(room, (cb) => cb.onGameEnd?.(leaderboard))
    }, 4000)
  }
}

function startQuestion(room: MockServerRoom) {
  room.currentQuestionIndex++
  room.answers.clear()
  room.questionStartTime = Date.now()

  const question = room.questionSet.questions[room.currentQuestionIndex]
  if (!question) return

  const payload: QuestionStartPayload = {
    question,
    questionIndex: room.currentQuestionIndex,
    totalQuestions: room.questionSet.questions.length,
  }

  broadcast(room, (cb) => cb.onQuestionStart?.(payload))

  // 봇 랜덤 답변 (closure 안에서 타입 보장을 위해 q로 캡처)
  const q = question
  BOTS.forEach((bot) => {
    if (!room.participants.has(bot.id)) return
    const delay = Math.random() * (q.timeLimit * 800) + 1000
    setTimeout(() => {
      if (room.answers.has(bot.id)) return
      const correct = Math.random() < 0.6
      const wrongChoice = q.choices.find((c) => c.id !== q.correctChoiceId)
      const choiceId = correct ? q.correctChoiceId : (wrongChoice?.id ?? q.correctChoiceId)
      room.answers.set(bot.id, { choiceId, timeUsed: delay / 1000 })
    }, delay)
  })

  room.questionTimerId = setTimeout(() => endQuestion(room), q.timeLimit * 1000)
}

export class MockGameService {
  private pin: string | null = null
  private userId: string | null = null
  private callbacks: ConnectionCallbacks = {}

  setCallbacks(cb: ConnectionCallbacks) {
    this.callbacks = cb
    if (this.pin && this.userId) {
      serverRooms.get(this.pin)?.connections.set(this.userId, cb)
    }
  }

  createRoom(questionSet: QuestionSet, host: Participant): string {
    const pin = generatePin()
    serverRooms.set(pin, {
      pin,
      hostId: host.id,
      questionSet,
      participants: new Map([[host.id, { ...host, score: 0 }]]),
      status: 'waiting',
      currentQuestionIndex: -1,
      questionStartTime: 0,
      answers: new Map(),
      connections: new Map([[host.id, this.callbacks]]),
    })
    this.pin = pin
    this.userId = host.id
    return pin
  }

  joinRoom(pin: string, participant: Participant): RoomInfo | null {
    const room = serverRooms.get(pin)
    if (!room || room.status !== 'waiting') return null

    room.participants.set(participant.id, { ...participant, score: 0 })
    room.connections.set(participant.id, this.callbacks)
    this.pin = pin
    this.userId = participant.id

    setTimeout(() => {
      room.connections.forEach((cb, id) => {
        if (id !== participant.id) cb.onParticipantJoined?.(participant)
      })
    }, 100)

    return {
      pin: room.pin,
      hostId: room.hostId,
      questionSetTitle: room.questionSet.title,
      participants: Array.from(room.participants.values()),
    }
  }

  getRoomInfo(): RoomInfo | null {
    if (!this.pin) return null
    const room = serverRooms.get(this.pin)
    if (!room) return null
    return {
      pin: room.pin,
      hostId: room.hostId,
      questionSetTitle: room.questionSet.title,
      participants: Array.from(room.participants.values()),
    }
  }

  startGame() {
    if (!this.pin || !this.userId) return
    const room = serverRooms.get(this.pin)
    if (!room || room.hostId !== this.userId) return

    room.status = 'playing'

    // 봇 입장 시뮬레이션
    BOTS.forEach((bot, i) => {
      setTimeout(() => {
        const p: Participant = { ...bot, score: 0, isHost: false }
        room.participants.set(bot.id, p)
        broadcast(room, (cb) => cb.onParticipantJoined?.(p))
      }, i * 400)
    })

    setTimeout(
      () => {
        broadcast(room, (cb) => cb.onGameStarted?.())
        setTimeout(() => startQuestion(room), 1500)
      },
      BOTS.length * 400 + 600,
    )
  }

  nextQuestion() {
    if (!this.pin || !this.userId) return
    const room = serverRooms.get(this.pin)
    if (!room || room.hostId !== this.userId) return
    startQuestion(room)
  }

  submitAnswer(choiceId: string) {
    if (!this.pin || !this.userId) return
    const room = serverRooms.get(this.pin)
    if (!room || room.answers.has(this.userId)) return

    const timeUsed = (Date.now() - room.questionStartTime) / 1000
    room.answers.set(this.userId, { choiceId, timeUsed })
    this.callbacks.onAnswerLocked?.()
  }

  leaveRoom() {
    if (!this.pin || !this.userId) return
    const room = serverRooms.get(this.pin)
    if (!room) return

    if (room.hostId === this.userId) {
      if (room.questionTimerId) clearTimeout(room.questionTimerId)
      broadcast(room, (cb) => cb.onRoomClosed?.())
      serverRooms.delete(this.pin)
    } else {
      room.participants.delete(this.userId)
      room.connections.delete(this.userId)
      const leftId = this.userId
      broadcast(room, (cb) => cb.onParticipantLeft?.(leftId))
    }

    this.pin = null
    this.userId = null
    this.callbacks = {}
  }

  get isHost(): boolean {
    if (!this.pin || !this.userId) return false
    return serverRooms.get(this.pin)?.hostId === this.userId
  }
}

export const gameService = new MockGameService()
