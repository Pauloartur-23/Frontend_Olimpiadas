<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { mdiMedal, mdiTrophy } from '@mdi/js'
import { useStandingsStore } from '@/stores/standings'
import { rankBadgeClass, rankBorderClass } from '@/utils/rank'
import TeamBadge from '@/components/TeamBadge.vue'
import SectionHeader from '@/components/SectionHeader.vue'
import LoadingSkeleton from '@/components/LoadingSkeleton.vue'
import EmptyState from '@/components/EmptyState.vue'
import ErrorState from '@/components/ErrorState.vue'
import MdiIcon from '@/components/MdiIcon.vue'

const standingsStore = useStandingsStore()

onMounted(() => {
  standingsStore.fetchStandings()
})
</script>

<template>
  <div>
    <SectionHeader title="Classificação geral" subtitle="Pontuação e medalhas por equipe" :icon="mdiTrophy" />

    <LoadingSkeleton v-if="standingsStore.loading" variant="row" :count="7" />
    <ErrorState v-else-if="standingsStore.error" :message="standingsStore.error" @retry="() => standingsStore.fetchStandings(true)" />
    <EmptyState v-else-if="standingsStore.standings.length === 0" title="Classificação indisponível" message="A tabela ainda não foi publicada." :icon="mdiTrophy" />

    <template v-else>
      <!-- Tabela (tablet/desktop) -->
      <div class="card hidden overflow-x-auto sm:block">
        <table class="w-full min-w-[640px] text-left text-sm">
          <thead class="border-b border-neutral-100 text-xs uppercase tracking-wide text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
            <tr>
              <th class="px-4 py-3">#</th>
              <th class="px-4 py-3">Equipe</th>
              <th class="px-4 py-3 text-center"><MdiIcon :path="mdiMedal" :size="16" class="mx-auto text-amber-500" /></th>
              <th class="px-4 py-3 text-center"><MdiIcon :path="mdiMedal" :size="16" class="mx-auto text-neutral-400" /></th>
              <th class="px-4 py-3 text-center"><MdiIcon :path="mdiMedal" :size="16" class="mx-auto text-amber-700" /></th>
              <th class="px-4 py-3 text-center">V</th>
              <th class="px-4 py-3 text-center">E</th>
              <th class="px-4 py-3 text-center">D</th>
              <th class="px-4 py-3 text-right">Pontos</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="s in standingsStore.standings"
              :key="s.team.id"
              class="border-b border-l-2 border-neutral-50 last:border-b-0 hover:bg-neutral-50 dark:border-neutral-800/60 dark:hover:bg-neutral-800/40"
              :class="rankBorderClass(s.position)"
            >
              <td class="px-4 py-3">
                <span
                  class="font-numeric inline-flex h-6 w-6 items-center justify-center rounded-full text-center text-xs font-bold"
                  :class="rankBadgeClass(s.position)"
                >{{ s.position }}</span>
              </td>
              <td class="px-4 py-3">
                <RouterLink :to="`/equipes/${s.team.slug}`" class="flex items-center gap-3 font-semibold hover:underline">
                  <TeamBadge :name="s.team.name" :color="s.team.primary_color" :logo="s.team.logo" size="sm" />
                  {{ s.team.name }}
                </RouterLink>
              </td>
              <td class="font-numeric px-4 py-3 text-center">{{ s.gold }}</td>
              <td class="font-numeric px-4 py-3 text-center">{{ s.silver }}</td>
              <td class="font-numeric px-4 py-3 text-center">{{ s.bronze }}</td>
              <td class="font-numeric px-4 py-3 text-center">{{ s.wins }}</td>
              <td class="font-numeric px-4 py-3 text-center">{{ s.draws }}</td>
              <td class="font-numeric px-4 py-3 text-center">{{ s.losses }}</td>
              <td class="font-numeric px-4 py-3 text-right text-lg font-extrabold text-accent-600 dark:text-accent-400">{{ s.points }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Cards (mobile) -->
      <div class="space-y-3 sm:hidden">
        <RouterLink
          v-for="s in standingsStore.standings"
          :key="s.team.id"
          :to="`/equipes/${s.team.slug}`"
          class="card flex items-center gap-3 border-l-2 p-4"
          :class="rankBorderClass(s.position)"
        >
          <span
            class="font-numeric flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-center text-xs font-bold"
            :class="rankBadgeClass(s.position)"
          >{{ s.position }}</span>
          <TeamBadge :name="s.team.name" :color="s.team.primary_color" :logo="s.team.logo" size="md" />
          <div class="min-w-0 flex-1">
            <p class="truncate font-semibold">{{ s.team.name }}</p>
            <p class="mt-0.5 flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
              <span class="inline-flex items-center gap-0.5"><MdiIcon :path="mdiMedal" :size="13" class="text-amber-500" />{{ s.gold }}</span>
              <span class="inline-flex items-center gap-0.5"><MdiIcon :path="mdiMedal" :size="13" class="text-neutral-400" />{{ s.silver }}</span>
              <span class="inline-flex items-center gap-0.5"><MdiIcon :path="mdiMedal" :size="13" class="text-amber-700" />{{ s.bronze }}</span>
              <span>· {{ s.wins }}V {{ s.draws }}E {{ s.losses }}D</span>
            </p>
          </div>
          <span class="font-numeric text-xl font-extrabold text-accent-600 dark:text-accent-400">{{ s.points }}</span>
        </RouterLink>
      </div>
    </template>
  </div>
</template>
