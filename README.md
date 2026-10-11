# bolsomaster

Acervo pesquisável dos registros do documento **“Eleições 2026: Corrupção”** (versão V2-10/10, 14 páginas): busca por nome ou assunto, filtros por tema, detalhes de cada registro com as fontes e download do PDF original.

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

- `src/components/ArchivePage.tsx`: página principal (hero com foto, destaques, busca, filtros, seções por episódio, dialog)
- `src/components/Highlights.tsx`: "Entenda os principais casos em 2 minutos" (3 casos com "Ver fontes")
- `src/components/RecordDialog.tsx`: modal de detalhes: brief do caso em 4 pontos, fontes com data, trecho do PDF e compartilhamento (WhatsApp / share nativo / copiar link)
- `src/data/archive.json`: os 106 registros + bloco `episodes` (14 episódios com `what`/`flavio`/`response`); campo `episode` em cada registro agrupa os casos; `sourceDate` guarda a data da reportagem quando conhecida
- `src/data/highlights.json`: os 3 destaques da capa
- `public/documento-original.pdf`: o PDF original para download
- `public/flavio-{320,640}.jpg`: foto do hero (Carlos Moura/Agência Senado, CC BY-SA 4.0)
- `public/og-default.png`: imagem de preview de compartilhamento (gere com `python3 scripts/make-og.py`)
- `scripts/prerender-records.mjs`: roda no build e gera `dist/registro/<id>/index.html` com og: tags por registro (preview do WhatsApp/Telegram). URL pública via `SITE_URL` (padrão `https://bolsomaster.site`)

## Rotas

- `/`: acervo na capa (sem busca/filtro: registros agrupados por episódio; com busca/filtro: lista plana com chip do caso)
- `/registro/<id>`: página de um registro (abre o dialog; é a URL usada ao compartilhar)
- `?registro=<id>` e `#registro-XXX` continuam funcionando como aliases

> A existência de um registro não comprova crime. Consulta editorial: 10/10/2026.
