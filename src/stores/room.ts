import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { gameService } from '@/services/game.mock'
import { useUserStore } from '@/stores/user'
import type { Participant, QuestionSet, RoomInfo } from '@/types'

export const useRoomStore = defineStore('room', () => {
  const userStore = useUserStore()

  const roomInfo = ref<RoomInfo | null>(null)
  const isHost = computed(() => roomInfo.value?.hostId === userStore.id)

  function createRoom(questionSet: QuestionSet): string {
    const host: Participant = {
      id: userStore.id,
      nickname: userStore.nickname,
      emoji: userStore.emoji,
      score: 0,
      isHost: true,
    }
    const pin = gameService.createRoom(questionSet, host)
    roomInfo.value = gameService.getRoomInfo()
    return pin
  }

  function joinRoom(pin: string): boolean {
    const participant: Participant = {
      id: userStore.id,
      nickname: userStore.nickname,
      emoji: userStore.emoji,
      score: 0,
      isHost: false,
    }
    const info = gameService.joinRoom(pin, participant)
    if (!info) return false
    roomInfo.value = info
    return true
  }

  function addParticipant(participant: Participant) {
    if (!roomInfo.value) return
    const exists = roomInfo.value.participants.find((p) => p.id === participant.id)
    if (!exists) {
      roomInfo.value.participants.push(participant)
    }
  }

  function removeParticipant(participantId: string) {
    if (!roomInfo.value) return
    roomInfo.value.participants = roomInfo.value.participants.filter((p) => p.id !== participantId)
  }

  function clearRoom() {
    roomInfo.value = null
  }

  return { roomInfo, isHost, createRoom, joinRoom, addParticipant, removeParticipant, clearRoom }
})
