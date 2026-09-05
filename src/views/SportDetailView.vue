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

// Campeã(s) via pódio (Laço, Uno, Xadrez, Pife, Truco, Brawl Stars...):
// modalidades sem confronto par-a-par, cuja colocação é lançada direto
// pela organização (`EventPlacement`) em vez de derivada de `Match`.
// Lista (não só a 1ª equipe) porque a posição não é mais exclusiva de
// uma equipe — um empate real em 1º lugar mostraria mais de uma aqui.
const podiumChampions = computed(() => podiumPlaces.value.filter((p) => p.position === 1))

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
  // Saldo de placar (pontos feitos - pontos sofridos, somado jogo a jogo)
  // — critério de desempate quando duas equipes têm os mesmos pontos
  // (mesmo cálculo do backend, ver `matches.bracket._score_difference`).
  saldo: number
}

// Agrega vitórias/empates/derrotas/pontos/saldo de uma lista de jogos já
// finalizados — reaproveitado tanto pela classificação agregada da
// modalidade (usada só para achar a campeã, não mais exibida quando há
// grupos) quanto pela classificação de cada grupo (Grupo A/Grupo B),
// que precisa do mesmo cálculo escopado a um subconjunto de jogos.
function buildStandings(matches: typeof matchesStore.bySport): SimpleStanding[] {
  const map = new Map<number, SimpleStanding>()

  for (const match of matches) {
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
          saldo: 0,
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
      // Saldo: pontos feitos por esta equipe menos os pontos somados de
      // todas as outras equipes do jogo (a maioria é 1x1, mas cobre
      // também jogos com 3+ equipes tipo Pife/Uno).
      const against = scores.filter((s) => s.team.id !== score.team.id).reduce((sum, s) => sum + s.points, 0)
      entry.saldo += score.points - against
    }
  }

  return Array.from(map.values()).sort((a, b) => b.points - a.points || b.saldo - a.saldo)
}

// Modalidades com fase de grupos (Basquete, Vôlei, Futsal, Queimada,
// EA FC, Vôlei de Areia...): a classificação única "de toda a
// modalidade" não faz sentido (equipes de grupos diferentes nunca se
// enfrentaram) — usamos `groupAStandings`/`groupBStandings` em vez
// disso (ver template). `derivedStandings`/`champion` seguem existindo
// só para achar a campeã (resultado da Final), não são mais exibidos
// como tabela quando `hasGroups` é true.
const hasGroups = computed(() => matchesStore.bySport.some((m) => m.phase === 'Grupo A' || m.phase === 'Grupo B'))

// Algumas modalidades têm um `Match` cadastrado (aparece no cronograma,
// com data/local) mas nenhum `MatchScore` — o resultado é só um pódio
// lançado direto pela organização (`EventPlacement`), sem confronto
// par-a-par de verdade (ex: Gincana, Pique-Bandeira: jogo único com as
// 7 equipes "ao mesmo tempo", sem vencedor/perdedor par-a-par). Nesses
// casos `derivedStandings`/`champion` (que dependem de `MatchScore`)
// não têm o que calcular — o pódio (abaixo) é que manda.
const hasRealScores = computed(() => matchesStore.bySport.some((m) => m.scores && m.scores.length > 0))

const groupAStandings = computed(() =>
  buildStandings(matchesStore.bySport.filter((m) => m.status === 'finished' && m.phase === 'Grupo A')),
)
const groupBStandings = computed(() =>
  buildStandings(matchesStore.bySport.filter((m) => m.status === 'finished' && m.phase === 'Grupo B')),
)

// Critério de "campeão": se a modalidade tem uma Final disputada
// (finalizada), o topo da classificação é o resultado dessa Final —
// não a soma de vitórias em todas as fases (quartas/semis também
// contam pontos, o que pode empurrar quem perdeu a Final para cima só
// por ter vencido mais jogos nas fases anteriores). Sem Final (ex:
// Truco, Uno, Xadrez, Pife — rodízio/todos-contra-todos), o critério é
// a classificação da fase de grupo, que aqui já é a soma de pontos de
// todos os jogos finalizados (não há outra fase para conflitar).
const derivedStandings = computed<SimpleStanding[]>(() => {
  const finished = matchesStore.bySport.filter((m) => m.status === 'finished')
  const standings = buildStandings(finished)

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
      if (diff !== 0) return diff
      return b.points - a.points || b.saldo - a.saldo
    })
  }

  return standings
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
  if (second && second.points === first.points && second.saldo === first.saldo) return null
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

      <!-- Modalidades sem placar por jogo (Laço, Uno, Xadrez, Pife, Truco,
           Brawl Stars, Gincana, Pique-Bandeira...): campeã vem do pódio
           (EventPlacement), não de Match/derivedStandings — vale tanto para
           quem não tem `Match` cadastrado quanto para quem tem um jogo único
           sem `MatchScore` (ver `hasRealScores`). -->
      <component
        :is="podiumChampions.length === 1 ? 'RouterLink' : 'div'"
        v-if="!matchesStore.bySportLoading && !hasRealScores && podiumChampions.length > 0"
        :to="podiumChampions.length === 1 ? `/equipes/${podiumChampions[0]!.team.slug}` : undefined"
        class="card flex items-center gap-4 border-l-4 border-amber-400 bg-amber-50 p-5 dark:border-amber-500 dark:bg-amber-500/10"
        :class="podiumChampions.length === 1 ? 'card-hover' : ''"
      >
        <span class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-400/20 text-amber-600 dark:text-amber-400">
          <MdiIcon :path="mdiCrown" :size="30" />
        </span>
        <div class="min-w-0 flex-1">
          <p class="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
            {{ podiumChampions.length > 1 ? 'Campeãs da modalidade (empate)' : 'Campeã da modalidade' }}
          </p>
          <p class="truncate text-xl font-extrabold">{{ podiumChampions.map((p) => p.team.name).join(' e ') }}</p>
        </div>
        <div class="flex shrink-0 -space-x-2">
          <TeamBadge v-for="p in podiumChampions" :key="p.id" :name="p.team.name" :color="p.team.primary_color" size="md" />
        </div>
      </component>

      <!-- Modalidades com fase de grupos: uma classificação por grupo em
           vez de uma tabela única (equipes de grupos diferentes nunca se
           enfrentaram, então não faz sentido ranqueá-las juntas). -->
      <template v-if="hasGroups">
        <section v-if="groupAStandings.length > 0">
          <SectionHeader title="Classificação — Grupo A" :icon="mdiTrophy" />
          <div class="card overflow-hidden">
            <div
              v-for="(s, idx) in groupAStandings"
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
              <span class="font-numeric hidden text-xs text-neutral-400 sm:block dark:text-neutral-500">saldo {{ s.saldo > 0 ? '+' : '' }}{{ s.saldo }}</span>
              <span class="font-numeric text-lg font-extrabold text-accent-600 dark:text-accent-400">{{ s.points }}</span>
            </div>
          </div>
        </section>

        <section v-if="groupBStandings.length > 0">
          <SectionHeader title="Classificação — Grupo B" :icon="mdiTrophy" />
          <div class="card overflow-hidden">
            <div
              v-for="(s, idx) in groupBStandings"
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
              <span class="font-numeric hidden text-xs text-neutral-400 sm:block dark:text-neutral-500">saldo {{ s.saldo > 0 ? '+' : '' }}{{ s.saldo }}</span>
              <span class="font-numeric text-lg font-extrabold text-accent-600 dark:text-accent-400">{{ s.points }}</span>
            </div>
          </div>
        </section>
      </template>

      <section v-else-if="hasRealScores && derivedStandings.length > 0">
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
            <span class="font-numeric hidden text-xs text-neutral-400 sm:block dark:text-neutral-500">saldo {{ s.saldo > 0 ? '+' : '' }}{{ s.saldo }}</span>
            <span class="font-numeric text-lg font-extrabold text-accent-600 dark:text-accent-400">{{ s.points }}</span>
          </div>
        </div>
      </section>

      <!-- Modalidades sem placar por jogo (Laço, Uno, Xadrez, Pife, Gincana,
           Pique-Bandeira...): resultado é um pódio lançado direto pela
           organização, não derivado de `MatchScore`. -->
      <section v-if="!matchesStore.bySportLoading && !hasRealScores && (podiumLoading || podiumError || podiumPlaces.length > 0)">
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
