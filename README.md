# bolsomaster

Acervo pesquisável dos registros do documento **“Eleições 2026 — Corrupção”** (versão V2-10/10, 14 páginas): busca por nome ou assunto, filtros por tema, detalhes de cada registro com as fontes e download do PDF original.

Recriação do site [bolsomaster.site](https://bolsomaster.site) com **React + Vite + TanStack Router** (router code-based, estado de busca/filtro/registro nos search params).

## Desenvolvimento

```bash
npm install
npm run dev
```

## Build

```bash
npm run build   # tsc + vite build -> dist/
npm run preview
```

## Deploy (Cloudflare Pages)

```bash
npm run deploy  # build + wrangler pages deploy dist
```

## Estrutura

- `src/components/ArchivePage.tsx` — página principal (busca, filtros, lista, paginação, dialog)
- `src/components/RecordDialog.tsx` — modal de detalhes do registro com fontes e trecho do PDF
- `src/data/archive.json` — os 106 registros (extraídos do site original)
- `public/documento-original.pdf` — o PDF original para download

> A existência de um registro não comprova crime. Consulta editorial: 10/10/2026.
