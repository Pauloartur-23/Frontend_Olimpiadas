// ---------- Paginação genérica ----------
export interface PaginatedResponse<T> {
  page: number
  page_size: number
  total_pages: number
  results: T[]
}

// ---------- Equipe ----------
export interface Team {
  id: number
  slug: string
  name: string
  primary_color: string
  secondary_color: string
  description: string | null
  logo: string | null
  games_played: number
  wins: number
  losses: number
  draws: number
  points: number
}

// Jogo "resumido" como devolvido dentro de /equipes/<slug>/ (upcoming_matches).
// Formato bem mais enxuto que /jogos/: sport é uma string (não objeto) e não
// há teams/location/scores — não é seguro reutilizar o tipo `Match` aqui.
export interface TeamUpcomingMatch {
  id: number
  sport: string
  // Alguns jogos (ex: Valorant, League of Legends) ainda não têm data/horário
  // definido na fonte oficial — a API expõe `null` nesses casos.
  date: string | null
  time: string | null
  phase: string
  status: MatchStatus
}

export interface TeamDetail extends Team {
  upcoming_matches: TeamUpcomingMatch[]
}

// ---------- Modalidade ----------
export interface Sport {
  id: number
  slug: string
  name: string
  category: string
  icon: string | null
  description: string | null
  teams_count: number
}

// ---------- Jogo ----------
export type MatchStatus = 'scheduled' | 'live' | 'finished'

export interface MatchSportSummary {
  id: number
  name: string
  slug: string
  // A API não envia `icon` nos endpoints de jogos (/jogos/, /jogos/hoje/,
  // /jogos/ao_vivo/, /jogos/<id>/) — só em /modalidades/. Ícone exibido na
  // UI vem de utils/sportIcons.ts (mapeado pelo slug), nunca deste campo.
  icon?: string | null
}

export interface MatchTeamSummary {
  id: number
  name: string
  slug: string
  primary_color: string
}

export interface MatchScore {
  // A API (MatchScoreSerializer) sempre aninha o objeto completo da equipe
  // aqui, nunca só o id — apesar do nome sugerir um id solto.
  team: MatchTeamSummary
  points: number
  is_winner: boolean
}

export interface Match {
  id: number
  sport: MatchSportSummary
  // Alguns jogos (ex: Valorant, League of Legends) ainda não têm data/horário
  // definido na fonte oficial — nesses casos a API manda `null` nos dois.
  date: string | null // YYYY-MM-DD | null
  time: string | null // HH:mm[:ss] | null
  phase: string
  teams: MatchTeamSummary[]
  note: string | null
  location: string | null
  status: MatchStatus
  scores: MatchScore[]
  // Explica por que `teams` tem menos de 2 elementos (ex: "vencedor da
  // partida 12"). Pode não estar presente dependendo do endpoint.
  pending_note?: string | null
}

// ---------- Classificação ----------
export interface StandingTeamSummary {
  id: number
  name: string
  slug: string
  primary_color: string
  secondary_color?: string
  // A API de /classificacao/ hoje não envia este campo (só /equipes/ envia).
  // Mantido opcional: TeamBadge já cai no fallback de iniciais quando ausente.
  logo?: string | null
}

export interface Standing {
  position: number
  team: StandingTeamSummary
  points: number
  games_played: number
  wins: number
  losses: number
  draws: number
  gold: number
  silver: number
  bronze: number
}

// ---------- Autenticação / usuário ----------
export interface User {
  id: number
  email: string
  name: string
  is_active: boolean
  is_staff: boolean
  is_superuser: boolean
  last_login: string | null
  groups: string[]
}

// ---------- Bolão ----------
export interface Bet {
  id: number
  match: number
  predicted_home: number
  predicted_away: number
  points: number | null
  locked: boolean
  created_at: string
  updated_at: string
}

export interface RankingEntry {
  position: number
  user: {
    id: number
    name: string
  }
  total_points: number
  bets_count: number
  exact_count: number
}

export interface PoolSettings {
  points_correct_result: number
  points_exact_score: number
  points_goal_difference: number
}

// ---------- Filtros de busca de jogos ----------
export interface MatchFilters {
  date?: string
  sport?: string
  team?: string
  phase?: string
  status?: MatchStatus | ''
  page?: number
  page_size?: number
}
