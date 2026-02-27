/**
 * Mock OAuth 서비스
 * 백엔드(Spring Boot) 연동 시 이 파일을 실제 OAuth 구현으로 교체합니다.
 *
 * 동작 방식:
 * - 브라우저별 고유 device ID를 생성하고 localStorage에 영구 저장
 * - provider별 userId = `{provider}_{deviceId}` 형태로 결정론적 생성
 * - 동일 기기 + 동일 provider = 항상 동일한 userId (재로그인 시 데이터 복원)
 */
import type { OAuthProvider, AuthSession } from '@/types'

const DEVICE_ID_KEY = 'quizzz_device_id'
const SESSION_KEY = 'quizzz_session'

function getDeviceId(): string {
  const existing = localStorage.getItem(DEVICE_ID_KEY)
  if (existing) return existing
  const newId = crypto.randomUUID().replace(/-/g, '').slice(0, 12)
  localStorage.setItem(DEVICE_ID_KEY, newId)
  return newId
}

export const authService = {
  mockLogin(provider: OAuthProvider): AuthSession {
    const deviceId = getDeviceId()
    const session: AuthSession = {
      userId: `${provider}_${deviceId}`,
      provider,
      loggedInAt: new Date().toISOString(),
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    return session
  },

  getSession(): AuthSession | null {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY) ?? 'null')
    } catch {
      return null
    }
  },

  logout(): void {
    localStorage.removeItem(SESSION_KEY)
  },
}
