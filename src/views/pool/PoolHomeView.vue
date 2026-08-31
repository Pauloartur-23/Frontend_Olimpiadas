<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { mdiChevronRight, mdiDiceMultiple, mdiFormatListBulleted, mdiInformationOutline, mdiStar, mdiTrophy } from '@mdi/js'
import { useAuthStore } from '@/stores/auth'
import { usePoolStore } from '@/stores/pool'
import SectionHeader from '@/components/SectionHeader.vue'
import LoadingSkeleton from '@/components/LoadingSkeleton.vue'
import MdiIcon from '@/components/MdiIcon.vue'

const auth = useAuthStore()
const poolStore = usePoolStore()

onMounted(() => {
  poolStore.fetchBets()
  poolStore.fetchRanking()
  poolStore.fetchSettings()
})

const myEntry = computed(() => poolStore.ranking.find((r) => r.user.id === auth.user?.id) || null)
const exactCount = computed(() => myEntry.value?.exact_count ?? 0)
const betsCount = computed(() => poolStore.bets.length)
const totalPoints = computed(() => myEntry.value?.total_points ?? poolStore.totalPoints)
</script>

<template>
  <div>
    <SectionHeader title="Bolão dos Jogos" subtitle="Aposte no placar e suba na classificação" :icon="mdiDiceMultiple" />

    <!-- Resumo do usuário -->
    <div class="mb-8 grid gap-3 sm:grid-cols-3">
      <div class="card p-5 text-center">
        <p class="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Seus pontos</p>
        <p class="font-numeric mt-1 text-3xl font-extrabold text-accent-600 dark:text-accent-400">{{ totalPoints }}</p>
      </div>
      <div class="card p-5 text-center">
        <p class="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Sua posição</p>
        <p class="font-numeric mt-1 text-3xl font-extrabold">
          {{ myEntry ? `${myEntry.position}º` : '—' }}
        </p>
      </div>
      <div class="card p-5 text-center">
        <p class="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Palpites feitos</p>
        <p class="font-numeric mt-1 text-3xl font-extrabold">{{ betsCount }}</p>
        <p v-if="exactCount" class="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">{{ exactCount }} placar(es) exato(s)</p>
      </div>
    </div>

    <!-- Atalhos -->
    <div class="mb-8 grid gap-4 sm:grid-cols-2">
      <RouterLink to="/bolao/jogos" class="card card-hover flex items-center gap-4 p-5">
        <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent-50 text-accent-700 dark:bg-accent-500/10 dark:text-accent-400">
          <MdiIcon :path="mdiFormatListBulleted" :size="24" />
        </span>
        <div class="min-w-0 flex-1">
          <h3 class="font-bold">Ver todos os jogos</h3>
          <p class="text-xs text-neutral-500 dark:text-neutral-400">Aposte nos jogos que ainda não começaram</p>
        </div>
        <MdiIcon :path="mdiChevronRight" :size="20" class="text-neutral-400" />
      </RouterLink>

      <RouterLink to="/bolao/ranking" class="card card-hover flex items-center gap-4 p-5">
        <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent-50 text-accent-700 dark:bg-accent-500/10 dark:text-accent-400">
          <MdiIcon :path="mdiTrophy" :size="24" />
        </span>
        <div class="min-w-0 flex-1">
          <h3 class="font-bold">Ranking do bolão</h3>
          <p class="text-xs text-neutral-500 dark:text-neutral-400">Veja quem está na frente</p>
        </div>
        <MdiIcon :path="mdiChevronRight" :size="20" class="text-neutral-400" />
      </RouterLink>
    </div>

    <!-- Como funciona a pontuação -->
    <SectionHeader title="Como funciona a pontuação" :icon="mdiInformationOutline" />
    <LoadingSkeleton v-if="poolStore.settingsLoading" variant="text" :count="3" />
    <div v-else-if="poolStore.settings" class="card divide-y divide-neutral-100 dark:divide-neutral-800">
      <div class="flex items-center justify-between gap-4 px-5 py-4">
        <div class="flex items-center gap-3">
          <MdiIcon :path="mdiStar" :size="18" class="shrink-0 text-amber-500" />
          <div>
            <p class="text-sm font-semibold">Placar exato</p>
            <p class="text-xs text-neutral-500 dark:text-neutral-400">Você acertou o placar cravado</p>
          </div>
        </div>
        <span class="font-numeric shrink-0 text-lg font-extrabold text-accent-600 dark:text-accent-400">
          {{ poolStore.settings.points_correct_result + poolStore.settings.points_exact_score }}
        </span>
      </div>
      <div class="flex items-center justify-between gap-4 px-5 py-4">
        <div class="flex items-center gap-3">
          <MdiIcon :path="mdiStar" :size="18" class="shrink-0 text-neutral-400" />
          <div>
            <p class="text-sm font-semibold">Vencedor e saldo de gols</p>
            <p class="text-xs text-neutral-500 dark:text-neutral-400">Acertou quem venceu e a diferença de pontos, mas não o placar exato</p>
          </div>
        </div>
        <span class="font-numeric shrink-0 text-lg font-extrabold text-accent-600 dark:text-accent-400">
          {{ poolStore.settings.points_correct_result + poolStore.settings.points_goal_difference }}
        </span>
      </div>
      <div class="flex items-center justify-between gap-4 px-5 py-4">
        <div class="flex items-center gap-3">
          <MdiIcon :path="mdiStar" :size="18" class="shrink-0 text-neutral-300" />
          <div>
            <p class="text-sm font-semibold">Só acertou o vencedor</p>
            <p class="text-xs text-neutral-500 dark:text-neutral-400">Acertou quem venceu, mas não a diferença nem o placar</p>
          </div>
        </div>
        <span class="font-numeric shrink-0 text-lg font-extrabold text-accent-600 dark:text-accent-400">
          {{ poolStore.settings.points_correct_result }}
        </span>
      </div>
      <div class="flex items-center justify-between gap-4 px-5 py-4">
        <div class="flex items-center gap-3">
          <MdiIcon :path="mdiStar" :size="18" class="shrink-0 text-neutral-200 dark:text-neutral-700" />
          <p class="text-sm font-semibold">Errou o vencedor</p>
        </div>
        <span class="font-numeric shrink-0 text-lg font-extrabold text-neutral-400">0</span>
      </div>
    </div>
  </div>
</template>
