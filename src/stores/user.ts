import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { authService } from '@/services/auth.mock'
import type { OAuthProvider, AuthSession } from '@/types'

interface UserProfile {
  nickname: string
  emoji: string
}

function profileKey(userId: string): string {
  return `quizzz_profile_${userId}`
}

function loadProfile(userId: string): UserProfile | null {
  try {
    return JSON.parse(localStorage.getItem(profileKey(userId)) ?? 'null')
  } catch {
    return null
  }
}

export const useUserStore = defineStore('user', () => {
  const session = ref<AuthSession | null>(authService.getSession())
  const profile = ref<UserProfile | null>(session.value ? loadProfile(session.value.userId) : null)

  const isLoggedIn = computed(() => session.value !== null)
  const id = computed(() => session.value?.userId ?? '')
  const provider = computed(() => session.value?.provider ?? null)
  const nickname = computed(() => profile.value?.nickname ?? '')
  const emoji = computed(() => profile.value?.emoji ?? '')
  const isProfileSet = computed(() => profile.value !== null)

  const user = computed(() => ({
    id: id.value,
    nickname: nickname.value,
    emoji: emoji.value,
  }))

  function login(p: OAuthProvider) {
    session.value = authService.mockLogin(p)
    profile.value = loadProfile(session.value.userId)
  }

  function setProfile(newNickname: string, newEmoji: string) {
    if (!id.value) return
    const newProfile: UserProfile = { nickname: newNickname, emoji: newEmoji }
    profile.value = newProfile
    localStorage.setItem(profileKey(id.value), JSON.stringify(newProfile))
  }

  function clearProfile() {
    profile.value = null
  }

  function logout() {
    authService.logout()
    session.value = null
    profile.value = null
  }

  return { id, provider, isLoggedIn, nickname, emoji, isProfileSet, user, login, setProfile, clearProfile, logout }
})
