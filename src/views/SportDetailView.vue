<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { mdiArrowLeft, mdiCalendarMonth, mdiCalendarQuestion, mdiTrophy } from '@mdi/js'
import { useSportsStore } from '@/stores/sports'
import { useMatchesStore } from '@/stores/matches'
import MatchCard from '@/components/MatchCard.vue'
import SectionHeader from '@/components/SectionHeader.vue'
import LoadingSkeleton from '@/components/LoadingSkeleton.vue'
import EmptyState from '@/components/EmptyState.vue'
import ErrorState from '@/components/ErrorState.vue'
import TeamBadge from '@/components/TeamBadge.vue'
import MdiIcon from '@/components/MdiIcon.vue'
import { sportIcon } from '@/utils/sportIcons'
import { rankBadgeClass, rankBorderClass } from '@/utils/rank'
import { hasScheduledDateTime } from '@/utils/date'

const props = defineProps<{ slug: string }>()
const sportsStore = useSportsStore()
const matchesStore = useMatchesStore()

function load() {
  sportsStore.fetchSportBySlug(props.slug)
  // Agrega TODAS as páginas de jogos desta modalidade — algumas modalidades
  // (ex: Truco, Pife) têm muitas rodadas e podem passar de uma página.
  matchesStore.fetchBySport(props.slug)
}

onMounted(load)
watch(() => props.slug, load)

// Classificação simples derivada dos jogos finalizados desta modalidade.
interface SimpleStanding {
  id: number
  name: string
  color: string
  wins: number
  losses: number
  draws: number
  points: number
}

const derivedStandings = computed<SimpleStanding[]>(() => {
  const map = new Map<number, SimpleStanding>()
  const finished = matchesStore.bySport.filter((m) => m.status === 'finished')

  for (const match of finished) {
    for (const team of match.teams) {
      if (!map.has(team.id)) {
        map.set(team.id, { id: team.id, name: team.name, color: team.primary_color, wins: 0, losses: 0, draws: 0, points: 0 })
      }
    }

    const scores = match.scores
    if (!scores || scores.length === 0) continue
    const winners = scores.filter((s) => s.is_winner)
    const isDraw = winners.length === 0 || winners.length === scores.length

    for (const score of scores) {
      const entry = map.get(score.team.id)
      if (!entry) continue
      if (isDraw) {
        entry.draws += 1
        entry.points += 1
      } else if (score.is_winner) {
        entry.wins += 1
        entry.points += 3
      } else {
        entry.losses += 1
      }
    }
  }

  return Array.from(map.values()).sort((a, b) => b.points - a.points)
})

// Alguns jogos (ex: Valorant, League of Legends) ainda não têm data/horário
// confirmado — isolados em seção própria pra não quebrar a leitura cronológica.
const scheduledMatches = computed(() => matchesStore.bySport.filter((m) => hasScheduledDateTime(m.date, m.time)))
const undatedMatches = computed(() => matchesStore.bySport.filter((m) => !hasScheduledDateTime(m.date, m.time)))
</script>

<template>
  <div>
    <RouterLink to="/modalidades" class="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-accent-600 hover:underline dark:text-accent-400">
      <MdiIcon :path="mdiArrowLeft" :size="16" /> Voltar às modalidades
    </RouterLink>

    <LoadingSkeleton v-if="sportsStore.currentSportLoading" variant="text" :count="3" />
    <ErrorState v-else-if="sportsStore.currentSportError" :message="sportsStore.currentSportError" @retry="load" />

    <div v-else-if="sportsStore.currentSport" class="space-y-8">
      <div class="card flex items-center gap-4 p-6">
        <span class="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-accent-50 text-accent-700 dark:bg-accent-500/10 dark:text-accent-400">
          <MdiIcon :path="sportIcon(sportsStore.currentSport.slug, sportsStore.currentSport.category)" :size="32" />
        </span>
        <div>
          <h1 class="text-2xl font-extrabold">{{ sportsStore.currentSport.name }}</h1>
          <p class="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">{{ sportsStore.currentSport.category }}</p>
          <p v-if="sportsStore.currentSport.description" class="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            {{ sportsStore.currentSport.description }}
          </p>
        </div>
      </div>

      <section v-if="derivedStandings.length > 0">
        <SectionHeader title="Classificação da modalidade" :icon="mdiTrophy" />
        <div class="card overflow-hidden">
          <div
            v-for="(s, idx) in derivedStandings"
            :key="s.id"
            class="flex items-center gap-3 border-b border-l-2 border-neutral-100 px-4 py-3 last:border-b-0 dark:border-neutral-800"
            :class="rankBorderClass(idx + 1)"
          >
            <span
              class="font-numeric flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-center text-xs font-bold"
              :class="rankBadgeClass(idx + 1)"
            >{{ idx + 1 }}</span>
            <TeamBadge :name="s.name" :color="s.color" size="sm" />
            <span class="flex-1 truncate font-semibold">{{ s.name }}</span>
            <span class="hidden text-xs text-neutral-500 sm:block dark:text-neutral-400">{{ s.wins }}V {{ s.draws }}E {{ s.losses }}D</span>
            <span class="font-numeric text-lg font-extrabold text-accent-600 dark:text-accent-400">{{ s.points }}</span>
          </div>
        </div>
      </section>

      <section>
        <SectionHeader :title="`Jogos (${matchesStore.bySport.length})`" :icon="mdiCalendarMonth" />
        <LoadingSkeleton v-if="matchesStore.bySportLoading" :count="3" />
        <ErrorState v-else-if="matchesStore.bySportError" :message="matchesStore.bySportError" @retry="load" />
        <EmptyState v-else-if="matchesStore.bySport.length === 0" title="Nenhum jogo cadastrado" message="Ainda não há jogos para esta modalidade." :icon="mdiCalendarMonth" />
        <template v-else>
          <div class="grid gap-3 sm:grid-cols-2">
            <MatchCard v-for="m in scheduledMatches" :key="m.id" :match="m" />
          </div>

          <template v-if="undatedMatches.length > 0">
            <SectionHeader title="Ainda sem data confirmada" :icon="mdiCalendarQuestion" class="mt-8" />
            <div class="grid gap-3 sm:grid-cols-2">
              <MatchCard v-for="m in undatedMatches" :key="m.id" :match="m" />
            </div>
          </template>
        </template>
      </section>
    </div>
  </div>
</template>
