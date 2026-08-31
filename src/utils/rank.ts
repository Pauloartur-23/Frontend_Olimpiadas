/**
 * Classes utilitárias para destacar o top 3 da classificação de forma sóbria
 * (borda lateral + selo numerado), reaproveitadas nas telas de Home,
 * Classificação e Modalidade.
 */
export function rankBorderClass(position: number): string {
  if (position === 1) return 'border-l-amber-400 dark:border-l-amber-500/70'
  if (position === 2) return 'border-l-neutral-300 dark:border-l-neutral-500'
  if (position === 3) return 'border-l-amber-700/60 dark:border-l-amber-700/50'
  return 'border-l-transparent'
}

export function rankBadgeClass(position: number): string {
  if (position === 1) return 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400'
  if (position === 2) return 'bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300'
  if (position === 3) return 'bg-amber-900/10 text-amber-800 dark:bg-amber-800/20 dark:text-amber-500'
  return 'text-neutral-400 dark:text-neutral-500'
}
