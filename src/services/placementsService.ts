import api from './api'
import type { EventPlacementEntry } from '@/types'

export const placementsService = {
  // Pódio de uma prova sem jogos cadastrados (Laço, Uno, Xadrez, Pife...).
  // `label` é o nome exato da prova, igual ao `Sport.name` correspondente.
  async byLabel(label: string): Promise<EventPlacementEntry[]> {
    const { data } = await api.get<EventPlacementEntry[]>('/colocacoes/', { params: { label } })
    return data
  },
}
