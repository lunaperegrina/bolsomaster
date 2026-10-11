#!/usr/bin/env node
// Gera as capas dos materiais (WebP 1536x1024, gpt-image-1) em public/img/materiais/.
// Uso: OPENAI_API_KEY=... node scripts/gen-material-images.mjs [--force] [id ...]
// Idempotente: pula itens que já têm .webp (a menos que --force).
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = resolve(root, 'public/img/materiais')
const data = JSON.parse(readFileSync(resolve(root, 'src/data/materials.json'), 'utf8'))

const args = process.argv.slice(2)
const force = args.includes('--force')
const only = args.filter((a) => !a.startsWith('--'))

const BASE =
  'Editorial collage illustration for a Brazilian political street zine cover, 1990s xerox aesthetic. ' +
  'Aged cream newsprint paper background (warm off-white #F2ECDC). Black and white photographs rendered with coarse halftone dot screen, ' +
  'cut-and-paste with scissor-cut edges, torn bright red paper accents (#D9341F), photocopy grain, ink smudges, rubber-stamp textures. ' +
  'Bold protest poster energy, high contrast, dramatic but clean composition with breathing room. ' +
  'Absolutely no text, no letters, no numbers, no typography anywhere.'

const SOFT_BASE = BASE
  .replace('Brazilian political street zine', 'indie art zine')
  .replace('Bold protest poster energy', 'Bold poster energy')

const ABSTRACT =
  'Abstract collage on aged cream newsprint paper: a large black halftone dot gradient field, one torn bright red paper strip crossing ' +
  'diagonally, photocopy grain, high contrast, no text, no letters, no numbers.'

const SPECIFIC = {
  'cards-compartilhaveis':
    'Scattered stack of small square share-cards fanned out like trading cards over the paper, one pinned with a red paperclip, a few cards in red duotone halftone.',
  'acervo-da-vitoria':
    'A fan of printed media posters and a film strip unrolling across the page, cut-paper clapperboard and videotapes.',
  'drive-artes-ia':
    'An open manila folder exploding with fanned printed artworks, one sheet folded into a paper airplane taking off.',
  'cards-whatsapp':
    'A cut-paper smartphone with halftone chat bubbles popping out of the screen and turning into small cards.',
  'verdade-ou-boato':
    'A cut-paper balance scale: one pan holds a card with a big check mark, the other a card with a big X, playing cards and a die falling around.',
  superflavio:
    'A retro 8-bit pixel art platform game scene glued onto the newsprint: side-scrolling city skyline, a small pixel character jumping over pixel coins, blocky pixel clouds, pixel ground tiles.',
  'materiais-oficiais':
    'A neat stack of campaign posters tied with twine, red paper stars, a cut-paper megaphone silhouette.',
  'pontos-de-coleta':
    'A torn paper map of Brazil with red map pins and dotted route lines, a small parcel box, a compass rose cut from red paper.',
  'drive-lambes':
    'A brick city wall covered in freshly wheatpasted posters, a bucket of paste and a wide brush in the foreground, paste drips running down.',
  'lambes-qr':
    'One giant poster wheatpasted on a wall, its centerpiece a bold black-and-white QR code pattern, torn edges, a red diagonal ribbon crossing it.',
  'provas-interferencia':
    'A thick dossier folder with abstract rubber stamp marks, a magnifying glass over scattered documents, red string connecting pinned papers on a board.',
  'arquivo-documentado':
    'Rows of archive cabinet drawers slightly open with hanging files, scribbled index cards, a courthouse column silhouette in halftone.',
  'acervo-do-site':
    'A library shelf of archive boxes with abstract labels, one open box overflowing with index cards, a red bookmark ribbon.',
  'onde-conversar':
    'Two anonymous silhouetted people at a small cafe table in conversation, halftone speech bubbles above them, red map pins around, a coffee cup.',
}

const KEY = process.env.OPENAI_API_KEY
if (!KEY) {
  console.error('Defina OPENAI_API_KEY no ambiente.')
  process.exit(1)
}

mkdirSync(outDir, { recursive: true })

async function generate(prompt) {
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-image-1',
      prompt,
      size: '1536x1024',
      quality: 'medium',
      output_format: 'webp',
      output_compression: 82,
    }),
    signal: AbortSignal.timeout(240000),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`HTTP ${res.status}: ${body.slice(0, 300)}`)
  }
  const json = await res.json()
  const b64 = json?.data?.[0]?.b64_json
  if (!b64) throw new Error('resposta sem b64_json')
  return Buffer.from(b64, 'base64')
}

const targets = data.items.filter((i) => !only.length || only.includes(i.id))
let ok = 0
const failed = []

for (const item of targets) {
  const out = resolve(outDir, `${item.id}.webp`)
  if (!force && existsSync(out)) {
    console.log(`= ${item.id} (já existe)`)
    ok++
    continue
  }
  const prompts = [`${BASE} Scene: ${SPECIFIC[item.id]}`, `${SOFT_BASE} Scene: ${SPECIFIC[item.id]}`, ABSTRACT]
  let done = false
  for (let attempt = 0; attempt < prompts.length && !done; attempt++) {
    const label = attempt === 0 ? 'prompt' : attempt === 1 ? 'prompt suave' : 'abstrato'
    try {
      process.stdout.write(`> ${item.id} (${label})... `)
      const buf = await generate(prompts[attempt])
      writeFileSync(out, buf)
      console.log(`ok (${(buf.length / 1024).toFixed(0)} KB)`)
      ok++
      done = true
    } catch (err) {
      console.log(`falhou: ${err.message}`)
    }
  }
  if (!done) failed.push(item.id)
}

console.log(`\n${ok}/${targets.length} geradas.`)
if (failed.length) {
  console.error(`Falharam: ${failed.join(', ')}`)
  process.exit(2)
}
