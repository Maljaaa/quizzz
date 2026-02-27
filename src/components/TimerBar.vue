<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ timeLeft: number; timeLimit: number }>()

const percent = computed(() => (props.timeLeft / props.timeLimit) * 100)

const barColor = computed(() => {
  if (percent.value > 50) return 'bg-green-400'
  if (percent.value > 25) return 'bg-yellow-400'
  return 'bg-red-400'
})
</script>

<template>
  <div class="w-full">
    <div class="flex justify-between text-sm font-bold mb-1">
      <span class="text-white/70">남은 시간</span>
      <span class="text-white text-lg">{{ timeLeft }}초</span>
    </div>
    <div class="w-full h-3 bg-white/20 rounded-full overflow-hidden">
      <div
        class="h-full rounded-full transition-all duration-1000 ease-linear"
        :class="barColor"
        :style="{ width: `${percent}%` }"
      />
    </div>
  </div>
</template>
