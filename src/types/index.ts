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
  // Ausente quando o usuário não está autenticado (ver `TeamSerializer.to_representation`
  // no backend) — a pontuação da equipe é restrita, igual à Classificação Geral.
  points?: number
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

// Uma colocação premiada (1º/2º/3º) da equipe em uma prova — só provas
// com pódio decidido aparecem aqui (ver `TeamMedalSerializer` no backend).
export interface TeamMedal {
  position: 1 | 2 | 3
  category: string
  category_display: string
  prova: string
}

export interface TeamDetail extends Team {
  upcoming_matches: TeamUpcomingMatch[]
  medals: TeamMedal[]
}

// Uma linha do pódio de uma prova sem confronto par-a-par (Laço, Uno,
// Xadrez, Pife, Desfile de Abertura...) — GET /api/colocacoes/?label=.
export interface EventPlacementEntry {
  id: number
  category: string
  label: string
  team: MatchTeamSummary
  // `null` = colocação informativa (ex.: semifinalista eliminada, sem
  // disputa de 3º lugar) — não é pódio, só contexto.
  position: 1 | 2 | 3 | null
  notes: string
  score: string | null
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
