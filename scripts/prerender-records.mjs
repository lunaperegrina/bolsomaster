// Pré-render estático das páginas /registro/<id> com meta tags Open Graph.
//
// O site é uma SPA (CSR puro), então crawlers de preview (WhatsApp, Telegram,
// redes sociais) não executam o JavaScript e veriam sempre as tags genéricas do
// index.html. Este script roda depois do `vite build` e gera uma cópia do
// dist/index.html por registro, com og:title/og:description/og:url por caso.
// O Cloudflare Pages serve o arquivo estático antes do fallback SPA
// (public/_redirects), então o crawler vê as tags e o usuário recebe a SPA.
//
// A URL pública pode ser sobrescrita: SITE_URL=https://exemplo.dev npm run build
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const SITE_URL = (process.env.SITE_URL ?? 'https://bolsomaster.site').replace(/\/$/, '')

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// Remove title/og/twitter/canonical do template para reinjetar por página.
const stripPageMeta = (html) =>
  html
    .replace(/<title>[\s\S]*?<\/title>/i, '')
    .replace(/<meta\s+(?:name|property)=["'](?:description|og:|twitter:)[^"']*["'][^>]*>/gi, '')
    .replace(/<link\s+rel=["']canonical["'][^>]*>/gi, '')

const metaBlock = (m) => '    ' + m.join('\n    ')

const archive = JSON.parse(readFileSync(join(root, 'src/data/archive.json'), 'utf8'))
const template = readFileSync(join(dist, 'index.html'), 'utf8')

// Página raiz: tags do site com URL absoluta (corrige também o dist/index.html).
const rootTitle = 'a verdade. Acusações contra Flávio Bolsonaro'
const rootDesc =
  'Consulte as acusações e o contexto do documento Eleições 2026 e a Central de Materiais da campanha: cards, jogos, arte de rua e documentos para virar voto.'
const rootHtml = stripPageMeta(template).replace(
  '</head>',
  `${metaBlock([
    `<title>${esc(rootTitle)}</title>`,
    `<meta name="description" content="${esc(rootDesc)}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="a verdade.">`,
    `<meta property="og:title" content="${esc(rootTitle)}">`,
    `<meta property="og:description" content="${esc(rootDesc)}">`,
    `<meta property="og:url" content="${SITE_URL}/">`,
    `<meta property="og:image" content="${SITE_URL}/og-default.png">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<link rel="canonical" href="${SITE_URL}/">`,
  ])}\n  </head>`,
)
writeFileSync(join(dist, 'index.html'), rootHtml)

// Página /materiais: Central de Materiais com OG própria (canal principal: WhatsApp).
const matTitle = 'Central de Materiais · a verdade.'
const matDesc =
  'Cards, jogos, arte de rua e documentos pra compartilhar, jogar, imprimir e debater. Tudo num lugar só.'
const matUrl = `${SITE_URL}/materiais`
const matHtml = stripPageMeta(template).replace(
  '</head>',
  `${metaBlock([
    `<title>${esc(matTitle)}</title>`,
    `<meta name="description" content="${esc(matDesc)}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="a verdade.">`,
    `<meta property="og:title" content="${esc(matTitle)}">`,
    `<meta property="og:description" content="${esc(matDesc)}">`,
    `<meta property="og:url" content="${matUrl}">`,
    `<meta property="og:image" content="${SITE_URL}/og-default.png">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<link rel="canonical" href="${matUrl}">`,
  ])}\n  </head>`,
)
mkdirSync(join(dist, 'materiais'), { recursive: true })
writeFileSync(join(dist, 'materiais', 'index.html'), matHtml)

// Página /processados: consulta "Fui processado?" com OG própria (canal: WhatsApp).
const procTitle = 'Fui processado pelo Flávio Bolsonaro? · a verdade.'
const procDesc =
  '639 perfis do X processados por Flávio Bolsonaro e 638 do Instagram citados no pedido dele ao TSE. Digite um @ e veja se você está em alguma das listas.'
const procUrl = `${SITE_URL}/processados`
const procHtml = stripPageMeta(template).replace(
  '</head>',
  `${metaBlock([
    `<title>${esc(procTitle)}</title>`,
    `<meta name="description" content="${esc(procDesc)}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="a verdade.">`,
    `<meta property="og:title" content="${esc(procTitle)}">`,
    `<meta property="og:description" content="${esc(procDesc)}">`,
    `<meta property="og:url" content="${procUrl}">`,
    `<meta property="og:image" content="${SITE_URL}/og-default.png">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<link rel="canonical" href="${procUrl}">`,
  ])}\n  </head>`,
)
mkdirSync(join(dist, 'processados'), { recursive: true })
writeFileSync(join(dist, 'processados', 'index.html'), procHtml)

// Uma página por registro.
for (const record of archive.cases) {
  const title = `${record.title} · a verdade.`
  const description = String(record.summary ?? record.text ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 240)
  const url = `${SITE_URL}/registro/${record.id}`
  const html = stripPageMeta(template).replace(
    '</head>',
    `${metaBlock([
      `<title>${esc(title)}</title>`,
      `<meta name="description" content="${esc(description)}">`,
      `<meta property="og:type" content="article">`,
      `<meta property="og:site_name" content="a verdade.">`,
      `<meta property="og:title" content="${esc(title)}">`,
      `<meta property="og:description" content="${esc(description)}">`,
      `<meta property="og:url" content="${url}">`,
      `<meta property="og:image" content="${SITE_URL}/og-default.png">`,
      `<meta name="twitter:card" content="summary_large_image">`,
      `<link rel="canonical" href="${url}">`,
    ])}\n  </head>`,
  )
  const dir = join(dist, 'registro', record.id)
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'index.html'), html)
}

console.log(
  `prerender: ${archive.cases.length} páginas em dist/registro/<id>/index.html + raiz e /materiais com OG`,
)
