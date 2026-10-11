import raw from '../data/materials.json'
import { normalize } from './archive'

export type CategoryKey = 'compartilhar' | 'jogos' | 'rua' | 'documentacao' | 'debate'

export type MaterialType = 'site' | 'jogo' | 'drive' | 'pdf' | 'mapa' | 'tweet' | 'interno'

export interface MaterialEntry {
  id: string
  title: string
  description: string
  url: string
  category: CategoryKey
  type: MaterialType
  featured?: boolean
  note?: string
}

export interface MaterialItem extends MaterialEntry {
  searchText: string
}

export interface MaterialCategory {
  key: CategoryKey
  label: string
  emoji: string
}

export const categories: MaterialCategory[] = [
  { key: 'compartilhar', label: 'Para compartilhar', emoji: '📢' },
  { key: 'jogos', label: 'Jogos e interativos', emoji: '🎮' },
  { key: 'rua', label: 'Material de rua', emoji: '✊' },
  { key: 'documentacao', label: 'Documentação e checagem', emoji: '🔎' },
  { key: 'debate', label: 'Onde debater', emoji: '💬' },
]

export const typeMeta: Record<MaterialType, { icon: string; label: string }> = {
  site: { icon: '🌐', label: 'Site' },
  jogo: { icon: '🎮', label: 'Jogo' },
  drive: { icon: '📁', label: 'Drive' },
  pdf: { icon: '📄', label: 'PDF' },
  mapa: { icon: '📍', label: 'Mapa' },
  tweet: { icon: '✕', label: 'Post no X' },
  interno: { icon: '📚', label: 'Aqui no site' },
}

export const materials: MaterialItem[] = (raw.items as MaterialEntry[]).map((m) => ({
  ...m,
  searchText: normalize([m.title, m.description, m.category, m.type, m.note ?? ''].join(' ')),
}))

export const materialsDate = raw.date
export const masterlistAuthor = raw.source.author
export const masterlistUrl = raw.source.url

export const categoryLabel = (key: CategoryKey) =>
  categories.find((c) => c.key === key)?.label ?? key

export const countByCategory = (key: CategoryKey) =>
  materials.filter((m) => m.category === key).length

export const featuredMaterials = materials.filter((m) => m.featured)

export function hostLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return 'a verdade.'
  }
}

export function sharePayload(item: MaterialItem): { title: string; text: string; url: string } {
  return {
    title: item.title,
    text: `${item.title} — ${item.description}`,
    url: new URL(item.url, window.location.origin).toString(),
  }
}
