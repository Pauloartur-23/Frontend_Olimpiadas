import { defineStore } from 'pinia'
import { teamsService } from '@/services/teamsService'
import type { Team, TeamDetail } from '@/types'
import { ApiError } from '@/services/api'

interface TeamsState {
  teams: Team[]
  loading: boolean
  error: string | null
  loaded: boolean
  currentTeam: TeamDetail | null
  currentTeamLoading: boolean
  currentTeamError: string | null
}

export const useTeamsStore = defineStore('teams', {
  state: (): TeamsState => ({
    teams: [],
    loading: false,
    error: null,
    loaded: false,
    currentTeam: null,
    currentTeamLoading: false,
    currentTeamError: null,
  }),
  actions: {
    async fetchTeams(force = false) {
      if (this.loaded && !force) return
      this.loading = true
      this.error = null
      try {
        // Times: assume poucas equipes (7), busca só a primeira página
        // mas percorre páginas adicionais se existirem.
        const first = await teamsService.list(1)
        let all = [...first.results]
        for (let page = 2; page <= first.total_pages; page++) {
          const next = await teamsService.list(page)
          all = all.concat(next.results)
        }
        this.teams = all
        this.loaded = true
      } catch (err) {
        this.error = err instanceof ApiError ? err.message : 'Erro ao carregar equipes.'
      } finally {
        this.loading = false
      }
    },

    async fetchTeamBySlug(slug: string) {
      this.currentTeamLoading = true
      this.currentTeamError = null
      this.currentTeam = null
      try {
        this.currentTeam = await teamsService.getBySlug(slug)
      } catch (err) {
        this.currentTeamError = err instanceof ApiError ? err.message : 'Erro ao carregar equipe.'
      } finally {
        this.currentTeamLoading = false
      }
    },
  },
})
