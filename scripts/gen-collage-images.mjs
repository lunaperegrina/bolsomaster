#!/usr/bin/env node
// Gera os retalhos fotográficos da colagem da hero do acervo (WebP, gpt-image-1)
// em public/img/collage/. Uso: OPENAI_API_KEY=... node scripts/gen-collage-images.mjs [--force] [id ...]
// Idempotente: pula scraps que já têm .webp (a menos que --force).
import { mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = resolve(root, 'public/img/collage')

const args = process.argv.slice(2)
const force = args.includes('--force')
const only = args.filter((a) => !a.startsWith('--'))

// Retalhos = fragmentos de foto recortados, não cenas inteiras: P&B puro com
// retícula halftone e borda de papel, pra colar sobre os blocos vermelhos.
const BASE =
  'A small photograph scrap cut from a black and white magazine, coarse halftone dot screen, ' +
  'photocopy grain, high contrast, slightly aged white paper border, torn/scissor-cut edges. ' +
  'Absolutely no text, no letters, no numbers, no typography anywhere.'

const SCRAPS = {
  'postal-palmeiras': {
    size: '1536x1024',
    scene:
      'Vintage Rio de Janeiro postcard view: tall royal palm trees lining a seaside boulevard, waves breaking on the sand, distant mountains.',
  },
  'snap-mansao': {
    size: '1024x1024',
    scene:
      'Real-estate listing photograph of a luxury modern mansion facade with a swimming pool and palm trees, shot in bright daylight.',
  },
  'snap-documento': {
    size: '1024x1024',
    scene:
      'Abstract official paper scrap with big round rubber stamp marks and ink smudges, illegible scrawled lines, a red denial stripe across.',
  },
}

const KEY = process.env.OPENAI_API_KEY
if (!KEY) {
  console.error('Defina OPENAI_API_KEY no ambiente.')
  process.exit(1)
}

mkdirSync(outDir, { recursive: true })

async function generate(prompt, size) {
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-image-1',
      prompt,
      size,
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

const ids = Object.keys(SCRAPS).filter((id) => !only.length || only.includes(id))
let ok = 0
const failed = []

for (const id of ids) {
  const out = resolve(outDir, `${id}.webp`)
  if (!force && existsSync(out)) {
    console.log(`= ${id} (já existe)`)
    ok++
    continue
  }
  const { size, scene } = SCRAPS[id]
  process.stdout.write(`> ${id}... `)
  try {
    const buf = await generate(`${BASE} Scene: ${scene}`, size)
    writeFileSync(out, buf)
    console.log(`ok (${(buf.length / 1024).toFixed(0)} KB)`)
    ok++
  } catch (err) {
    console.log(`falhou: ${err.message}`)
    failed.push(id)
  }
}

console.log(`\n${ok}/${ids.length} gerados.`)
if (failed.length) {
  console.error(`Falharam: ${failed.join(', ')}`)
  process.exit(2)
}
