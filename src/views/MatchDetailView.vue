<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { mdiArrowLeft, mdiCalendarMonth, mdiCalendarQuestion, mdiHelpCircleOutline, mdiMapMarker, mdiNoteTextOutline } from '@mdi/js'
import { matchesService } from '@/services/matchesService'
import { ApiError } from '@/services/api'
import type { Match } from '@/types'
import TeamBadge from '@/components/TeamBadge.vue'
import StatusPill from '@/components/StatusPill.vue'
import LoadingSkeleton from '@/components/LoadingSkeleton.vue'
import ErrorState from '@/components/ErrorState.vue'
import MdiIcon from '@/components/MdiIcon.vue'
import { formatDateLong, formatTime, hasScheduledDateTime, isMatchUpcoming } from '@/utils/date'
import { sportIcon } from '@/utils/sportIcons'

const props = defineProps<{ id: string }>()

const match = ref<Match | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

async function load() {
  loading.value = true
  error.value = null
  match.value = null
  try {
    match.value = await matchesService.getById(props.id)
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : 'Erro ao carregar o jogo.'
  } finally {
    loading.value = false
  }
}

onMounted(load)
watch(() => props.id, load)

function scoreFor(teamId: number): number | null {
  const s = match.value?.scores?.find((sc) => sc.team.id === teamId)
  return s ? s.points : null
}
function isWinner(teamId: number): boolean {
  const s = match.value?.scores?.find((sc) => sc.team.id === teamId)
  return !!s?.is_winner
}

// Jogos com mais de 2 equipes disputando ao mesmo tempo (Pife/Uno com 3-4,
// Laço Individual/Dupla com 7) não cabem no layout "lado a lado" de 2 times.
const hasManyTeams = computed(() => (match.value?.teams.length ?? 0) > 2)
const isScheduled = computed(() => hasScheduledDateTime(match.value?.date, match.value?.time))
const hasScores = computed(() => !!match.value?.scores && match.value.scores.length > 0)
</script>

<template>
  <div class="mx-auto max-w-2xl">
    <RouterLink to="/jogos" class="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-accent-600 hover:underline dark:text-accent-400">
      <MdiIcon :path="mdiArrowLeft" :size="16" /> Voltar aos jogos
    </RouterLink>

    <LoadingSkeleton v-if="loading" variant="text" :count="4" />
    <ErrorState v-else-if="error" :message="error" @retry="load" />

    <div v-else-if="match" class="card p-6 sm:p-8">
      <div class="mb-6 flex items-center justify-between">
        <div class="flex items-center gap-2 text-sm font-medium text-neutral-500 dark:text-neutral-400">
          <MdiIcon :path="sportIcon(match.sport?.slug)" :size="18" />
          <span>{{ match.sport?.name }}</span>
          <span v-if="match.phase" class="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
            {{ match.phase }}
          </span>
        </div>
        <StatusPill :status="match.status" :is-upcoming="isMatchUpcoming(match.date, match.time)" />
      </div>

      <div v-if="match.teams.length === 2" class="flex items-center justify-around gap-4">
        <div v-for="team in match.teams" :key="team.id" class="flex flex-1 flex-col items-center gap-3 text-center">
          <TeamBadge :name="team.name" :color="team.primary_color" size="lg" />
          <RouterLink :to="`/equipes/${team.slug}`" class="font-bold hover:underline">{{ team.name }}</RouterLink>
          <span
            class="font-numeric text-5xl font-extrabold"
            :class="isWinner(team.id) ? 'text-accent-600 dark:text-accent-400' : 'text-neutral-400'"
          >
            {{ scoreFor(team.id) ?? '-' }}
          </span>
        </div>
      </div>

      <!-- Jogo com mais de 2 equipes disputando ao mesmo tempo (Pife/Uno, Laço) -->
      <div v-else-if="hasManyTeams" class="flex flex-wrap justify-center gap-2.5">
        <div
          v-for="team in match.teams"
          :key="team.id"
          class="flex min-w-0 items-center gap-2 rounded-full border border-neutral-200 py-1.5 pl-1.5 pr-3 dark:border-neutral-700"
          :class="isWinner(team.id) ? 'bg-accent-50 dark:bg-accent-500/10' : ''"
        >
          <TeamBadge :name="team.name" :color="team.primary_color" size="sm" />
          <RouterLink
            :to="`/equipes/${team.slug}`"
            class="min-w-0 truncate text-sm font-semibold hover:underline"
            :class="isWinner(team.id) ? 'text-accent-700 dark:text-accent-400' : 'text-neutral-700 dark:text-neutral-300'"
          >
            {{ team.name }}
          </RouterLink>
          <span v-if="hasScores" class="font-numeric shrink-0 text-sm font-extrabold" :class="isWinner(team.id) ? 'text-accent-700 dark:text-accent-400' : 'text-neutral-400'">
            {{ scoreFor(team.id) ?? '-' }}
          </span>
        </div>
      </div>

      <!-- Jogo com equipe(s) ainda a definir -->
      <div v-else class="flex items-center justify-around gap-4">
        <div v-if="match.teams[0]" class="flex flex-1 flex-col items-center gap-3 text-center">
          <TeamBadge :name="match.teams[0].name" :color="match.teams[0].primary_color" size="lg" />
          <RouterLink :to="`/equipes/${match.teams[0].slug}`" class="font-bold hover:underline">{{ match.teams[0].name }}</RouterLink>
        </div>
        <div v-else class="flex flex-1 flex-col items-center gap-3 text-center text-neutral-400 dark:text-neutral-500">
          <span class="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-neutral-300 dark:border-neutral-600">
            <MdiIcon :path="mdiHelpCircleOutline" :size="28" />
          </span>
          <span class="font-bold">A definir</span>
        </div>
        <span class="shrink-0 text-lg font-bold text-neutral-300 dark:text-neutral-600">vs</span>
        <div class="flex flex-1 flex-col items-center gap-3 text-center text-neutral-400 dark:text-neutral-500">
          <span class="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-neutral-300 dark:border-neutral-600">
            <MdiIcon :path="mdiHelpCircleOutline" :size="28" />
          </span>
          <span class="font-bold">A definir</span>
        </div>
      </div>
      <p v-if="match.teams.length < 2 && match.note" class="mt-4 inline-flex items-center gap-1.5 rounded-full bg-accent-50 px-3 py-1.5 text-sm font-semibold text-accent-700 dark:bg-accent-500/10 dark:text-accent-400">
        <MdiIcon :path="mdiHelpCircleOutline" :size="16" />
        Aguardando definição: {{ match.note }}
      </p>

      <div class="mt-8 grid gap-3 border-t border-neutral-100 pt-6 text-sm dark:border-neutral-800">
        <div v-if="isScheduled" class="flex items-center gap-2 text-neutral-600 dark:text-neutral-300">
          <MdiIcon :path="mdiCalendarMonth" :size="18" /> {{ formatDateLong(match.date) }} às {{ formatTime(match.time) }}
        </div>
        <div v-else class="flex items-center gap-2 font-semibold text-amber-600 dark:text-amber-400">
          <MdiIcon :path="mdiCalendarQuestion" :size="18" /> Horário a definir
        </div>
        <div v-if="match.location" class="flex items-center gap-2 text-neutral-600 dark:text-neutral-300">
          <MdiIcon :path="mdiMapMarker" :size="18" /> {{ match.location }}
        </div>
        <div v-if="match.note && match.teams.length >= 2" class="flex items-start gap-2 text-neutral-600 dark:text-neutral-300">
          <MdiIcon :path="mdiNoteTextOutline" :size="18" /> {{ match.note }}
        </div>
      </div>
    </div>
  </div>
</template>
