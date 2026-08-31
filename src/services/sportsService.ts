import api from './api'
import type { PaginatedResponse, Sport } from '@/types'

export const sportsService = {
  async list(page = 1): Promise<PaginatedResponse<Sport>> {
    const { data } = await api.get<PaginatedResponse<Sport>>('/modalidades/', {
      params: { page },
    })
    return data
  },

  async getBySlug(slug: string): Promise<Sport> {
    const { data } = await api.get<Sport>(`/modalidades/${slug}/`)
    return data
  },
}
