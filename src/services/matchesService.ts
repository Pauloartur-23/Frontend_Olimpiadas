import api from './api'
import type { Match, MatchFilters, PaginatedResponse } from '@/types'

// Page size máximo aceito pela API — usado para minimizar o número de
// requisições ao agregar todas as páginas de um filtro.
const MAX_PAGE_SIZE = 100

export const matchesService = {
  async list(filters: MatchFilters = {}): Promise<PaginatedResponse<Match>> {
    const params: Record<string, string | number> = {}
    if (filters.date) params.date = filters.date
    if (filters.sport) params.sport = filters.sport
    if (filters.team) params.team = filters.team
    if (filters.phase) params.phase = filters.phase
    if (filters.status) params.status = filters.status
    if (filters.page) params.page = filters.page
    if (filters.page_size) params.page_size = filters.page_size

    const { data } = await api.get<PaginatedResponse<Match>>('/jogos/', { params })
    return data
  },

  /**
   * Busca TODAS as páginas de jogos que casam com os filtros informados
   * (ignorando `page`/`page_size` do argumento). Necessário porque a API
   * pagina em blocos de até 100 itens e algumas listagens (um dia inteiro
   * do evento, todos os jogos de uma modalidade/equipe) podem facilmente
   * ultrapassar isso — não podemos truncar silenciosamente.
   */
  async listAll(filters: Omit<MatchFilters, 'page' | 'page_size'> = {}): Promise<Match[]> {
    const first = await this.list({ ...filters, page: 1, page_size: MAX_PAGE_SIZE })
    let all = [...first.results]
    for (let page = 2; page <= first.total_pages; page++) {
      const next = await this.list({ ...filters, page, page_size: MAX_PAGE_SIZE })
      all = all.concat(next.results)
    }
    return all
  },

  async today(): Promise<Match[]> {
    const { data } = await api.get<Match[]>('/jogos/hoje/')
    return data
  },

  async live(): Promise<Match[]> {
    const { data } = await api.get<Match[]>('/jogos/ao_vivo/')
    return data
  },

  async getById(id: number | string): Promise<Match> {
    const { data } = await api.get<Match>(`/jogos/${id}/`)
    return data
  },
}
