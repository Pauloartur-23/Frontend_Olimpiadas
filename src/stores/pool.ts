import { defineStore } from 'pinia'
import { poolService, type BetPayload, type MatchResultPayload } from '@/services/poolService'
import type { Bet, PoolSettings, RankingEntry } from '@/types'
import { ApiError } from '@/services/api'

interface PoolState {
  bets: Bet[]
  betsLoading: boolean
  betsError: string | null
  betsLoaded: boolean

  ranking: RankingEntry[]
  rankingLoading: boolean
  rankingError: string | null

  settings: PoolSettings | null
  settingsLoading: boolean
  settingsError: string | null

  savingMatchId: number | null
  saveError: string | null
}

export const usePoolStore = defineStore('pool', {
  state: (): PoolState => ({
    bets: [],
    betsLoading: false,
    betsError: null,
    betsLoaded: false,

    ranking: [],
    rankingLoading: false,
    rankingError: null,

    settings: null,
    settingsLoading: false,
    settingsError: null,

    savingMatchId: null,
    saveError: null,
  }),
  getters: {
    betByMatch: (state) => (matchId: number) => state.bets.find((b) => b.match === matchId) || null,
    totalPoints: (state) => state.bets.reduce((sum, b) => sum + (b.points ?? 0), 0),
  },
  actions: {
    async fetchBets(force = false) {
      if (this.betsLoaded && !force) return
      this.betsLoading = true
      this.betsError = null
      try {
        this.bets = await poolService.listBets()
        this.betsLoaded = true
      } catch (err) {
        this.betsError = err instanceof ApiError ? err.message : 'Erro ao carregar seus palpites.'
      } finally {
        this.betsLoading = false
      }
    },

    async fetchRanking() {
      this.rankingLoading = true
      this.rankingError = null
      try {
        this.ranking = await poolService.ranking()
      } catch (err) {
        this.rankingError = err instanceof ApiError ? err.message : 'Erro ao carregar o ranking.'
      } finally {
        this.rankingLoading = false
      }
    },

    async fetchSettings() {
      this.settingsLoading = true
      this.settingsError = null
      try {
        this.settings = await poolService.settings()
      } catch (err) {
        this.settingsError = err instanceof ApiError ? err.message : 'Erro ao carregar as regras do bolão.'
      } finally {
        this.settingsLoading = false
      }
    },

    /** Cria ou atualiza (se já existir) o palpite do usuário para um jogo. */
    async saveBet(payload: BetPayload): Promise<Bet> {
      const existing = this.betByMatch(payload.match)
      const bet = existing ? await poolService.updateBet(existing.id, payload) : await poolService.createBet(payload)
      const idx = this.bets.findIndex((b) => b.id === bet.id)
      if (idx >= 0) this.bets.splice(idx, 1, bet)
      else this.bets.push(bet)
      return bet
    },

    async setMatchResult(matchId: number, payload: MatchResultPayload) {
      this.savingMatchId = matchId
      this.saveError = null
      try {
        return await poolService.setMatchResult(matchId, payload)
      } catch (err) {
        this.saveError = err instanceof ApiError ? err.message : 'Erro ao salvar o resultado.'
        throw err
      } finally {
        this.savingMatchId = null
      }
    },
  },
})
