const WEEKDAYS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado']
const MONTHS = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
]

/**
 * Constrói um Date local a partir de 'YYYY-MM-DD' e 'HH:mm[:ss]' sem problemas de fuso.
 * Alguns jogos (ex: Valorant, League of Legends) ainda não têm data/horário definido na
 * fonte oficial e a API manda `null` nesses campos — nesse caso não há como construir um
 * Date válido, então devolvemos `null` em vez de arriscar um "Invalid Date" ou um horário
 * inventado (ex: meia-noite).
 */
export function toLocalDateTime(date: string | null | undefined, time: string | null | undefined): Date | null {
  if (!date || !time) return null
  const [y, m, d] = date.split('-').map(Number)
  const [h, min, s] = time.split(':').map(Number)
  return new Date(y, (m || 1) - 1, d || 1, h || 0, min || 0, s || 0)
}

/** True quando o jogo já tem data E horário definidos pela fonte oficial. */
export function hasScheduledDateTime(date: string | null | undefined, time: string | null | undefined): boolean {
  return !!date && !!time
}

export function formatTime(time: string | null | undefined): string {
  return time?.slice(0, 5) ?? ''
}

/** "12:30" ou, quando `endTime` está definido (ex: Pique-Bandeira, Gincana), "12:30 – 14:00". */
export function formatTimeRange(time: string | null | undefined, endTime: string | null | undefined): string {
  const start = formatTime(time)
  const end = formatTime(endTime)
  return end ? `${start} – ${end}` : start
}

export function formatDateShort(date: string | null | undefined): string {
  if (!date) return ''
  const [y, m, d] = date.split('-').map(Number)
  const dt = new Date(y, (m || 1) - 1, d || 1)
  return dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

export function formatDateLong(date: string | null | undefined): string {
  if (!date) return ''
  const [y, m, d] = date.split('-').map(Number)
  const dt = new Date(y, (m || 1) - 1, d || 1)
  return `${WEEKDAYS[dt.getDay()]}, ${dt.getDate()} de ${MONTHS[dt.getMonth()]}`
}

export function isMatchUpcoming(date: string | null | undefined, time: string | null | undefined): boolean {
  const dt = toLocalDateTime(date, time)
  if (!dt) return false
  return dt.getTime() > Date.now()
}

export function todayIso(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
