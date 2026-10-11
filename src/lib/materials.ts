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
  dot: string
}

export const categories: MaterialCategory[] = [
  { key: 'compartilhar', label: 'Para compartilhar', dot: 'var(--cat-compartilhar)' },
  { key: 'jogos', label: 'Jogos e interativos', dot: 'var(--cat-jogos)' },
  { key: 'rua', label: 'Material de rua', dot: 'var(--cat-rua)' },
  { key: 'documentacao', label: 'Documentação e checagem', dot: 'var(--cat-documentacao)' },
  { key: 'debate', label: 'Onde debater', dot: 'var(--cat-debate)' },
]

export const typeMeta: Record<MaterialType, { label: string }> = {
  site: { label: 'Site' },
  jogo: { label: 'Jogo' },
  drive: { label: 'Drive' },
  pdf: { label: 'PDF' },
  mapa: { label: 'Mapa' },
  tweet: { label: 'Post no X' },
  interno: { label: 'Aqui no site' },
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

export const categoryByKey = (key: CategoryKey) => categories.find((c) => c.key === key)

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
