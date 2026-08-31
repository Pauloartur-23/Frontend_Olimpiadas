import {
  mdiBadminton,
  mdiBasketball,
  mdiCardsOutline,
  mdiCardsPlaying,
  mdiCardsPlayingOutline,
  mdiControllerClassic,
  mdiFlagVariant,
  mdiGamepadVariant,
  mdiHandBackRight,
  mdiLasso,
  mdiSoccer,
  mdiTableTennis,
  mdiTrophy,
  mdiVolleyball,
} from '@mdi/js'

/**
 * Mapeia o slug de cada uma das 21 modalidades para um ícone MDI semanticamente
 * próximo. Para os jogos eletrônicos (sem ícone MDI de marca disponível) usamos
 * ícones genéricos e honestos de controle/game, sem inventar logos.
 */
const SPORT_ICON_BY_SLUG: Record<string, string> = {
  badminton: mdiBadminton,
  'basquete-feminino-3x3': mdiBasketball,
  'basquete-masculino': mdiBasketball,
  'brawl-stars': mdiGamepadVariant,
  'clash-royale': mdiGamepadVariant,
  'free-fire': mdiGamepadVariant,
  'futsal-feminino': mdiSoccer,
  'futsal-masculino': mdiSoccer,
  'mortal-kombat': mdiControllerClassic,
  pife: mdiCardsPlaying,
  'pique-bandeira': mdiFlagVariant,
  'queimada-misto': mdiHandBackRight,
  truco: mdiCardsPlayingOutline,
  'tenis-de-mesa-dupla-feminino': mdiTableTennis,
  'tenis-de-mesa-dupla-masculino': mdiTableTennis,
  'tenis-de-mesa-individual-feminino': mdiTableTennis,
  'tenis-de-mesa-individual-masculino': mdiTableTennis,
  uno: mdiCardsOutline,
  'volei-feminino': mdiVolleyball,
  'volei-masculino': mdiVolleyball,
  'volei-de-mesa': mdiVolleyball,
  'volei-de-areia': mdiVolleyball,
  // Novas modalidades (cadastradas em paralelo no backend). Slugs assumidos a
  // partir do nome — confirmar contra GET /api/modalidades/ quando o backend
  // estiver com essas 6 modalidades disponíveis e ajustar a chave se divergir.
  valorant: mdiGamepadVariant,
  'league-of-legends': mdiGamepadVariant,
  // EA FC é um jogo eletrônico (não futsal real) — usamos o ícone genérico de
  // e-sport em vez de mdiSoccer para não confundir com Futsal Masc./Fem.
  'ea-fc': mdiGamepadVariant,
  'laco-individual': mdiLasso,
  'laco-em-dupla': mdiLasso,
}

const CATEGORY_FALLBACK_ICON: Record<string, string> = {
  eletronico: mdiGamepadVariant,
  jogos_de_mesa: mdiCardsPlaying,
  mesa: mdiTableTennis,
  coletivo: mdiSoccer,
  individual: mdiBadminton,
}

export function sportIcon(slug: string | null | undefined, category?: string | null): string {
  if (slug && SPORT_ICON_BY_SLUG[slug]) return SPORT_ICON_BY_SLUG[slug]
  if (category && CATEGORY_FALLBACK_ICON[category]) return CATEGORY_FALLBACK_ICON[category]
  return mdiTrophy
}
