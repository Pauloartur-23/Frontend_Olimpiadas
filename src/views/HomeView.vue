<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import {
  mdiChartBar,
  mdiChevronRight,
  mdiClockOutline,
  mdiFlagCheckered,
  mdiMedal,
  mdiRecordCircle,
  mdiTrophy,
} from '@mdi/js'
import { useMatchesStore } from '@/stores/matches'
import { useStandingsStore } from '@/stores/standings'
import { useCountdown } from '@/composables/useCountdown'
import { rankBadgeClass, rankBorderClass } from '@/utils/rank'
import MatchCard from '@/components/MatchCard.vue'
import TeamBadge from '@/components/TeamBadge.vue'
import SectionHeader from '@/components/SectionHeader.vue'
import LoadingSkeleton from '@/components/LoadingSkeleton.vue'
import EmptyState from '@/components/EmptyState.vue'
import ErrorState from '@/components/ErrorState.vue'
import MdiIcon from '@/components/MdiIcon.vue'

const matchesStore = useMatchesStore()
const standingsStore = useStandingsStore()

const EVENT_START = new Date(2026, 8, 1, 8, 0, 0) // 01/09/2026 08:00
const EVENT_END = new Date(2026, 8, 3, 23, 59, 59) // 03/09/2026 fim do dia

const { phase, remaining } = useCountdown(EVENT_START, EVENT_END)

const countdownParts = computed(() => [
  { label: 'dias', value: remaining.value.days },
  { label: 'horas', value: remaining.value.hours },
  { label: 'min', value: remaining.value.minutes },
  { label: 'seg', value: remaining.value.seconds },
])

const top5Standings = computed(() => standingsStore.standings.slice(0, 5))

function loadAll() {
  matchesStore.fetchLive()
  matchesStore.fetchToday()
  matchesStore.fetchRecentResults()
  standingsStore.fetchStandings()
}

onMounted(loadAll)
</script>

<template>
  <div class="space-y-12">
    <!-- Hero -->
    <section class="relative overflow-hidden rounded-3xl bg-linear-to-br from-neutral-950 via-accent-900 to-accent-700 px-6 py-10 text-white shadow-xl shadow-accent-900/20 sm:px-10 sm:py-14">
      <p class="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-accent-200">
        <span class="h-1.5 w-1.5 rounded-full bg-accent-300"></span>
        01 a 03 de setembro de 2026 · IFC Araquari
      </p>
      <h1 class="mt-3 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">Olimpíadas IFC<br class="hidden sm:block" /> Araquari 2026</h1>
      <p class="mt-4 max-w-xl text-base leading-relaxed text-neutral-300 sm:text-lg">
        Acompanhe em tempo real os jogos, a classificação e os resultados das Olimpíadas Internas dos Cursos Técnicos.
      </p>

      <div class="mt-8">
        <template v-if="phase === 'before'">
          <p class="mb-3 text-xs font-bold uppercase tracking-wide text-neutral-400">O evento começa em</p>
          <div class="flex flex-wrap gap-2.5">
            <div
              v-for="part in countdownParts"
              :key="part.label"
              class="flex w-16 flex-col items-center rounded-xl bg-white/10 py-2.5 sm:w-20 sm:py-3"
            >
              <span class="font-numeric text-2xl font-bold leading-none text-white sm:text-3xl">{{ String(part.value).padStart(2, '0') }}</span>
              <span class="mt-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-400 sm:text-xs">{{ part.label }}</span>
            </div>
          </div>
        </template>
        <template v-else-if="phase === 'during'">
          <p class="inline-flex items-center gap-2 rounded-full bg-red-500/15 px-4 py-2 text-sm font-bold text-red-300 ring-1 ring-inset ring-red-400/30">
            <span class="relative flex h-2 w-2">
              <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
              <span class="relative inline-flex h-2 w-2 rounded-full bg-red-400"></span>
            </span>
            O evento está em andamento!
          </p>
        </template>
        <template v-else>
          <p class="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-4 py-2 text-sm font-bold text-emerald-300 ring-1 ring-inset ring-emerald-400/30">
            <MdiIcon :path="mdiFlagCheckered" :size="18" />
            O evento foi encerrado. Confira os resultados finais!
          </p>
        </template>
      </div>

      <div class="mt-8 flex flex-wrap gap-2.5">
        <RouterLink to="/jogos" class="btn-primary bg-white text-accent-900 hover:bg-neutral-100 active:bg-neutral-200">Ver todos os jogos</RouterLink>
        <RouterLink to="/equipes" class="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/6 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/15">Equipes</RouterLink>
        <RouterLink to="/modalidades" class="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/6 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/15">Modalidades</RouterLink>
      </div>
    </section>

    <!-- Ao vivo -->
    <section v-if="matchesStore.live.length > 0 || matchesStore.liveLoading">
      <SectionHeader title="Jogos ao vivo agora" :icon="mdiRecordCircle" />
      <LoadingSkeleton v-if="matchesStore.liveLoading" :count="2" />
      <div v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <MatchCard v-for="m in matchesStore.live" :key="m.id" :match="m" />
      </div>
    </section>

    <!-- Hoje -->
    <section>
      <SectionHeader title="Jogos de hoje" :icon="mdiClockOutline">
        <template #action>
          <RouterLink to="/hoje" class="inline-flex items-center gap-1 text-sm font-semibold text-accent-600 hover:underline dark:text-accent-400">
            Ver dia completo <MdiIcon :path="mdiChevronRight" :size="16" />
          </RouterLink>
        </template>
      </SectionHeader>
      <LoadingSkeleton v-if="matchesStore.todayLoading" />
      <ErrorState v-else-if="matchesStore.todayError" :message="matchesStore.todayError" @retry="matchesStore.fetchToday" />
      <EmptyState v-else-if="matchesStore.today.length === 0" title="Nenhum jogo hoje" message="Não há partidas programadas para hoje." />
      <div v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <MatchCard v-for="m in matchesStore.today" :key="m.id" :match="m" :show-date="false" />
      </div>
    </section>

    <!-- Últimos resultados -->
    <section>
      <SectionHeader title="Últimos resultados" :icon="mdiChartBar" />
      <LoadingSkeleton v-if="matchesStore.recentResultsLoading" />
      <ErrorState v-else-if="matchesStore.recentResultsError" :message="matchesStore.recentResultsError" @retry="matchesStore.fetchRecentResults" />
      <EmptyState
        v-else-if="matchesStore.recentResults.length === 0"
        title="Ainda não há resultados"
        message="Os resultados aparecerão aqui assim que os jogos forem finalizados."
        :icon="mdiFlagCheckered"
      />
      <div v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <MatchCard v-for="m in matchesStore.recentResults.slice(0, 6)" :key="m.id" :match="m" />
      </div>
    </section>

    <!-- Classificação -->
    <section>
      <SectionHeader title="Classificação geral" :icon="mdiTrophy">
        <template #action>
          <RouterLink to="/classificacao" class="inline-flex items-center gap-1 text-sm font-semibold text-accent-600 hover:underline dark:text-accent-400">
            Ver tabela completa <MdiIcon :path="mdiChevronRight" :size="16" />
          </RouterLink>
        </template>
      </SectionHeader>
      <LoadingSkeleton v-if="standingsStore.loading" variant="row" :count="5" />
      <ErrorState v-else-if="standingsStore.error" :message="standingsStore.error" @retry="() => standingsStore.fetchStandings(true)" />
      <EmptyState v-else-if="top5Standings.length === 0" title="Classificação indisponível" message="A tabela de classificação ainda não foi publicada." :icon="mdiTrophy" />
      <div v-else class="card overflow-hidden">
        <RouterLink
          v-for="s in top5Standings"
          :key="s.team.id"
          :to="`/equipes/${s.team.slug}`"
          class="flex items-center gap-4 border-b border-l-2 border-neutral-100 px-4 py-3 transition-colors last:border-b-0 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/60"
          :class="rankBorderClass(s.position)"
        >
          <span
            class="font-numeric flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-center text-xs font-bold"
            :class="rankBadgeClass(s.position)"
          >{{ s.position }}</span>
          <TeamBadge :name="s.team.name" :color="s.team.primary_color" :logo="s.team.logo" size="sm" />
          <span class="flex-1 truncate font-semibold">{{ s.team.name }}</span>
          <span class="hidden gap-3 text-xs text-neutral-500 sm:flex dark:text-neutral-400">
            <span class="flex items-center gap-1"><MdiIcon :path="mdiMedal" :size="14" class="text-amber-500" />{{ s.gold }}</span>
            <span class="flex items-center gap-1"><MdiIcon :path="mdiMedal" :size="14" class="text-neutral-400" />{{ s.silver }}</span>
            <span class="flex items-center gap-1"><MdiIcon :path="mdiMedal" :size="14" class="text-amber-700" />{{ s.bronze }}</span>
          </span>
          <span class="font-numeric text-lg font-extrabold text-accent-600 dark:text-accent-400">{{ s.points }}</span>
        </RouterLink>
      </div>
    </section>
  </div>
</template>
