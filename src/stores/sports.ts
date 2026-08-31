import { defineStore } from 'pinia'
import { sportsService } from '@/services/sportsService'
import type { Sport } from '@/types'
import { ApiError } from '@/services/api'

interface SportsState {
  sports: Sport[]
  loading: boolean
  error: string | null
  loaded: boolean
  currentSport: Sport | null
  currentSportLoading: boolean
  currentSportError: string | null
}

export const useSportsStore = defineStore('sports', {
  state: (): SportsState => ({
    sports: [],
    loading: false,
    error: null,
    loaded: false,
    currentSport: null,
    currentSportLoading: false,
    currentSportError: null,
  }),
  actions: {
    async fetchSports(force = false) {
      if (this.loaded && !force) return
      this.loading = true
      this.error = null
      try {
        const first = await sportsService.list(1)
        let all = [...first.results]
        for (let page = 2; page <= first.total_pages; page++) {
          const next = await sportsService.list(page)
          all = all.concat(next.results)
        }
        this.sports = all
        this.loaded = true
      } catch (err) {
        this.error = err instanceof ApiError ? err.message : 'Erro ao carregar modalidades.'
      } finally {
        this.loading = false
      }
    },

    async fetchSportBySlug(slug: string) {
      this.currentSportLoading = true
      this.currentSportError = null
      this.currentSport = null
      try {
        this.currentSport = await sportsService.getBySlug(slug)
      } catch (err) {
        this.currentSportError =
          err instanceof ApiError ? err.message : 'Erro ao carregar modalidade.'
      } finally {
        this.currentSportLoading = false
      }
    },
  },
})
