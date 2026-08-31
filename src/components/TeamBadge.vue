<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    name: string
    color?: string | null
    logo?: string | null
    size?: 'sm' | 'md' | 'lg'
  }>(),
  {
    color: '#737373',
    logo: null,
    size: 'md',
  },
)

const initials = computed(() => {
  const words = props.name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
})

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'w-7 h-7 text-[10px]'
    case 'lg':
      return 'w-16 h-16 text-xl'
    default:
      return 'w-10 h-10 text-sm'
  }
})

// Cores de equipe claras (ex.: branco) precisam de texto/borda escuros para
// continuar legíveis — calcula a luminância relativa da cor de fundo.
const isLightColor = computed(() => {
  const hex = (props.color || '#737373').replace('#', '')
  if (hex.length !== 6) return false
  const r = parseInt(hex.slice(0, 2), 16) / 255
  const g = parseInt(hex.slice(2, 4), 16) / 255
  const b = parseInt(hex.slice(4, 6), 16) / 255
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return luminance > 0.75
})
</script>

<template>
  <div
    class="inline-flex shrink-0 items-center justify-center rounded-full font-bold ring-2 overflow-hidden"
    :class="[
      sizeClasses,
      isLightColor
        ? 'text-neutral-800 ring-neutral-300 dark:ring-neutral-600'
        : 'text-white ring-white/40 dark:ring-neutral-900/60',
    ]"
    :style="!logo ? { backgroundColor: color || '#737373' } : undefined"
  >
    <img v-if="logo" :src="logo" :alt="name" class="h-full w-full object-cover" />
    <span v-else>{{ initials }}</span>
  </div>
</template>
