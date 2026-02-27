<script setup lang="ts">
const EMOJIS = [
  '🦊', '🐧', '🦁', '🐯', '🐻', '🦝', '🐸', '🐙',
  '🦄', '🐉', '🦋', '🐺', '🦀', '🐬', '🦅', '🐼',
  '🎃', '👾', '🤖', '👻', '🎯', '🚀', '⚡', '🌈',
]

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [emoji: string] }>()
</script>

<template>
  <div class="grid grid-cols-8 gap-2">
    <button
      v-for="emoji in EMOJIS"
      :key="emoji"
      type="button"
      class="text-2xl p-2 rounded-lg transition-all hover:scale-110 hover:bg-white/20"
      :class="props.modelValue === emoji ? 'bg-white/30 ring-2 ring-white scale-110' : ''"
      @click="emit('update:modelValue', emoji)"
    >
      {{ emoji }}
    </button>
  </div>
</template>
