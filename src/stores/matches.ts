import { defineStore } from 'pinia'
import { matchesService, type MatchResultPayload } from '@/services/matchesService'
import type { Match, MatchFilters, PaginatedResponse } from '@/types'
import { ApiError } from '@/services/api'

// Page size usado na listagem paginada de /jogos — reduz o número de
// cliques necessários para percorrer todos os 223 jogos (com 10 por
// página seriam 23 páginas; com 30, ficam ~8).
const LIST_PAGE_SIZE = 30

interface MatchesState {
  // /jogos com filtros
  list: Match[]
  listPage: number
  listTotalPages: number
  listLoading: boolean
  listError: string | null

  today: Match[]
  todayLoading: boolean
  todayError: string | null

  live: Match[]
  liveLoading: boolean
  liveError: string | null

  recentResults: Match[]
  recentResultsLoading: boolean
  recentResultsError: string | null

  // Todos os jogos de uma modalidade (detalhe de modalidade) — agrega todas
  // as páginas da API para nunca truncar uma modalidade com muitos jogos.
  bySport: Match[]
  bySportLoading: boolean
  bySportError: string | null

  savingMatchId: number | null
  saveError: string | null
}

export const useMatchesStore = defineStore('matches', {
  state: (): MatchesState => ({
    list: [],
    listPage: 1,
    listTotalPages: 1,
    listLoading: false,
    listError: null,

    today: [],
    todayLoading: false,
    todayError: null,

    live: [],
    liveLoading: false,
    liveError: null,

    recentResults: [],
    recentResultsLoading: false,
    recentResultsError: null,

    bySport: [],
    bySportLoading: false,
    bySportError: null,

    savingMatchId: null,
    saveError: null,
  }),
  actions: {
    async fetchList(filters: MatchFilters = {}) {
      this.listLoading = true
      this.listError = null
      try {
        const data: PaginatedResponse<Match> = await matchesService.list({
          page_size: LIST_PAGE_SIZE,
          ...filters,
        })
        this.list = data.results
        this.listPage = data.page
        this.listTotalPages = data.total_pages
      } catch (err) {
        this.listError = err instanceof ApiError ? err.message : 'Erro ao carregar jogos.'
      } finally {
        this.listLoading = false
      }
    },

    async fetchToday() {
      this.todayLoading = true
      this.todayError = null
      try {
        this.today = await matchesService.today()
      } catch (err) {
        this.todayError = err instanceof ApiError ? err.message : 'Erro ao carregar jogos de hoje.'
      } finally {
        this.todayLoading = false
      }
    },

    async fetchLive() {
      this.liveLoading = true
      this.liveError = null
      try {
        this.live = await matchesService.live()
      } catch (err) {
        this.liveError = err instanceof ApiError ? err.message : 'Erro ao carregar jogos ao vivo.'
      } finally {
        this.liveLoading = false
      }
    },

    async fetchRecentResults() {
      this.recentResultsLoading = true
      this.recentResultsError = null
      try {
        const results = await matchesService.listAll({ status: 'finished' })
        const sorted = [...results].sort((a, b) => {
          // Jogos finalizados sempre têm data/horário definidos na prática, mas
          // guardamos contra null (ex: modalidades sem horário confirmado) para
          // não ordenar de forma inconsistente caso isso mude.
          const dateA = `${a.date ?? ''}T${a.time ?? ''}`
          const dateB = `${b.date ?? ''}T${b.time ?? ''}`
          return dateB.localeCompare(dateA)
        })
        this.recentResults = sorted
      } catch (err) {
        this.recentResultsError =
          err instanceof ApiError ? err.message : 'Erro ao carregar últimos resultados.'
      } finally {
        this.recentResultsLoading = false
      }
    },

    /** Todos os jogos de uma modalidade (usado no detalhe de modalidade). */
    async fetchBySport(sportSlug: string) {
      this.bySportLoading = true
      this.bySportError = null
      try {
        this.bySport = await matchesService.listAll({ sport: sportSlug })
      } catch (err) {
        this.bySportError = err instanceof ApiError ? err.message : 'Erro ao carregar jogos da modalidade.'
      } finally {
        this.bySportLoading = false
      }
    },

    async setMatchResult(matchId: number, payload: MatchResultPayload) {
      this.savingMatchId = matchId
      this.saveError = null
      try {
        return await matchesService.setMatchResult(matchId, payload)
      } catch (err) {
        this.saveError = err instanceof ApiError ? err.message : 'Erro ao salvar o resultado.'
        throw err
      } finally {
        this.savingMatchId = null
      }
    },
  },
})
