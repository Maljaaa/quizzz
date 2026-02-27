<script setup lang="ts">
import type { LeaderboardEntry } from '@/types'

defineProps<{ entries: LeaderboardEntry[]; highlightId?: string }>()

const RANK_STYLES = ['text-yellow-400', 'text-gray-300', 'text-amber-600']
const RANK_EMOJI = ['🥇', '🥈', '🥉']
</script>

<template>
  <div class="flex flex-col gap-2">
    <div
      v-for="entry in entries"
      :key="entry.participantId"
      class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
      :class="[
        entry.participantId === highlightId
          ? 'bg-white/30 ring-2 ring-white'
          : 'bg-white/10',
      ]"
    >
      <span class="text-xl w-8 text-center font-bold" :class="RANK_STYLES[entry.rank - 1] ?? 'text-white'">
        {{ RANK_EMOJI[entry.rank - 1] ?? entry.rank }}
      </span>
      <span class="text-2xl">{{ entry.emoji }}</span>
      <span class="flex-1 font-bold text-white text-sm truncate">{{ entry.nickname }}</span>
      <span class="font-bold text-white tabular-nums">{{ entry.score.toLocaleString() }}점</span>
    </div>
  </div>
</template>
