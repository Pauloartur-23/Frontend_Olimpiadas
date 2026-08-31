<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { mdiCompassOffOutline, mdiHome } from '@mdi/js'
import MdiIcon from '@/components/MdiIcon.vue'
</script>

<template>
  <div class="flex flex-col items-center justify-center py-20 text-center">
    <span class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent-50 text-accent-600 dark:bg-accent-500/10 dark:text-accent-400">
      <MdiIcon :path="mdiCompassOffOutline" :size="32" />
    </span>
    <h1 class="text-2xl font-bold">Página não encontrada</h1>
    <p class="mt-2 text-neutral-500 dark:text-neutral-400">O conteúdo que você procura não existe ou foi movido.</p>
    <RouterLink to="/" class="btn-primary mt-6">
      <MdiIcon :path="mdiHome" :size="16" />
      Voltar ao início
    </RouterLink>
  </div>
</template>
