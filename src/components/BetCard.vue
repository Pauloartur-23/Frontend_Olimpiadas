<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { mdiAlertCircleOutline, mdiCalendarQuestion, mdiCheck, mdiClockOutline, mdiHelpCircleOutline, mdiLockOutline, mdiMapMarker, mdiPencilOutline } from '@mdi/js'
import type { Bet, Match } from '@/types'
import TeamBadge from './TeamBadge.vue'
import StatusPill from './StatusPill.vue'
import MdiIcon from './MdiIcon.vue'
import { formatDateShort, formatTime, hasScheduledDateTime, isMatchUpcoming } from '@/utils/date'
import { sportIcon } from '@/utils/sportIcons'

const props = defineProps<{
  match: Match
  bet: Bet | null
  saving?: boolean
  errorMessage?: string | null
}>()

const emit = defineEmits<{
  save: [{ home: number; away: number }]
}>()

// Só é apostável um confronto par-a-par de exatamente 2 equipes, com data e
// horário já definidos. Jogos com mais de 2 equipes disputando ao mesmo tempo
// (Pife/Uno, Laço Individual/Dupla) e jogos sem data/horário confirmado (ex:
// Valorant, League of Legends) caem no mesmo estado "não disponível".
const isFullyDefined = computed(
  () => props.match.teams.length === 2 && hasScheduledDateTime(props.match.date, props.match.time),
)
const isScheduled = computed(() => hasScheduledDateTime(props.match.date, props.match.time))
const isLocked = computed(() => props.bet?.locked ?? (isFullyDefined.value && !isMatchUpcoming(props.match.date, props.match.time)))

const form = reactive({ home: 0, away: 0 })

watch(
  () => props.bet,
  (bet) => {
    form.home = bet?.predicted_home ?? 0
    form.away = bet?.predicted_away ?? 0
  },
  { immediate: true },
)

function scoreFor(teamId: number): number | null {
  const s = props.match.scores?.find((sc) => sc.team.id === teamId)
  return s ? s.points : null
}

function onSubmit() {
  emit('save', { home: form.home, away: form.away })
}
</script>

<template>
  <div class="card relative overflow-hidden p-4 sm:p-5">
    <div class="mb-3 flex items-center justify-between gap-2">
      <div class="flex min-w-0 items-center gap-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">
        <MdiIcon :path="sportIcon(match.sport?.slug)" :size="16" class="shrink-0" />
        <span class="truncate">{{ match.sport?.name }}</span>
        <span v-if="match.phase" class="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
          {{ match.phase }}
        </span>
      </div>
      <StatusPill class="shrink-0" :status="match.status" :is-upcoming="isMatchUpcoming(match.date, match.time)" />
    </div>

    <!-- Não elegível para palpite -->
    <template v-if="!isFullyDefined || (match.note && !isLocked)">
      <div class="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-neutral-200 bg-neutral-50/60 px-3 py-2.5 dark:border-neutral-700 dark:bg-neutral-800/40">
        <template v-if="match.teams.length >= 2">
          <div v-for="team in match.teams" :key="team.id" class="flex min-w-0 items-center gap-1.5">
            <TeamBadge :name="team.name" :color="team.primary_color" size="sm" />
            <span class="min-w-0 truncate text-sm font-semibold text-neutral-600 dark:text-neutral-300">{{ team.name }}</span>
          </div>
        </template>
        <span v-else class="flex min-w-0 flex-1 items-center gap-2 text-neutral-400 dark:text-neutral-500">
          <MdiIcon :path="mdiHelpCircleOutline" :size="16" />
          <span class="text-sm font-semibold">Equipes a definir</span>
        </span>
      </div>
      <p class="mb-1 inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
        <MdiIcon :path="mdiHelpCircleOutline" :size="14" />
        <span v-if="!isScheduled && match.teams.length === 2">Este jogo não está disponível para palpites — horário ainda não definido</span>
        <span v-else-if="match.teams.length > 2">Este jogo não está disponível para palpites — mais de 2 equipes disputam ao mesmo tempo</span>
        <span v-else>Este jogo não está disponível para palpites{{ match.note ? ` — ${match.note}` : '' }}</span>
      </p>
    </template>

    <!-- Elegível ou já com palpite -->
    <template v-else>
      <div class="mb-3 flex items-center justify-between gap-3">
        <div v-for="team in match.teams" :key="team.id" class="flex min-w-0 flex-1 items-center gap-2">
          <TeamBadge :name="team.name" :color="team.primary_color" size="sm" />
          <span class="min-w-0 truncate text-sm font-semibold">{{ team.name }}</span>
        </div>
      </div>

      <!-- Travado: mostra o palpite (e placar real, se já houver) -->
      <div v-if="isLocked" class="mb-3 space-y-2">
        <div v-if="bet" class="flex items-center justify-between rounded-xl bg-neutral-50 px-3 py-2.5 dark:bg-neutral-800/50">
          <span class="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
            <MdiIcon :path="mdiLockOutline" :size="14" />
            Seu palpite
          </span>
          <span class="font-numeric text-lg font-extrabold">{{ bet.predicted_home }} × {{ bet.predicted_away }}</span>
        </div>
        <div v-else class="rounded-xl bg-neutral-50 px-3 py-2.5 text-xs font-medium text-neutral-500 dark:bg-neutral-800/50 dark:text-neutral-400">
          Você não apostou neste jogo — o horário já passou.
        </div>
        <div v-if="match.status === 'finished'" class="flex items-center justify-between rounded-xl bg-accent-50 px-3 py-2.5 dark:bg-accent-500/10">
          <span class="text-xs font-semibold text-accent-700 dark:text-accent-400">Placar real</span>
          <span class="font-numeric text-lg font-extrabold text-accent-700 dark:text-accent-400">
            {{ scoreFor(match.teams[0].id) ?? '-' }} × {{ scoreFor(match.teams[1].id) ?? '-' }}
          </span>
        </div>
        <div v-if="bet && bet.points !== null" class="flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2.5 dark:bg-emerald-500/10">
          <span class="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <MdiIcon :path="mdiCheck" :size="14" />
            Pontos ganhos
          </span>
          <span class="font-numeric text-lg font-extrabold text-emerald-700 dark:text-emerald-400">{{ bet.points }}</span>
        </div>
      </div>

      <!-- Aberto para palpite: formulário -->
      <form v-else class="mb-3" @submit.prevent="onSubmit">
        <div class="flex items-center justify-center gap-3 rounded-xl bg-neutral-50 px-3 py-3 dark:bg-neutral-800/50">
          <label class="flex flex-col items-center gap-1">
            <span class="truncate text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">{{ match.teams[0].name }}</span>
            <input
              v-model.number="form.home"
              type="number"
              min="0"
              inputmode="numeric"
              class="font-numeric h-11 w-16 rounded-lg border border-neutral-300 bg-white text-center text-lg font-bold dark:border-neutral-700 dark:bg-neutral-900"
            />
          </label>
          <span class="mt-4 text-sm font-semibold text-neutral-400">×</span>
          <label class="flex flex-col items-center gap-1">
            <span class="truncate text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">{{ match.teams[1].name }}</span>
            <input
              v-model.number="form.away"
              type="number"
              min="0"
              inputmode="numeric"
              class="font-numeric h-11 w-16 rounded-lg border border-neutral-300 bg-white text-center text-lg font-bold dark:border-neutral-700 dark:bg-neutral-900"
            />
          </label>
        </div>

        <p v-if="errorMessage" class="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400">
          <MdiIcon :path="mdiAlertCircleOutline" :size="14" class="shrink-0" />
          {{ errorMessage }}
        </p>

        <button type="submit" class="btn-primary mt-2.5 w-full" :disabled="saving">
          <MdiIcon :path="bet ? mdiPencilOutline : mdiCheck" :size="16" />
          {{ saving ? 'Salvando...' : bet ? 'Atualizar palpite' : 'Salvar palpite' }}
        </button>
      </form>
    </template>

    <div class="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
      <span v-if="isScheduled" class="flex items-center gap-1">
        <MdiIcon :path="mdiClockOutline" :size="14" />
        {{ formatDateShort(match.date) }} · {{ formatTime(match.time) }}
      </span>
      <span v-else class="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
        <MdiIcon :path="mdiCalendarQuestion" :size="14" />
        Horário a definir
      </span>
      <RouterLink :to="`/jogos/${match.id}`" class="flex items-center gap-1 truncate hover:underline">
        <MdiIcon :path="mdiMapMarker" :size="14" />{{ match.location || 'Ver detalhes' }}
      </RouterLink>
    </div>
  </div>
</template>
