<script setup lang="ts">
import { computed } from 'vue'
import { mdiCircle, mdiCircleOutline } from '@mdi/js'
import type { MatchStatus } from '@/types'
import MdiIcon from './MdiIcon.vue'

const props = defineProps<{
  status: MatchStatus
  isUpcoming?: boolean
}>()

const config = computed(() => {
  if (props.status === 'live') {
    return { label: 'AO VIVO', classes: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400' }
  }
  if (props.status === 'finished') {
    return { label: 'FINALIZADO', classes: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' }
  }
  if (props.isUpcoming) {
    return { label: 'EM BREVE', classes: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400' }
  }
  return { label: 'AGENDADO', classes: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400' }
})
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide"
    :class="config.classes"
  >
    <span v-if="status === 'live'" class="relative flex h-2 w-2">
      <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75"></span>
      <span class="relative inline-flex h-2 w-2 rounded-full bg-red-600"></span>
    </span>
    <MdiIcon v-else :path="status === 'finished' ? mdiCircle : mdiCircleOutline" :size="8" />
    {{ config.label }}
  </span>
</template>
