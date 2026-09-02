<script setup lang="ts">
import { computed, onMounted, reactive, watch } from 'vue'
import { RouterLink } from 'vue-router'
import {
  mdiArrowLeft,
  mdiCalendarMonth,
  mdiCalendarQuestion,
  mdiChartBar,
  mdiChevronDown,
  mdiClockOutline,
  mdiCloseCircleOutline,
  mdiCrown,
  mdiEqualBox,
  mdiGamepadVariantOutline,
  mdiMedal,
  mdiStarFourPoints,
  mdiTrophyVariant,
} from '@mdi/js'
import { useTeamsStore } from '@/stores/teams'
import TeamBadge from '@/components/TeamBadge.vue'
import StatusPill from '@/components/StatusPill.vue'
import SectionHeader from '@/components/SectionHeader.vue'
import LoadingSkeleton from '@/components/LoadingSkeleton.vue'
import EmptyState from '@/components/EmptyState.vue'
import ErrorState from '@/components/ErrorState.vue'
import MdiIcon from '@/components/MdiIcon.vue'
import { formatDateShort, formatTime, hasScheduledDateTime, isMatchUpcoming } from '@/utils/date'
import { sportIcon } from '@/utils/sportIcons'

const props = defineProps<{ slug: string }>()
const teamsStore = useTeamsStore()

function load() {
  teamsStore.fetchTeamBySlug(props.slug)
}

onMounted(load)
watch(() => props.slug, load)

const stats = [
  { key: 'games_played', label: 'Jogos', icon: mdiGamepadVariantOutline },
  { key: 'wins', label: 'Vitórias', icon: mdiTrophyVariant },
  { key: 'draws', label: 'Empates', icon: mdiEqualBox },
  { key: 'losses', label: 'Derrotas', icon: mdiCloseCircleOutline },
  { key: 'points', label: 'Pontos', icon: mdiStarFourPoints },
] as const

const MEDAL_GROUPS = [
  { position: 1 as const, label: '1º lugares', colorClass: 'text-amber-500' },
  { position: 2 as const, label: '2º lugares', colorClass: 'text-neutral-400' },
  { position: 3 as const, label: '3º lugares', colorClass: 'text-amber-700' },
]

const medals = computed(() => teamsStore.currentTeam?.medals ?? [])

// Provas em que a equipe é campeã (1º lugar) — banner de destaque no
// topo do perfil, separado da lista completa de medalhas mais abaixo.
const championTitles = computed(() => medals.value.filter((m) => m.position === 1).map((m) => m.prova))

const medalGroups = computed(() =>
  MEDAL_GROUPS.map((group) => ({
    ...group,
    provas: medals.value.filter((m) => m.position === group.position).map((m) => m.prova),
  })),
)

// Qual grupo (1º/2º/3º) está com a lista de provas expandida — chave é
// a posição, começa tudo fechado.
const expanded = reactive<Record<number, boolean>>({ 1: false, 2: false, 3: false })
function toggle(position: number) {
  expanded[position] = !expanded[position]
}
</script>

<template>
  <div>
    <RouterLink to="/equipes" class="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-accent-600 hover:underline dark:text-accent-400">
      <MdiIcon :path="mdiArrowLeft" :size="16" /> Voltar às equipes
    </RouterLink>

    <LoadingSkeleton v-if="teamsStore.currentTeamLoading" variant="text" :count="3" />
    <ErrorState v-else-if="teamsStore.currentTeamError" :message="teamsStore.currentTeamError" @retry="load" />

    <div v-else-if="teamsStore.currentTeam" class="space-y-8">
      <div class="card flex flex-col items-center gap-4 p-8 text-center sm:flex-row sm:text-left">
        <TeamBadge :name="teamsStore.currentTeam.name" :color="teamsStore.currentTeam.primary_color" :logo="teamsStore.currentTeam.logo" size="lg" />
        <div>
          <h1 class="text-2xl font-extrabold">{{ teamsStore.currentTeam.name }}</h1>
          <p v-if="teamsStore.currentTeam.description" class="mt-1 max-w-xl text-sm text-neutral-500 dark:text-neutral-400">
            {{ teamsStore.currentTeam.description }}
          </p>
          <div class="mt-3 flex justify-center gap-2 sm:justify-start">
            <span class="h-3 w-8 rounded-full" :style="{ backgroundColor: teamsStore.currentTeam.primary_color }"></span>
            <span class="h-3 w-8 rounded-full" :style="{ backgroundColor: teamsStore.currentTeam.secondary_color }"></span>
          </div>
        </div>
      </div>

      <div v-if="championTitles.length > 0" class="card flex items-start gap-4 border-l-4 border-amber-400 bg-amber-50 p-5 dark:border-amber-500 dark:bg-amber-500/10">
        <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-400/20 text-amber-600 dark:text-amber-400">
          <MdiIcon :path="mdiCrown" :size="26" />
        </span>
        <div class="min-w-0">
          <p class="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
            Campeã {{ championTitles.length > 1 ? `de ${championTitles.length} modalidades` : 'da modalidade' }}
          </p>
          <p class="mt-0.5 font-semibold">{{ championTitles.join(' · ') }}</p>
        </div>
      </div>

      <section>
        <SectionHeader title="Estatísticas" :icon="mdiChartBar" />
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <div v-for="stat in stats" :key="stat.key" class="card flex flex-col items-center gap-1 p-4 text-center">
            <MdiIcon :path="stat.icon" :size="18" class="text-accent-500 dark:text-accent-400" />
            <p class="font-numeric text-2xl font-extrabold text-accent-600 dark:text-accent-400">{{ teamsStore.currentTeam[stat.key] }}</p>
            <p class="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">{{ stat.label }}</p>
          </div>
        </div>
      </section>

      <section>
        <SectionHeader title="Medalhas" :icon="mdiMedal" />
        <EmptyState
          v-if="medals.length === 0"
          title="Nenhuma medalha ainda"
          message="Esta equipe ainda não tem 1º, 2º ou 3º lugar registrado."
          :icon="mdiMedal"
        />
        <div v-else class="grid gap-3 sm:grid-cols-3">
          <div v-for="group in medalGroups" :key="group.position" class="card overflow-hidden p-0">
            <button
              type="button"
              class="flex w-full items-center gap-3 p-4 text-left disabled:cursor-default"
              :disabled="group.provas.length === 0"
              @click="toggle(group.position)"
            >
              <MdiIcon :path="mdiMedal" :size="24" :class="group.colorClass" />
              <div class="min-w-0 flex-1">
                <p class="font-numeric text-2xl font-extrabold">{{ group.provas.length }}</p>
                <p class="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">{{ group.label }}</p>
              </div>
              <MdiIcon
                v-if="group.provas.length > 0"
                :path="mdiChevronDown"
                :size="18"
                class="shrink-0 text-neutral-400 transition-transform"
                :class="{ 'rotate-180': expanded[group.position] }"
              />
            </button>
            <ul
              v-if="expanded[group.position] && group.provas.length > 0"
              class="space-y-1 border-t border-neutral-100 px-4 py-3 text-sm dark:border-neutral-800"
            >
              <li v-for="prova in group.provas" :key="prova" class="text-neutral-700 dark:text-neutral-300">{{ prova }}</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <SectionHeader title="Próximos jogos" :icon="mdiCalendarMonth" />
        <EmptyState
          v-if="teamsStore.currentTeam.upcoming_matches.length === 0"
          title="Nenhum jogo agendado"
          message="Esta equipe não tem próximos jogos no momento."
          :icon="mdiCalendarMonth"
        />
        <div v-else class="grid gap-3 sm:grid-cols-2">
          <RouterLink
            v-for="m in teamsStore.currentTeam.upcoming_matches"
            :key="m.id"
            :to="`/jogos/${m.id}`"
            class="card card-hover flex min-w-0 items-center gap-3 p-4"
          >
            <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-50 text-accent-700 dark:bg-accent-500/10 dark:text-accent-400">
              <MdiIcon :path="sportIcon(null)" :size="22" />
            </span>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-bold">{{ m.sport }}</p>
              <p class="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400">
                <span v-if="m.phase" class="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide dark:bg-neutral-800">{{ m.phase }}</span>
                <span v-if="hasScheduledDateTime(m.date, m.time)" class="inline-flex items-center gap-1">
                  <MdiIcon :path="mdiClockOutline" :size="12" />
                  {{ formatDateShort(m.date) }} · {{ formatTime(m.time) }}
                </span>
                <span v-else class="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                  <MdiIcon :path="mdiCalendarQuestion" :size="12" />
                  Horário a definir
                </span>
              </p>
            </div>
            <StatusPill :status="m.status" :is-upcoming="isMatchUpcoming(m.date, m.time)" />
          </RouterLink>
        </div>
      </section>
    </div>
  </div>
</template>
