import api from './api'
import type { PaginatedResponse, Team, TeamDetail } from '@/types'

export const teamsService = {
  async list(page = 1): Promise<PaginatedResponse<Team>> {
    const { data } = await api.get<PaginatedResponse<Team>>('/equipes/', {
      params: { page },
    })
    return data
  },

  async getBySlug(slug: string): Promise<TeamDetail> {
    const { data } = await api.get<TeamDetail>(`/equipes/${slug}/`)
    return data
  },
}
