import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

export const api = axios.create({
  baseURL,
  timeout: 10000,
})

export class ApiError extends Error {
  status?: number
  errors?: string[]
  constructor(message: string, status?: number, errors?: string[]) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

// ---------- Tokens (persistidos em localStorage) ----------
// Mantidos fora do Pinia store para evitar dependência circular entre este
// módulo (interceptors) e src/stores/auth.ts (que usa `api` para chamadas).
const ACCESS_TOKEN_KEY = 'olimpiadas-access-token'
const REFRESH_TOKEN_KEY = 'olimpiadas-refresh-token'

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}
export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}
export function setTokens(access: string | null, refresh?: string | null) {
  if (access) localStorage.setItem(ACCESS_TOKEN_KEY, access)
  else localStorage.removeItem(ACCESS_TOKEN_KEY)
  if (refresh !== undefined) {
    if (refresh) localStorage.setItem(REFRESH_TOKEN_KEY, refresh)
    else localStorage.removeItem(REFRESH_TOKEN_KEY)
  }
}
export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

/** Chamado pelo interceptor quando o refresh falha — o auth store se registra aqui para limpar seu estado e redirecionar. */
let onAuthFailure: (() => void) | null = null
export function registerAuthFailureHandler(handler: () => void) {
  onAuthFailure = handler
}

api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Instância separada, sem interceptors, usada só para o refresh — evita
// recursão infinita caso o próprio refresh devolva 401.
const rawApi = axios.create({ baseURL, timeout: 10000 })

let refreshPromise: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  const refresh = getRefreshToken()
  if (!refresh) throw new Error('Sem refresh token')
  if (!refreshPromise) {
    refreshPromise = rawApi
      .post<{ access: string }>('/token/refresh/', { refresh })
      .then((res) => {
        setTokens(res.data.access)
        return res.data.access
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status
    const originalRequest = error?.config
    const isRefreshCall = originalRequest?.url?.includes('/token/refresh/')

    if (status === 401 && !isRefreshCall && !originalRequest?._retry && getRefreshToken()) {
      originalRequest._retry = true
      try {
        const newAccess = await refreshAccessToken()
        originalRequest.headers = originalRequest.headers || {}
        originalRequest.headers.Authorization = `Bearer ${newAccess}`
        return api(originalRequest)
      } catch {
        clearTokens()
        onAuthFailure?.()
      }
    } else if (status === 401 && (isRefreshCall || !getRefreshToken())) {
      clearTokens()
      onAuthFailure?.()
    }

    const data = error?.response?.data
    const fieldErrors: string[] | undefined = Array.isArray(data?.non_field_errors)
      ? data.non_field_errors
      : undefined
    const message =
      fieldErrors?.[0] ||
      data?.detail ||
      (typeof data === 'string' ? data : undefined) ||
      error?.message ||
      'Não foi possível conectar ao servidor. Tente novamente.'
    return Promise.reject(new ApiError(message, status, fieldErrors))
  },
)

export default api
