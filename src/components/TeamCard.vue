<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { mdiLockOutline } from '@mdi/js'
import type { Team } from '@/types'
import TeamBadge from './TeamBadge.vue'
import MdiIcon from './MdiIcon.vue'

defineProps<{ team: Team }>()
</script>

<template>
  <RouterLink
    :to="`/equipes/${team.slug}`"
    class="card card-hover flex min-w-0 flex-col gap-4 p-5"
  >
    <div class="flex items-center gap-3">
      <TeamBadge :name="team.name" :color="team.primary_color" :logo="team.logo" size="lg" />
      <div class="min-w-0">
        <h3 class="truncate text-lg font-bold">{{ team.name }}</h3>
        <div class="mt-1 h-1.5 w-16 rounded-full" :style="{ backgroundColor: team.primary_color }"></div>
      </div>
    </div>

    <div class="grid grid-cols-4 gap-2 text-center">
      <div>
        <p class="font-numeric text-lg font-extrabold">{{ team.wins }}</p>
        <p class="text-[10px] uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Vitórias</p>
      </div>
      <div>
        <p class="font-numeric text-lg font-extrabold">{{ team.draws }}</p>
        <p class="text-[10px] uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Empates</p>
      </div>
      <div>
        <p class="font-numeric text-lg font-extrabold">{{ team.losses }}</p>
        <p class="text-[10px] uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Derrotas</p>
      </div>
      <div>
        <p v-if="team.points !== undefined" class="font-numeric text-lg font-extrabold text-accent-600 dark:text-accent-400">{{ team.points }}</p>
        <MdiIcon v-else :path="mdiLockOutline" :size="16" class="mx-auto text-neutral-400" />
        <p class="text-[10px] uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Pontos</p>
      </div>
    </div>
  </RouterLink>
</template>
