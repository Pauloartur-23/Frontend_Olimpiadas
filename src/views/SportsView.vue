<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { mdiFlashOutline, mdiTrophy } from '@mdi/js'
import { useSportsStore } from '@/stores/sports'
import SectionHeader from '@/components/SectionHeader.vue'
import LoadingSkeleton from '@/components/LoadingSkeleton.vue'
import EmptyState from '@/components/EmptyState.vue'
import ErrorState from '@/components/ErrorState.vue'
import MdiIcon from '@/components/MdiIcon.vue'
import { sportIcon } from '@/utils/sportIcons'

const sportsStore = useSportsStore()

onMounted(() => {
  sportsStore.fetchSports()
})
</script>

<template>
  <div>
    <SectionHeader title="Modalidades" subtitle="Todas as modalidades disputadas nas Olimpíadas" :icon="mdiFlashOutline" />

    <LoadingSkeleton v-if="sportsStore.loading" variant="entity" :count="6" />
    <ErrorState v-else-if="sportsStore.error" :message="sportsStore.error" @retry="() => sportsStore.fetchSports(true)" />
    <EmptyState v-else-if="sportsStore.sports.length === 0" title="Nenhuma modalidade cadastrada" :icon="mdiTrophy" />
    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <RouterLink
        v-for="sport in sportsStore.sports"
        :key="sport.id"
        :to="`/modalidades/${sport.slug}`"
        class="card card-hover flex min-w-0 items-center gap-4 p-5"
      >
        <span class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent-50 text-accent-700 dark:bg-accent-500/10 dark:text-accent-400">
          <MdiIcon :path="sportIcon(sport.slug, sport.category)" :size="28" />
        </span>
        <div class="min-w-0">
          <h3 class="truncate text-lg font-bold">{{ sport.name }}</h3>
          <p class="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">{{ sport.category }}</p>
          <p class="mt-1 text-xs text-neutral-400">{{ sport.teams_count }} equipes</p>
        </div>
      </RouterLink>
    </div>
  </div>
</template>
