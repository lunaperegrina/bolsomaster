import raw from '../data/processados.json'
import { normalize } from './archive'

// Duas listas, duas plataformas: os 639 perfis do X citados no documento
// da ação (thread de @joaosenzi) e os 638 perfis do Instagram citados na
// petição ao TSE (carrossel de @livresiguaisbr). Só o handle vem das fontes.
export type Network = 'x' | 'ig'

export interface PostLink {
  url: string
  date: string
}

export interface ProcessadoItem {
  handle: string
  index: number
  network: Network
  url: string
  citacoes: number
  postLinks: PostLink[]
  unreadable: number
  searchText: string
}

interface RawProfile {
  handle: string
  posts?: unknown
  network?: string
}

// Data de publicação derivada do ID snowflake do tweet: (id >> 22) + epoch
// do Twitter, formatada no fuso de Brasília.
export function snowflakeDate(id: string): string {
  const ms = (Number(id) / 4194304) + 1288834974657
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(ms))
}

const asIds = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [])

export const processados: ProcessadoItem[] = (raw.profiles as RawProfile[]).map((p, i) => {
  const network = (p.network === 'ig' ? 'ig' : 'x') as Network
  const ids = asIds(p.posts)
  const valid = ids.filter((id) => /^\d{19}$/.test(id))
  return {
    handle: p.handle,
    index: i + 1,
    network,
    url:
      network === 'ig'
        ? `https://www.instagram.com/${p.handle}/`
        : `https://x.com/${p.handle}`,
    citacoes: ids.length,
    postLinks: valid.map((id) => ({
      url: `https://x.com/${p.handle}/status/${id}`,
      date: snowflakeDate(id),
    })),
    unreadable: ids.length - valid.length,
    searchText: normalize(p.handle),
  }
})

export const processadosCount = processados.length
export const xCount = processados.filter((p) => p.network === 'x').length
export const igCount = processados.filter((p) => p.network === 'ig').length
export const postsCitados = processados.reduce((acc, p) => acc + p.citacoes, 0)
export const processadosDate = raw.date
export const listaDate = raw.listaDate
export const sourceAuthor = raw.source.author
export const sourceUrl = raw.source.url
export const tseAuthor = raw.sourceTse.author
export const tseUrl = raw.sourceTse.url
export const tseCase = raw.sourceTse.case
export const tseDate = raw.sourceTse.date
export const tseTotal = raw.sourceTse.total

export function findExact(query: string): ProcessadoItem | undefined {
  const q = normalize(query.trim().replace(/^@/, ''))
  if (!q) return undefined
  return processados.find((p) => normalize(p.handle) === q)
}
