import { defineStore } from 'pinia'
import { authService } from '@/services/authService'
import { ApiError } from '@/services/api'
import { clearTokens, getAccessToken, getRefreshToken, registerAuthFailureHandler, setTokens } from '@/services/api'
import type { User } from '@/types'
import router from '@/router'

const USER_STORAGE_KEY = 'olimpiadas-user'

function loadStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  loading: boolean
  error: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: loadStoredUser(),
    accessToken: getAccessToken(),
    refreshToken: getRefreshToken(),
    loading: false,
    error: null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.accessToken && !!state.user,
    isStaff: (state) => !!state.user?.is_staff,
  },
  actions: {
    persistUser(user: User | null) {
      this.user = user
      if (user) localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
      else localStorage.removeItem(USER_STORAGE_KEY)
    },

    async login(email: string, password: string) {
      this.loading = true
      this.error = null
      try {
        const tokens = await authService.login(email, password)
        this.accessToken = tokens.access
        this.refreshToken = tokens.refresh
        setTokens(tokens.access, tokens.refresh)
        await this.fetchMe()
      } catch (err) {
        this.error = err instanceof ApiError ? err.message : 'Erro ao entrar na conta.'
        throw err
      } finally {
        this.loading = false
      }
    },

    async register(email: string, name: string, password: string) {
      this.loading = true
      this.error = null
      try {
        await authService.register({ email, name, password })
        // Backend não retorna token no cadastro — loga automaticamente em seguida.
        await this.login(email, password)
      } catch (err) {
        this.error = err instanceof ApiError ? err.message : 'Erro ao criar conta.'
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchMe() {
      const me = await authService.me()
      this.persistUser(me)
      return me
    },

    logout() {
      this.accessToken = null
      this.refreshToken = null
      this.persistUser(null)
      clearTokens()
    },
  },
})

// Registrado uma única vez: quando o interceptor de resposta esgota as
// tentativas de refresh, limpa o store e manda para /login.
registerAuthFailureHandler(() => {
  const store = useAuthStore()
  store.logout()
  const current = router.currentRoute.value
  if (current.name !== 'login') {
    router.push({ name: 'login', query: { redirect: current.fullPath } })
  }
})
