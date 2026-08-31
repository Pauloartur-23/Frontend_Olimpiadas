import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

export type EventPhase = 'before' | 'during' | 'after'

interface CountdownParts {
  days: number
  hours: number
  minutes: number
  seconds: number
}

/**
 * Countdown até `targetStart`. Se `targetEnd` for fornecido, o composable
 * também informa se o evento está em andamento ou já encerrado.
 */
export function useCountdown(targetStart: Date, targetEnd?: Date) {
  const now = ref(new Date())
  let timer: ReturnType<typeof setInterval> | undefined

  onMounted(() => {
    timer = setInterval(() => {
      now.value = new Date()
    }, 1000)
  })

  onBeforeUnmount(() => {
    if (timer) clearInterval(timer)
  })

  const phase = computed<EventPhase>(() => {
    if (now.value < targetStart) return 'before'
    if (targetEnd && now.value > targetEnd) return 'after'
    if (!targetEnd && now.value > targetStart) return 'during'
    return 'during'
  })

  const remaining = computed<CountdownParts>(() => {
    const diff = Math.max(0, targetStart.getTime() - now.value.getTime())
    const totalSeconds = Math.floor(diff / 1000)
    const days = Math.floor(totalSeconds / 86400)
    const hours = Math.floor((totalSeconds % 86400) / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    return { days, hours, minutes, seconds }
  })

  return { now, phase, remaining }
}
