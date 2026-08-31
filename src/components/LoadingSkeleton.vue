<script setup lang="ts">
withDefaults(
  defineProps<{
    count?: number
    variant?: 'card' | 'entity' | 'row' | 'text'
  }>(),
  { count: 3, variant: 'card' },
)
</script>

<template>
  <!-- Variante "card": mesma silhueta do MatchCard (faixa de status, duas
       equipes com avatar circular, rodapé de horário) para evitar o salto
       visual de um retângulo genérico virando conteúdo real. -->
  <div v-if="variant === 'card'" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    <div
      v-for="n in count"
      :key="n"
      class="card animate-pulse p-4 sm:p-5"
      role="status"
      aria-label="Carregando"
    >
      <div class="mb-4 flex items-center justify-between gap-2">
        <div class="skeleton-shimmer h-3 w-24 rounded bg-neutral-200 dark:bg-neutral-800"></div>
        <div class="skeleton-shimmer h-5 w-16 rounded-full bg-neutral-200 dark:bg-neutral-800"></div>
      </div>
      <div class="mb-4 flex items-center justify-between gap-3">
        <div class="flex flex-1 items-center gap-2">
          <div class="skeleton-shimmer h-7 w-7 shrink-0 rounded-full bg-neutral-200 dark:bg-neutral-800"></div>
          <div class="skeleton-shimmer h-3.5 w-16 rounded bg-neutral-200 dark:bg-neutral-800"></div>
        </div>
        <div class="skeleton-shimmer h-5 w-8 shrink-0 rounded bg-neutral-200 dark:bg-neutral-800"></div>
        <div class="flex flex-1 items-center justify-end gap-2">
          <div class="skeleton-shimmer h-3.5 w-16 rounded bg-neutral-200 dark:bg-neutral-800"></div>
          <div class="skeleton-shimmer h-7 w-7 shrink-0 rounded-full bg-neutral-200 dark:bg-neutral-800"></div>
        </div>
      </div>
      <div class="flex items-center justify-between">
        <div class="skeleton-shimmer h-3 w-20 rounded bg-neutral-200 dark:bg-neutral-800"></div>
        <div class="skeleton-shimmer h-3 w-14 rounded bg-neutral-200 dark:bg-neutral-800"></div>
      </div>
    </div>
  </div>

  <!-- Variante "entity": mesma silhueta de TeamCard/SportCard (ícone/emblema
       + título + linha de apoio) usada nas grades de equipes e modalidades. -->
  <div v-else-if="variant === 'entity'" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <div
      v-for="n in count"
      :key="n"
      class="card flex animate-pulse items-center gap-4 p-5"
      role="status"
      aria-label="Carregando"
    >
      <div class="skeleton-shimmer h-14 w-14 shrink-0 rounded-2xl bg-neutral-200 dark:bg-neutral-800"></div>
      <div class="min-w-0 flex-1 space-y-2">
        <div class="skeleton-shimmer h-4 w-2/3 rounded bg-neutral-200 dark:bg-neutral-800"></div>
        <div class="skeleton-shimmer h-3 w-1/3 rounded bg-neutral-200 dark:bg-neutral-800"></div>
      </div>
    </div>
  </div>

  <!-- Variante "row": mesma silhueta de uma linha de classificação (posição,
       avatar, nome, pontos). -->
  <div v-else-if="variant === 'row'" class="card animate-pulse divide-y divide-neutral-100 overflow-hidden dark:divide-neutral-800" role="status" aria-label="Carregando">
    <div v-for="n in count" :key="n" class="flex items-center gap-4 px-4 py-3">
      <div class="skeleton-shimmer h-6 w-6 shrink-0 rounded-full bg-neutral-200 dark:bg-neutral-800"></div>
      <div class="skeleton-shimmer h-8 w-8 shrink-0 rounded-full bg-neutral-200 dark:bg-neutral-800"></div>
      <div class="skeleton-shimmer h-3.5 flex-1 rounded bg-neutral-200 dark:bg-neutral-800"></div>
      <div class="skeleton-shimmer h-5 w-8 shrink-0 rounded bg-neutral-200 dark:bg-neutral-800"></div>
    </div>
  </div>

  <!-- Variante "text": bloco simples para cabeçalhos/detalhe de página. -->
  <div v-else class="card animate-pulse space-y-3 p-6" role="status" aria-label="Carregando">
    <div v-for="n in count" :key="n" class="skeleton-shimmer h-4 rounded bg-neutral-200 dark:bg-neutral-800" :style="{ width: n === count ? '40%' : '100%' }"></div>
  </div>
</template>
