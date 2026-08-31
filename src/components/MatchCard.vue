<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { mdiCalendarQuestion, mdiClockOutline, mdiHelpCircleOutline, mdiMapMarker } from '@mdi/js'
import type { Match } from '@/types'
import TeamBadge from './TeamBadge.vue'
import StatusPill from './StatusPill.vue'
import MdiIcon from './MdiIcon.vue'
import { formatDateShort, formatTime, hasScheduledDateTime, isMatchUpcoming } from '@/utils/date'
import { sportIcon } from '@/utils/sportIcons'

const props = withDefaults(
  defineProps<{
    match: Match
    showDate?: boolean
  }>(),
  { showDate: true },
)

const isUpcoming = computed(() => isMatchUpcoming(props.match.date, props.match.time))

function scoreFor(teamId: number): number | null {
  const s = props.match.scores?.find((sc) => sc.team.id === teamId)
  return s ? s.points : null
}

function isWinner(teamId: number): boolean {
  const s = props.match.scores?.find((sc) => sc.team.id === teamId)
  return !!s?.is_winner
}

const hasScores = computed(() => props.match.scores && props.match.scores.length > 0)

// Barra de identidade das duas equipes, usada como faixa superior do card
// (mais discreto e reaproveitável do que colorir o fundo inteiro).
const accentGradient = computed(() => {
  if (props.match.teams.length < 2) return null
  const [a, b] = props.match.teams
  return `linear-gradient(90deg, ${a.primary_color || '#737373'}, ${b.primary_color || '#737373'})`
})

// Alguns jogos ainda não têm as duas equipes definidas (repescagem, "vencedor
// da partida X", classificados por posição em tabela, etc). Nesses casos a
// API manda menos de 2 times em `teams` e explica a pendência em `note`.
const isFullyDefined = computed(() => props.match.teams.length >= 2)

// Jogos com mais de 2 equipes (ex: Pife/Uno com 3-4, Laço Individual/Dupla com
// 7 — todas competindo "ao mesmo tempo", não é um confronto par-a-par) não
// cabem no layout de duas colunas; usamos uma lista de chips que quebra linha.
const hasManyTeams = computed(() => props.match.teams.length > 2)

const isScheduled = computed(() => hasScheduledDateTime(props.match.date, props.match.time))
</script>

<template>
  <RouterLink
    :to="`/jogos/${match.id}`"
    class="card card-hover relative block min-w-0 overflow-hidden p-4 sm:p-5"
  >
    <span
      v-if="accentGradient"
      class="absolute inset-x-0 top-0 h-1"
      :style="{ backgroundImage: accentGradient }"
      aria-hidden="true"
    ></span>
    <div class="mb-3 flex items-center justify-between gap-2">
      <div class="flex min-w-0 items-center gap-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">
        <MdiIcon :path="sportIcon(match.sport?.slug)" :size="16" class="shrink-0" />
        <span class="truncate">{{ match.sport?.name }}</span>
        <span v-if="match.phase" class="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
          {{ match.phase }}
        </span>
      </div>
      <StatusPill class="shrink-0" :status="match.status" :is-upcoming="isUpcoming" />
    </div>

    <template v-if="isFullyDefined && !hasManyTeams">
      <div class="mb-3 flex items-center justify-between gap-3">
        <div v-for="(team, idx) in match.teams" :key="team.id" class="flex min-w-0 flex-1 items-center gap-2" :class="idx === 1 ? 'flex-row-reverse text-right' : ''">
          <TeamBadge :name="team.name" :color="team.primary_color" size="sm" />
          <span class="min-w-0 truncate text-sm font-semibold" :class="isWinner(team.id) ? 'text-neutral-900 dark:text-white' : 'text-neutral-600 dark:text-neutral-300'">
            {{ team.name }}
          </span>
        </div>

        <div v-if="hasScores" class="font-numeric flex shrink-0 items-center gap-1.5 text-xl font-extrabold">
          <span v-for="team in match.teams" :key="team.id" :class="isWinner(team.id) ? 'text-accent-600 dark:text-accent-400' : 'text-neutral-400 dark:text-neutral-500'">
            {{ scoreFor(team.id) ?? '-' }}
          </span>
        </div>
        <div v-else class="shrink-0 text-sm font-semibold text-neutral-400 dark:text-neutral-500">vs</div>
      </div>
    </template>

    <!-- Jogo com mais de 2 equipes disputando ao mesmo tempo (Pife/Uno, Laço) -->
    <template v-else-if="isFullyDefined && hasManyTeams">
      <div class="mb-3 flex flex-wrap gap-1.5">
        <div
          v-for="team in match.teams"
          :key="team.id"
          class="flex min-w-0 items-center gap-1.5 rounded-full border border-neutral-200 py-1 pl-1 pr-2.5 dark:border-neutral-700"
          :class="isWinner(team.id) ? 'bg-accent-50 dark:bg-accent-500/10' : ''"
        >
          <TeamBadge :name="team.name" :color="team.primary_color" size="sm" />
          <span class="min-w-0 truncate text-xs font-semibold" :class="isWinner(team.id) ? 'text-accent-700 dark:text-accent-400' : 'text-neutral-600 dark:text-neutral-300'">
            {{ team.name }}
          </span>
          <span v-if="hasScores" class="font-numeric shrink-0 text-xs font-extrabold" :class="isWinner(team.id) ? 'text-accent-700 dark:text-accent-400' : 'text-neutral-400 dark:text-neutral-500'">
            {{ scoreFor(team.id) ?? '-' }}
          </span>
        </div>
      </div>
    </template>

    <!-- Jogo com equipe(s) ainda a definir (repescagem, vencedor de outra partida, etc.) -->
    <template v-else>
      <div class="mb-3 flex items-center justify-between gap-3 rounded-xl border border-dashed border-neutral-200 bg-neutral-50/60 px-3 py-2.5 dark:border-neutral-700 dark:bg-neutral-800/40">
        <div v-if="match.teams[0]" class="flex min-w-0 flex-1 items-center gap-2">
          <TeamBadge :name="match.teams[0].name" :color="match.teams[0].primary_color" size="sm" />
          <span class="min-w-0 truncate text-sm font-semibold text-neutral-600 dark:text-neutral-300">{{ match.teams[0].name }}</span>
        </div>
        <div v-else class="flex min-w-0 flex-1 items-center gap-2 text-neutral-400 dark:text-neutral-500">
          <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-dashed border-neutral-300 dark:border-neutral-600">
            <MdiIcon :path="mdiHelpCircleOutline" :size="16" />
          </span>
          <span class="min-w-0 truncate text-sm font-semibold">A definir</span>
        </div>
        <span class="shrink-0 text-sm font-semibold text-neutral-400">vs</span>
        <div class="flex min-w-0 flex-1 items-center justify-end gap-2 text-right text-neutral-400 dark:text-neutral-500">
          <span class="min-w-0 truncate text-sm font-semibold">A definir</span>
          <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-dashed border-neutral-300 dark:border-neutral-600">
            <MdiIcon :path="mdiHelpCircleOutline" :size="16" />
          </span>
        </div>
      </div>
      <p v-if="match.note" class="mb-3 inline-flex items-center gap-1.5 rounded-full bg-accent-50 px-2.5 py-1 text-xs font-semibold text-accent-700 dark:bg-accent-500/10 dark:text-accent-400">
        <MdiIcon :path="mdiHelpCircleOutline" :size="14" />
        {{ match.note }}
      </p>
    </template>

    <p v-if="isFullyDefined && match.note" class="mb-3 text-xs font-medium text-neutral-500 dark:text-neutral-400">
      {{ match.note }}
    </p>

    <div class="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
      <span v-if="isScheduled" class="flex items-center gap-1">
        <MdiIcon :path="mdiClockOutline" :size="14" />
        <span v-if="showDate">{{ formatDateShort(match.date) }} · </span>{{ formatTime(match.time) }}
      </span>
      <span v-else class="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
        <MdiIcon :path="mdiCalendarQuestion" :size="14" />
        Horário a definir
      </span>
      <span v-if="match.location" class="flex items-center gap-1 truncate">
        <MdiIcon :path="mdiMapMarker" :size="14" />{{ match.location }}
      </span>
    </div>
  </RouterLink>
</template>
