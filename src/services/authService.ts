import api from './api'
import type { User } from '@/types'

export interface TokenPair {
  access: string
  refresh: string
}

export interface RegisterPayload {
  email: string
  name: string
  password: string
}

export interface RegisterResponse {
  id: number
  email: string
  name: string
}

export const authService = {
  async register(payload: RegisterPayload): Promise<RegisterResponse> {
    const { data } = await api.post<RegisterResponse>('/registro/', payload)
    return data
  },

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
