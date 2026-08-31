<script setup lang="ts">
import { mdiCalendar, mdiClose, mdiFilterVariant, mdiMedal, mdiShieldAccount, mdiTrophyOutline } from '@mdi/js'
import type { Sport, Team } from '@/types'
import MdiIcon from './MdiIcon.vue'

export type QuickFilter = 'all' | 'today' | 'upcoming' | 'finished' | 'live'

const props = defineProps<{
  quickFilter: QuickFilter
  date: string
  sport: string
  team: string
  phase: string
  sports: Sport[]
  teams: Team[]
  phases: string[]
}>()

const emit = defineEmits<{
  'update:quickFilter': [QuickFilter]
  'update:date': [string]
  'update:sport': [string]
  'update:team': [string]
  'update:phase': [string]
  clear: []
}>()

const quickOptions: { value: QuickFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'today', label: 'Hoje' },
  { value: 'upcoming', label: 'Futuros' },
  { value: 'finished', label: 'Finalizados' },
  { value: 'live', label: 'Ao vivo' },
]

const dateOptions = [
  { value: '', label: 'Todas as datas' },
  { value: '2026-09-01', label: '01/09' },
  { value: '2026-09-02', label: '02/09' },
  { value: '2026-09-03', label: '03/09' },
]
</script>

<template>
  <div class="mb-6 space-y-3">
    <div class="flex flex-wrap items-center gap-2">
      <span class="mr-1 hidden items-center gap-1 text-xs font-semibold uppercase tracking-wide text-neutral-400 sm:inline-flex">
        <MdiIcon :path="mdiFilterVariant" :size="16" />
        Filtros
      </span>
      <button
        v-for="opt in quickOptions"
        :key="opt.value"
        type="button"
        class="min-h-11 rounded-full px-4 py-2 text-sm font-semibold transition-colors"
        :class="
          props.quickFilter === opt.value
            ? 'bg-accent-600 text-white'
            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
        "
        @click="emit('update:quickFilter', opt.value)"
      >
        {{ opt.label }}
      </button>
    </div>

    <div class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
      <label class="relative flex items-center">
        <MdiIcon :path="mdiCalendar" :size="16" class="pointer-events-none absolute left-3 text-neutral-400" />
        <select
          class="min-h-11 w-full rounded-xl border border-neutral-300 bg-white py-2 pl-9 pr-3 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          :value="props.date"
          @change="emit('update:date', ($event.target as HTMLSelectElement).value)"
        >
          <option v-for="opt in dateOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
      </label>

      <label class="relative flex items-center">
        <MdiIcon :path="mdiMedal" :size="16" class="pointer-events-none absolute left-3 text-neutral-400" />
        <select
          class="min-h-11 w-full rounded-xl border border-neutral-300 bg-white py-2 pl-9 pr-3 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          :value="props.sport"
          @change="emit('update:sport', ($event.target as HTMLSelectElement).value)"
        >
          <option value="">Todas modalidades</option>
          <option v-for="s in props.sports" :key="s.slug" :value="s.slug">{{ s.name }}</option>
        </select>
      </label>

      <label class="relative flex items-center">
        <MdiIcon :path="mdiShieldAccount" :size="16" class="pointer-events-none absolute left-3 text-neutral-400" />
        <select
          class="min-h-11 w-full rounded-xl border border-neutral-300 bg-white py-2 pl-9 pr-3 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          :value="props.team"
          @change="emit('update:team', ($event.target as HTMLSelectElement).value)"
        >
          <option value="">Todas equipes</option>
          <option v-for="t in props.teams" :key="t.slug" :value="t.slug">{{ t.name }}</option>
        </select>
      </label>

      <label class="relative flex items-center">
        <MdiIcon :path="mdiTrophyOutline" :size="16" class="pointer-events-none absolute left-3 text-neutral-400" />
        <select
          class="min-h-11 w-full rounded-xl border border-neutral-300 bg-white py-2 pl-9 pr-3 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          :value="props.phase"
          @change="emit('update:phase', ($event.target as HTMLSelectElement).value)"
        >
          <option value="">Todas as fases</option>
          <option v-for="p in props.phases" :key="p" :value="p">{{ p }}</option>
        </select>
      </label>
    </div>

    <button
      type="button"
      class="inline-flex items-center gap-1 text-xs font-semibold text-accent-600 hover:underline dark:text-accent-400"
      @click="emit('clear')"
    >
      <MdiIcon :path="mdiClose" :size="14" />
      Limpar filtros
    </button>
  </div>
</template>
