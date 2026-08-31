import api from './api'
import type { Bet, Match, PaginatedResponse, PoolSettings, RankingEntry } from '@/types'

const MAX_PAGE_SIZE = 100

export interface BetPayload {
  match: number
  predicted_home: number
  predicted_away: number
}

export interface MatchResultPayload {
  scores: { team_id: number; points: number }[]
}

export const poolService = {
  async listBets(): Promise<Bet[]> {
    const first = await api.get<PaginatedResponse<Bet>>('/bolao/palpites/', {
      params: { page: 1, page_size: MAX_PAGE_SIZE },
    })
    let all = [...first.data.results]
    for (let page = 2; page <= first.data.total_pages; page++) {
      const next = await api.get<PaginatedResponse<Bet>>('/bolao/palpites/', {
        params: { page, page_size: MAX_PAGE_SIZE },
      })
      all = all.concat(next.data.results)
    }
    return all
  },

  async createBet(payload: BetPayload): Promise<Bet> {
    const { data } = await api.post<Bet>('/bolao/palpites/', payload)
    return data
  },

  async updateBet(id: number, payload: BetPayload): Promise<Bet> {
    const { data } = await api.patch<Bet>(`/bolao/palpites/${id}/`, payload)
    return data
  },

  async deleteBet(id: number): Promise<void> {
    await api.delete(`/bolao/palpites/${id}/`)
  },

  async ranking(): Promise<RankingEntry[]> {
    const { data } = await api.get<RankingEntry[]>('/bolao/ranking/')
    return data
  },

  async settings(): Promise<PoolSettings> {
    const { data } = await api.get<PoolSettings>('/bolao/configuracoes/')
    return data
  },

  async setMatchResult(matchId: number, payload: MatchResultPayload): Promise<Match> {
    const { data } = await api.patch<Match>(`/jogos/${matchId}/resultado/`, payload)
    return data
  },
}
