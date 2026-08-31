<script setup lang="ts">
import { onMounted } from 'vue'
import { mdiCheckCircleOutline, mdiDiceMultiple, mdiTargetAccount, mdiTrophy } from '@mdi/js'
import { useAuthStore } from '@/stores/auth'
import { usePoolStore } from '@/stores/pool'
import { rankBadgeClass, rankBorderClass } from '@/utils/rank'
import SectionHeader from '@/components/SectionHeader.vue'
import LoadingSkeleton from '@/components/LoadingSkeleton.vue'
import EmptyState from '@/components/EmptyState.vue'
import ErrorState from '@/components/ErrorState.vue'
import MdiIcon from '@/components/MdiIcon.vue'

const auth = useAuthStore()
const poolStore = usePoolStore()

onMounted(() => {
  poolStore.fetchRanking()
})
</script>

<template>
  <div>
    <SectionHeader title="Ranking do Bolão" subtitle="Classificação geral dos palpites" :icon="mdiTrophy" />

    <LoadingSkeleton v-if="poolStore.rankingLoading" variant="row" :count="8" />
    <ErrorState v-else-if="poolStore.rankingError" :message="poolStore.rankingError" @retry="poolStore.fetchRanking" />
    <EmptyState
      v-else-if="poolStore.ranking.length === 0"
      title="Ainda não há palpites"
      message="Assim que os usuários começarem a apostar, o ranking aparece aqui."
      :icon="mdiDiceMultiple"
    />

    <template v-else>
      <!-- Tabela (tablet/desktop) -->
      <div class="card hidden overflow-x-auto sm:block">
        <table class="w-full min-w-[560px] text-left text-sm">
          <thead class="border-b border-neutral-100 text-xs uppercase tracking-wide text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
            <tr>
              <th class="px-4 py-3">#</th>
              <th class="px-4 py-3">Usuário</th>
              <th class="px-4 py-3 text-center">Palpites</th>
              <th class="px-4 py-3 text-center">Exatos</th>
              <th class="px-4 py-3 text-right">Pontos</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="r in poolStore.ranking"
              :key="r.user.id"
              class="border-b border-l-2 border-neutral-50 last:border-b-0 hover:bg-neutral-50 dark:border-neutral-800/60 dark:hover:bg-neutral-800/40"
              :class="[rankBorderClass(r.position), r.user.id === auth.user?.id ? 'bg-accent-50/60 dark:bg-accent-500/5' : '']"
            >
              <td class="px-4 py-3">
                <span
                  class="font-numeric inline-flex h-6 w-6 items-center justify-center rounded-full text-center text-xs font-bold"
                  :class="rankBadgeClass(r.position)"
                >{{ r.position }}</span>
              </td>
              <td class="px-4 py-3 font-semibold">
                {{ r.user.name }}
                <span v-if="r.user.id === auth.user?.id" class="ml-1 text-xs font-medium text-accent-600 dark:text-accent-400">(você)</span>
              </td>
              <td class="font-numeric px-4 py-3 text-center">{{ r.bets_count }}</td>
              <td class="font-numeric px-4 py-3 text-center">{{ r.exact_count }}</td>
              <td class="font-numeric px-4 py-3 text-right text-lg font-extrabold text-accent-600 dark:text-accent-400">{{ r.total_points }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Cards (mobile) -->
      <div class="space-y-3 sm:hidden">
        <div
          v-for="r in poolStore.ranking"
          :key="r.user.id"
          class="card flex items-center gap-3 border-l-2 p-4"
          :class="[rankBorderClass(r.position), r.user.id === auth.user?.id ? 'bg-accent-50/60 dark:bg-accent-500/5' : '']"
        >
          <span
            class="font-numeric flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-center text-xs font-bold"
            :class="rankBadgeClass(r.position)"
          >{{ r.position }}</span>
          <div class="min-w-0 flex-1">
            <p class="truncate font-semibold">
              {{ r.user.name }}
              <span v-if="r.user.id === auth.user?.id" class="text-xs font-medium text-accent-600 dark:text-accent-400">(você)</span>
            </p>
            <p class="mt-0.5 flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
              <span class="inline-flex items-center gap-1"><MdiIcon :path="mdiTargetAccount" :size="13" />{{ r.bets_count }} palpites</span>
              <span class="inline-flex items-center gap-1"><MdiIcon :path="mdiCheckCircleOutline" :size="13" />{{ r.exact_count }} exatos</span>
            </p>
          </div>
          <span class="font-numeric text-xl font-extrabold text-accent-600 dark:text-accent-400">{{ r.total_points }}</span>
        </div>
      </div>
    </template>
  </div>
</template>
