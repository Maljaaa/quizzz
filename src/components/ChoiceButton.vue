<script setup lang="ts">
const SHAPES = ['▲', '■', '●', '♦']
const COLORS = [
  'bg-red-500 hover:bg-red-400 active:bg-red-600',
  'bg-blue-500 hover:bg-blue-400 active:bg-blue-600',
  'bg-yellow-500 hover:bg-yellow-400 active:bg-yellow-600',
  'bg-green-500 hover:bg-green-400 active:bg-green-600',
]
const CORRECT_COLOR = 'bg-green-400 ring-4 ring-green-200'
const WRONG_COLOR = 'bg-gray-600 opacity-50'
const SELECTED_RING = 'ring-4 ring-white'

const props = defineProps<{
  index: number
  text: string
  disabled?: boolean
  selected?: boolean
  correct?: boolean  // true=정답, false=오답, undefined=미공개
}>()

const emit = defineEmits<{ click: [] }>()

const colorClass = (() => {
  if (props.correct === true) return CORRECT_COLOR
  if (props.correct === false) return WRONG_COLOR
  return COLORS[props.index % 4]
})
</script>

<template>
  <button
    class="flex items-center gap-3 px-4 py-4 rounded-xl font-bold text-white text-left transition-all w-full text-sm md:text-base"
    :class="[colorClass(), selected && correct === undefined ? SELECTED_RING : '', disabled ? 'cursor-not-allowed' : 'cursor-pointer']"
    :disabled="disabled"
    @click="emit('click')"
  >
    <span class="text-xl">{{ SHAPES[index % 4] }}</span>
    <span class="flex-1">{{ text }}</span>
    <span v-if="correct === true" class="text-xl">✓</span>
    <span v-else-if="correct === false && selected" class="text-xl">✗</span>
  </button>
</template>
