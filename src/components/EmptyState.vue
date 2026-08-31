<script setup lang="ts">
import { mdiInboxOutline } from '@mdi/js'
import MdiIcon from './MdiIcon.vue'

withDefaults(
  defineProps<{
    title?: string
    message?: string
    icon?: string
  }>(),
  {
    title: 'Nada por aqui ainda',
    message: 'Volte mais tarde para conferir novidades.',
    icon: mdiInboxOutline,
  },
)
</script>

<template>
  <div
    class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 px-6 py-12 text-center dark:border-neutral-700"
  >
    <span class="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500">
      <MdiIcon :path="icon" :size="26" />
    </span>
    <h3 class="text-base font-semibold text-neutral-700 dark:text-neutral-200">{{ title }}</h3>
    <p class="mt-1 max-w-sm text-sm text-neutral-500 dark:text-neutral-400">{{ message }}</p>
    <div v-if="$slots.action" class="mt-4">
      <slot name="action" />
    </div>
  </div>
</template>
