<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { mdiArrowLeft, mdiCalendarMonth, mdiCalendarQuestion, mdiCrown, mdiTrophy } from '@mdi/js'
import { useSportsStore } from '@/stores/sports'
import { useMatchesStore } from '@/stores/matches'
import { placementsService } from '@/services/placementsService'
import { ApiError } from '@/services/api'
import type { EventPlacementEntry } from '@/types'
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

// Pódio (EventPlacement) da modalidade — usado só quando ela não tem
// jogos cadastrados (ex: Laço, Uno, Xadrez, Pife: resultado é lançado
// direto pela organização como colocação 1º/2º/3º, sem confronto
// par-a-par pra derivar classificação de `Match`).
const podium = ref<EventPlacementEntry[]>([])
const podiumLoading = ref(false)
const podiumError = ref<string | null>(null)

async function loadPodium(label: string) {
  podiumLoading.value = true
  podiumError.value = null
  try {
    podium.value = await placementsService.byLabel(label)
  } catch (err) {
    podiumError.value = err instanceof ApiError ? err.message : 'Erro ao carregar o pódio.'
  } finally {
    podiumLoading.value = false
  }
}

async function load() {
  podium.value = []
  await sportsStore.fetchSportBySlug(props.slug)
  // Agrega TODAS as páginas de jogos desta modalidade — algumas modalidades
  // (ex: Truco, Pife) têm muitas rodadas e podem passar de uma página.
  matchesStore.fetchBySport(props.slug)
  if (sportsStore.currentSport) {
    loadPodium(sportsStore.currentSport.name)
  }
}

onMounted(load)
watch(() => props.slug, load)

const podiumPlaces = computed(() => podium.value.filter((p) => p.position !== null))

// Classificação simples derivada dos jogos finalizados desta modalidade.
interface SimpleStanding {
  id: number
  name: string
  slug: string
  color: string
  wins: number
  losses: number
  draws: number
  points: number
}

// Critério de "campeão": se a modalidade tem uma Final disputada
// (finalizada), o topo da classificação é o resultado dessa Final —
// não a soma de vitórias em todas as fases (quartas/semis também
// contam pontos, o que pode empurrar quem perdeu a Final para cima só
// por ter vencido mais jogos nas fases anteriores). Sem Final (ex:
// Truco, Uno, Xadrez, Pife — rodízio/todos-contra-todos), o critério é
// a classificação da fase de grupo, que aqui já é a soma de pontos de
// todos os jogos finalizados (não há outra fase para conflitar).
const derivedStandings = computed<SimpleStanding[]>(() => {
  const map = new Map<number, SimpleStanding>()
  const finished = matchesStore.bySport.filter((m) => m.status === 'finished')

  for (const match of finished) {
    for (const team of match.teams) {
      if (!map.has(team.id)) {
        map.set(team.id, {
          id: team.id,
          name: team.name,
          slug: team.slug,
          color: team.primary_color,
          wins: 0,
          losses: 0,
          draws: 0,
          points: 0,
        })
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

  const standings = Array.from(map.values())

  const finalMatch = finished.find((m) => m.phase === 'Final')
  const finalScores = finalMatch?.scores ?? []
  const finalWinners = finalScores.filter((s) => s.is_winner)
  const finalIsDecided = finalMatch && finalScores.length > 0 && finalWinners.length === 1

  if (finalIsDecided) {
    const championId = finalWinners[0]!.team.id
    const runnerUpIds = new Set(finalScores.filter((s) => !s.is_winner).map((s) => s.team.id))
    // Campeão primeiro, vice(s) da Final em seguida, o resto pelos
    // pontos agregados (mesmo critério de antes, só como desempate
    // secundário abaixo do pódio da Final).
    return standings.sort((a, b) => {
      const rank = (id: number) => (id === championId ? 0 : runnerUpIds.has(id) ? 1 : 2)
      const diff = rank(a.id) - rank(b.id)
      return diff !== 0 ? diff : b.points - a.points
    })
  }

  return standings.sort((a, b) => b.points - a.points)
})

// Equipe campeã da modalidade, quando já é possível afirmar isso com
// segurança — nunca "chuta" um campeão em caso de empate sem critério
// de desempate (ex: Truco, com 4 equipes empatadas no topo nesta
// edição) nem enquanto a modalidade ainda está em andamento (ex:
// Basquete, com chaveamento ainda não disputado). `null` = sem banner.
const champion = computed<SimpleStanding | null>(() => {
  const finished = matchesStore.bySport.filter((m) => m.status === 'finished')
  if (finished.length === 0) return null

  const finalMatch = finished.find((m) => m.phase === 'Final')
  const finalScores = finalMatch?.scores ?? []
  const finalWinners = finalScores.filter((s) => s.is_winner)

  if (finalMatch) {
    // Modalidade com chaveamento: só é campeã confirmada quem venceu a
    // Final. Sem Final finalizada ainda, não há campeão pra anunciar.
    if (finalWinners.length !== 1) return null
    return derivedStandings.value.find((s) => s.id === finalWinners[0]!.team.id) ?? null
  }

  // Sem Final na modalidade (rodízio/todos-contra-todos, ex: Truco,
  // Uno, Xadrez, Pife): só anuncia campeã quando TODOS os jogos já
  // aconteceram e o 1º lugar não está empatado com o 2º.
  const hasPendingMatches = matchesStore.bySport.some((m) => m.status !== 'finished')
  if (hasPendingMatches) return null
  const [first, second] = derivedStandings.value
  if (!first) return null
  if (second && second.points === first.points) return null
  return first
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

      <RouterLink
        v-if="champion"
        :to="`/equipes/${champion.slug}`"
        class="card card-hover flex items-center gap-4 border-l-4 border-amber-400 bg-amber-50 p-5 dark:border-amber-500 dark:bg-amber-500/10"
      >
        <span class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-400/20 text-amber-600 dark:text-amber-400">
          <MdiIcon :path="mdiCrown" :size="30" />
        </span>
        <div class="min-w-0 flex-1">
          <p class="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">Campeã da modalidade</p>
          <p class="truncate text-xl font-extrabold">{{ champion.name }}</p>
        </div>
        <TeamBadge :name="champion.name" :color="champion.color" size="md" />
      </RouterLink>

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

      <!-- Modalidades sem confronto par-a-par (Laço, Uno, Xadrez, Pife...):
           resultado é um pódio lançado direto pela organização, não jogos. -->
      <section v-if="!matchesStore.bySportLoading && matchesStore.bySport.length === 0 && (podiumLoading || podiumError || podiumPlaces.length > 0)">
        <SectionHeader title="Pódio" :icon="mdiTrophy" />
        <LoadingSkeleton v-if="podiumLoading" :count="3" />
        <ErrorState v-else-if="podiumError" :message="podiumError" @retry="() => loadPodium(sportsStore.currentSport!.name)" />
        <div v-else class="card overflow-hidden">
          <RouterLink
            v-for="p in podiumPlaces"
            :key="p.id"
            :to="`/equipes/${p.team.slug}`"
            class="flex items-center gap-3 border-b border-l-2 border-neutral-100 px-4 py-3 last:border-b-0 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/40"
            :class="rankBorderClass(p.position!)"
          >
            <span
              class="font-numeric flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-center text-xs font-bold"
              :class="rankBadgeClass(p.position!)"
            >{{ p.position }}</span>
            <TeamBadge :name="p.team.name" :color="p.team.primary_color" size="sm" />
            <span class="flex-1 truncate font-semibold">{{ p.team.name }}</span>
          </RouterLink>
        </div>
      </section>

      <section v-else>
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
