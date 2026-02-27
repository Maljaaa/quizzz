import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { User } from '@/types'

export const useUserStore = defineStore('user', () => {
  const id = ref(localStorage.getItem('userId') ?? crypto.randomUUID())
  const nickname = ref(localStorage.getItem('nickname') ?? '')
  const emoji = ref(localStorage.getItem('emoji') ?? '')

  const isProfileSet = computed(() => nickname.value !== '' && emoji.value !== '')

  const user = computed<User>(() => ({
    id: id.value,
    nickname: nickname.value,
    emoji: emoji.value,
  }))

  function setProfile(newNickname: string, newEmoji: string) {
    nickname.value = newNickname
    emoji.value = newEmoji
    localStorage.setItem('userId', id.value)
    localStorage.setItem('nickname', newNickname)
    localStorage.setItem('emoji', newEmoji)
  }

  return { id, nickname, emoji, isProfileSet, user, setProfile }
})
