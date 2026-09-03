<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { mdiAlertCircleOutline, mdiCheck, mdiContentSave, mdiPlus } from '@mdi/js'
import type { Match, Team } from '@/types'
import TeamBadge from './TeamBadge.vue'
import StatusPill from './StatusPill.vue'
import MdiIcon from './MdiIcon.vue'
import { formatDateShort, formatTimeRange, hasScheduledDateTime, isMatchUpcoming } from '@/utils/date'
import { sportIcon } from '@/utils/sportIcons'

const props = defineProps<{
  match: Match
  saving?: boolean
  errorMessage?: string | null
  // Todas as equipes cadastradas — usado só para montar o seletor de
  // "adicionar equipe" quando o jogo ainda não tem as duas equipes
  // definidas (ex.: empate de classificação de grupo não resolvido
  // automaticamente mesmo após o critério de desempate).
  teams?: Team[]
}>()

const emit = defineEmits<{
  save: [{ teamId: number; points: number }[]]
  addTeam: [teamId: number]
}>()

const isEligible = computed(() => props.match.teams.length === 2)

const availableTeams = computed(() => {
  const current = new Set(props.match.teams.map((t) => t.id))
  return (props.teams ?? []).filter((t) => !current.has(t.id)).sort((a, b) => a.name.localeCompare(b, 'pt-BR'))
})
const selectedTeamId = ref<number | ''>('')

function onAddTeam() {
  if (selectedTeamId.value === '') return
  emit('addTeam', Number(selectedTeamId.value))
  selectedTeamId.value = ''
}

const form = reactive<Record<number, number>>({})

function scoreFor(teamId: number): number | null {
  const s = props.match.scores?.find((sc) => sc.team.id === teamId)
  return s ? s.points : null
}

watch(
  () => props.match,
  (match) => {
    for (const team of match.teams) {
      form[team.id] = scoreFor(team.id) ?? 0
    }
  },
  { immediate: true },
)

function onSubmit() {
  if (!isEligible.value) return
  emit(
    'save',
    props.match.teams.map((t) => ({ teamId: t.id, points: form[t.id] ?? 0 })),
  )
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

    <div v-if="!isEligible" class="mb-3 rounded-xl border border-dashed border-neutral-200 bg-neutral-50/60 px-3 py-2.5 dark:border-neutral-700 dark:bg-neutral-800/40">
      <p class="text-sm font-semibold text-neutral-500 dark:text-neutral-400">
        Jogo sem as duas equipes definidas — não é possível lançar resultado ainda.
      </p>
      <p v-if="match.pending_note" class="mt-1.5 flex items-start gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
        <MdiIcon :path="mdiAlertCircleOutline" :size="14" class="mt-0.5 shrink-0" />
        {{ match.pending_note }}
      </p>

      <div v-if="(teams?.length ?? 0) > 0" class="mt-2.5 flex items-center gap-2">
        <select
          v-model="selectedTeamId"
          class="h-10 min-w-0 flex-1 rounded-lg border border-neutral-300 bg-white px-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        >
          <option value="" disabled>Adicionar equipe manualmente...</option>
          <option v-for="team in availableTeams" :key="team.id" :value="team.id">{{ team.name }}</option>
        </select>
        <button
          type="button"
          class="btn-secondary h-10 shrink-0 px-3"
          :disabled="selectedTeamId === '' || saving"
          @click="onAddTeam"
        >
          <MdiIcon :path="mdiPlus" :size="16" />
        </button>
      </div>

      <p v-if="errorMessage" class="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400">
        <MdiIcon :path="mdiAlertCircleOutline" :size="14" class="shrink-0" />
        {{ errorMessage }}
      </p>
    </div>

    <form v-else class="mb-3" @submit.prevent="onSubmit">
      <div class="flex items-center justify-center gap-3 rounded-xl bg-neutral-50 px-3 py-3 dark:bg-neutral-800/50">
        <label v-for="team in match.teams" :key="team.id" class="flex flex-1 flex-col items-center gap-1.5">
          <span class="flex min-w-0 items-center gap-1.5">
            <TeamBadge :name="team.name" :color="team.primary_color" size="sm" />
            <span class="max-w-24 truncate text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">{{ team.name }}</span>
          </span>
          <input
            v-model.number="form[team.id]"
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
        <MdiIcon :path="match.status === 'finished' ? mdiCheck : mdiContentSave" :size="16" />
        {{ saving ? 'Salvando...' : match.status === 'finished' ? 'Atualizar resultado' : 'Salvar resultado' }}
      </button>
    </form>

    <div class="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
      <span v-if="hasScheduledDateTime(match.date, match.time)">{{ formatDateShort(match.date) }} · {{ formatTimeRange(match.time, match.end_time) }}</span>
      <span v-else class="font-semibold text-amber-600 dark:text-amber-400">Horário a definir</span>
      <span v-if="match.location" class="truncate">{{ match.location }}</span>
    </div>
  </div>
</template>
