<script setup lang="ts">
import { computed, onMounted, reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { mdiChevronLeft, mdiChevronRight, mdiClipboardTextOutline, mdiMagnify } from '@mdi/js'
import { useMatchesStore } from '@/stores/matches'
import { useSportsStore } from '@/stores/sports'
import { useTeamsStore } from '@/stores/teams'
import AdminResultCard from '@/components/AdminResultCard.vue'
import FilterBar, { type QuickFilter } from '@/components/FilterBar.vue'
import LoadingSkeleton from '@/components/LoadingSkeleton.vue'
import EmptyState from '@/components/EmptyState.vue'
import ErrorState from '@/components/ErrorState.vue'
import SectionHeader from '@/components/SectionHeader.vue'
import MdiIcon from '@/components/MdiIcon.vue'
import { todayIso } from '@/utils/date'
import { ApiError } from '@/services/api'
import type { MatchStatus } from '@/types'

const matchesStore = useMatchesStore()
const sportsStore = useSportsStore()
const teamsStore = useTeamsStore()
const route = useRoute()
const router = useRouter()

const quickFilter = computed<QuickFilter>(() => (route.query.quick as QuickFilter) || 'all')
const date = computed(() => (route.query.date as string) || '')
const sport = computed(() => (route.query.sport as string) || '')
const team = computed(() => (route.query.team as string) || '')
const phase = computed(() => (route.query.phase as string) || '')
const page = computed(() => Number(route.query.page) || 1)

const knownPhases = computed(() => {
  const set = new Set<string>()
  for (const m of matchesStore.list) {
    if (m.phase) set.add(m.phase)
  }
  if (phase.value) set.add(phase.value)
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'))
})

function updateQuery(patch: Record<string, string | number | undefined>) {
  router.push({ query: { ...route.query, ...patch, page: patch.page ?? undefined } })
}

function loadMatches() {
  const filters: { date?: string; sport?: string; team?: string; phase?: string; status?: MatchStatus | ''; page?: number } = {
    date: date.value || undefined,
    sport: sport.value || undefined,
    team: team.value || undefined,
    phase: phase.value || undefined,
    page: page.value,
  }

  if (quickFilter.value === 'today') filters.date = todayIso()
  if (quickFilter.value === 'finished') filters.status = 'finished'
  if (quickFilter.value === 'live') filters.status = 'live'
  if (quickFilter.value === 'upcoming') filters.status = 'scheduled'

  matchesStore.fetchList(filters)
}

onMounted(() => {
  sportsStore.fetchSports()
  teamsStore.fetchTeams()
  loadMatches()
})

watch([quickFilter, date, sport, team, phase, page], loadMatches)

function setQuickFilter(v: QuickFilter) {
  updateQuery({ quick: v, page: 1 })
}
function setDate(v: string) {
  updateQuery({ date: v || undefined, page: 1 })
}
function setSport(v: string) {
  updateQuery({ sport: v || undefined, page: 1 })
}
function setTeam(v: string) {
  updateQuery({ team: v || undefined, page: 1 })
}
function setPhase(v: string) {
  updateQuery({ phase: v || undefined, page: 1 })
}
function clearFilters() {
  router.push({ query: {} })
}
function goToPage(p: number) {
  const clamped = Math.min(Math.max(1, p), matchesStore.listTotalPages)
  updateQuery({ page: clamped })
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
function onJumpToPage(event: Event) {
  const value = Number((event.target as HTMLInputElement).value)
  if (!Number.isFinite(value) || value < 1) return
  goToPage(value)
}

const saveErrors = reactive<Record<number, string>>({})
const savingMatchId = computed(() => matchesStore.savingMatchId)

async function onSaveResult(matchId: number, scores: { teamId: number; points: number }[]) {
  delete saveErrors[matchId]
  try {
    const updated = await matchesStore.setMatchResult(matchId, {
      scores: scores.map((s) => ({ team_id: s.teamId, points: s.points })),
    })
    const idx = matchesStore.list.findIndex((m) => m.id === matchId)
    if (idx >= 0) matchesStore.list.splice(idx, 1, updated)
  } catch (err) {
    saveErrors[matchId] = err instanceof ApiError ? err.message : 'Não foi possível salvar o resultado.'
  }
}
</script>

<template>
  <div>
    <SectionHeader title="Lançar resultados" subtitle="Área restrita à organização — informe o placar de cada jogo" :icon="mdiClipboardTextOutline" />

    <FilterBar
      :quick-filter="quickFilter"
      :date="date"
      :sport="sport"
      :team="team"
      :phase="phase"
      :sports="sportsStore.sports"
      :teams="teamsStore.teams"
      :phases="knownPhases"
      @update:quick-filter="setQuickFilter"
      @update:date="setDate"
      @update:sport="setSport"
      @update:team="setTeam"
      @update:phase="setPhase"
      @clear="clearFilters"
    />

    <LoadingSkeleton v-if="matchesStore.listLoading" :count="6" />
    <ErrorState v-else-if="matchesStore.listError" :message="matchesStore.listError" @retry="loadMatches" />
    <EmptyState
      v-else-if="matchesStore.list.length === 0"
      title="Nenhum jogo encontrado"
      message="Tente ajustar os filtros para ver outros jogos."
      :icon="mdiMagnify"
    />
    <template v-else>
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <AdminResultCard
          v-for="m in matchesStore.list"
          :key="m.id"
          :match="m"
          :saving="savingMatchId === m.id"
          :error-message="saveErrors[m.id]"
          @save="(scores) => onSaveResult(m.id, scores)"
        />
      </div>

      <div v-if="matchesStore.listTotalPages > 1" class="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          class="btn-secondary min-h-11 min-w-11 px-3"
          :disabled="matchesStore.listPage <= 1"
          aria-label="Página anterior"
          @click="goToPage(matchesStore.listPage - 1)"
        >
          <MdiIcon :path="mdiChevronLeft" :size="18" />
        </button>

        <span class="flex items-center gap-2 text-sm font-medium text-neutral-500 dark:text-neutral-400">
          Página
          <input
            type="number"
            class="tabular min-h-11 w-16 rounded-lg border border-neutral-300 bg-white px-2 text-center text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
            :min="1"
            :max="matchesStore.listTotalPages"
            :value="matchesStore.listPage"
            aria-label="Ir para a página"
            @change="onJumpToPage"
          />
          de {{ matchesStore.listTotalPages }}
        </span>

        <button
          type="button"
          class="btn-secondary min-h-11 min-w-11 px-3"
          :disabled="matchesStore.listPage >= matchesStore.listTotalPages"
          aria-label="Próxima página"
          @click="goToPage(matchesStore.listPage + 1)"
        >
          <MdiIcon :path="mdiChevronRight" :size="18" />
        </button>
      </div>
    </template>
  </div>
</template>
