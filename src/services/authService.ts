import api from './api'
import type { User } from '@/types'

export interface TokenPair {
  access: string
  refresh: string
}

export const authService = {
  async login(email: string, password: string): Promise<TokenPair> {
    const { data } = await api.post<TokenPair>('/token/', { email, password })
    return data
  },

  async refresh(refresh: string): Promise<{ access: string }> {
    const { data } = await api.post<{ access: string }>('/token/refresh/', { refresh })
    return data
  },

  async me(): Promise<User> {
    const { data } = await api.get<User>('/usuarios/me/')
    return data
  },
}
