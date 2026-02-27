# Vue Playground - 코딩 가이드

## 스택

- Vue 3 + TypeScript + Vite
- Pinia (상태 관리)
- Vue Router 4
- Tailwind CSS 4
- Vitest + @vue/test-utils + happy-dom
- ESLint 10 + Prettier 3

## 필수 규칙

### Vue 컴포넌트

- `<script setup lang="ts">` 필수 사용
- Options API 절대 금지
- `any` 타입 사용 금지
- `import type` 구문 사용 (타입 전용 임포트)

### 경로

- `@/` alias 사용 (상대경로 `../` 금지)
- 예: `import { useCounterStore } from '@/stores/counter'`

### Pinia

- Setup Store 방식만 사용

```ts
// 올바른 예시
export const useMyStore = defineStore('my', () => {
  const state = ref(0)
  return { state }
})
```

### 테스트

- 파일명: `*.test.ts`
- 설명(describe/it/test)은 한국어로 작성

## 스크립트

```bash
npm run dev          # 개발 서버
npm run build        # 빌드
npm run test         # 테스트 실행
npm run test:coverage # 커버리지 포함 테스트
npm run lint         # 린트 검사
npm run lint:fix     # 린트 자동 수정
npm run format       # Prettier 포맷팅
```
