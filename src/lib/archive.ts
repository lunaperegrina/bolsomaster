import raw from '../data/archive.json'

export interface ArchiveEntry {
  text: string
  pages: number[]
  links: string[]
  id: string
  title: string
  category: string
  kind: string
  note: string
  summary: string
  extraLinks: string[]
}

export interface ArchiveCase extends ArchiveEntry {
  number: string
  searchText: string
}

export const normalize = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

export const cases: ArchiveCase[] = (raw.cases as ArchiveEntry[]).map((c, i) => ({
  ...c,
  number: String(i + 1).padStart(3, '0'),
  searchText: normalize([c.title, c.text, c.summary, c.category, c.note, ...c.links].join(' ')),
}))

export const sourceCount = raw.sourceCount
export const editionDate = raw.date

export const filterButtons: { value: string; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'Banco Master e INSS', label: 'Master e INSS' },
  { value: 'STF e instituto ITER', label: 'STF e ITER' },
  { value: 'Aliados políticos', label: 'Aliados' },
  { value: 'Histórico de Flávio', label: 'Histórico de Flávio' },
  { value: 'Contexto político', label: 'Contexto político' },
]

const names: Record<string, string> = {
  'www.cnnbrasil.com.br': 'CNN Brasil',
  'noticias.uol.com.br': 'UOL',
  'www1.folha.uol.com.br': 'Folha de S.Paulo',
  'oglobo.globo.com': 'O Globo',
  'g1.globo.com': 'g1',
  'www.intercept.com.br': 'Intercept Brasil',
  'www.bbc.com': 'BBC News Brasil',
  'www.metropoles.com': 'Metrópoles',
  'piaui.uol.com.br': 'piauí',
  'www.aosfatos.org': 'Aos Fatos',
  'iclnoticias.com.br': 'ICL Notícias',
  'valor.globo.com': 'Valor Econômico',
  'www.estadao.com.br': 'Estadão',
  'revistaforum.com.br': 'Revista Fórum',
  'www.em.com.br': 'Estado de Minas',
  'veja.abril.com.br': 'Veja',
  'www.youtube.com': 'YouTube',
}

export function sourceName(url: string): string {
  try {
    const host = new URL(url).hostname
    return names[host] ?? host.replace(/^www\./, '')
  } catch {
    return 'Fonte'
  }
}

export const badgeClass = (kind: string) =>
  kind === 'Atualizado' ? 'updated' : kind === 'Nota de precisão' ? 'precision' : ''

export const isCorrection = (kind: string) =>
  kind === 'Atualizado' || kind === 'Nota de precisão'

export const contextLabel = (kind: string) =>
  kind === 'Atualizado'
    ? 'Atualização e resposta'
    : kind === 'Nota de precisão'
      ? 'Correção de precisão'
      : 'Contexto e limites da informação'
