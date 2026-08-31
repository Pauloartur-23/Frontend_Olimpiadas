import api from './api'
import type { Standing } from '@/types'

export const standingsService = {
  async list(): Promise<Standing[]> {
    const { data } = await api.get<Standing[]>('/classificacao/')
    return data
  },
}
