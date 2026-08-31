<script setup lang="ts">
import { mdiAlertCircleOutline } from '@mdi/js'
import MdiIcon from './MdiIcon.vue'

withDefaults(
  defineProps<{
    message?: string
  }>(),
  {
    message: 'Não foi possível carregar os dados.',
  },
)

const emit = defineEmits<{ retry: [] }>()
</script>

<template>
  <div
    class="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center dark:border-red-900/50 dark:bg-red-950/30"
  >
    <span class="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400">
      <MdiIcon :path="mdiAlertCircleOutline" :size="26" />
    </span>
    <h3 class="text-base font-semibold text-red-700 dark:text-red-400">Ops, algo deu errado</h3>
    <p class="mt-1 max-w-sm text-sm text-red-600/80 dark:text-red-400/70">{{ message }}</p>
    <button type="button" class="btn-primary mt-4" @click="emit('retry')">Tentar novamente</button>
  </div>
</template>
