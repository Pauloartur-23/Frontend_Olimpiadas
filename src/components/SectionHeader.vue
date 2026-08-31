<script setup lang="ts">
import MdiIcon from './MdiIcon.vue'

defineProps<{
  title: string
  subtitle?: string
  icon?: string
}>()
</script>

<template>
  <div class="mb-4 flex items-end justify-between gap-4">
    <div>
      <h2 class="flex items-center gap-2 text-xl font-bold tracking-tight sm:text-2xl">
        <MdiIcon v-if="icon" :path="icon" :size="22" class="text-accent-600 dark:text-accent-400" />
        {{ title }}
      </h2>
      <p v-if="subtitle" class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.action" class="shrink-0">
      <slot name="action" />
    </div>
  </div>
</template>
