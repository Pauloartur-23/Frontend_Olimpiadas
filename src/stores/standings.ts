import { defineStore } from 'pinia'
import { standingsService } from '@/services/standingsService'
import type { Standing } from '@/types'
import { ApiError } from '@/services/api'

interface StandingsState {
  standings: Standing[]
  loading: boolean
  error: string | null
  loaded: boolean
}

export const useStandingsStore = defineStore('standings', {
  state: (): StandingsState => ({
    standings: [],
    loading: false,
    error: null,
    loaded: false,
  }),
  actions: {
    async fetchStandings(force = false) {
      if (this.loaded && !force) return
      this.loading = true
      this.error = null
      try {
        this.standings = await standingsService.list()
        this.loaded = true
      } catch (err) {
        this.error = err instanceof ApiError ? err.message : 'Erro ao carregar classificação.'
      } finally {
        this.loading = false
      }
    },
  },
})
