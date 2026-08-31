<script setup lang="ts">
withDefaults(
  defineProps<{
    path: string
    size?: number | string
  }>(),
  {
    size: 20,
  },
)
</script>

<template>
  <svg
    viewBox="0 0 24 24"
    :width="size"
    :height="size"
    class="inline-block shrink-0"
    aria-hidden="true"
    focusable="false"
  >
    <path :d="path" fill="currentColor" />
  </svg>
</template>
