import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearch, Link } from '@tanstack/react-router'
import { cases, episodes, filterButtons, normalize, sourceCount, type ArchiveCase, type Episode } from '../lib/archive'
import { Header } from './Header'
import { Footer } from './Footer'
import { About } from './About'
import { Highlights } from './Highlights'
import { RecordCard } from './RecordCard'
import { RecordDialog } from './RecordDialog'
import { SearchBox, Toast, useToast } from './ui'

const PAGE_SIZE = 12

// Palavras-chave da tira vertical da colagem da hero.
const COLLAGE_WORDS = [
  'INSS',
  'VIAGENS',
  'MANSÕES',
  'RACHADINHAS',
  'STF',
  'JATINHO',
  'EUA',
  'FILME',
  'DOADORES',
]

interface ArchiveSearchParams {
  q?: string
  cat?: string
  registro?: string
}

export function ArchivePage({ recordIdFromPath }: { recordIdFromPath?: string }) {
  const navigate = useNavigate()
  const { q = '', cat = '', registro = '' } = useSearch({ strict: false }) as ArchiveSearchParams

  const [limit, setLimit] = useState(PAGE_SIZE)
  const toast = useToast()
  const sentinelRef = useRef<HTMLDivElement>(null)

  const filtered = useMemo(() => {
    const words = normalize(q.trim())
      .split(/\s+/)
      .filter(Boolean)
    return cases.filter(
      (c) => (!cat || c.category === cat) && words.every((w) => c.searchText.includes(w)),
    )
  }, [q, cat])

  const shown = filtered.slice(0, limit)
  const hasMore = filtered.length > limit

  // Sem busca/filtro, os registros aparecem agrupados por episódio (caso),
  // na ordem editorial de episodes; com busca/filtro, lista plana com chip
  // do episódio em cada card.
  const episodeSections = useMemo(() => {
    if (q.trim() || cat) return null
    const byEpisode = new Map<string | null, ArchiveCase[]>()
    for (const ep of episodes) byEpisode.set(ep.slug, [])
    byEpisode.set(null, [])
    for (const c of shown) byEpisode.get(c.episode ?? null)?.push(c)
    const sections: { episode: Episode | null; records: ArchiveCase[] }[] = episodes
      .map((episode) => ({ episode, records: byEpisode.get(episode.slug) ?? [] }))
      .filter((s) => s.records.length > 0)
    const outros = byEpisode.get(null) ?? []
    if (outros.length) sections.push({ episode: null, records: outros })
    return sections
  }, [shown, q, cat])

  const setQ = (value: string) =>
    navigate({ to: '/', search: (prev) => ({ ...prev, q: value || undefined }), replace: true })

  const setCategory = (value: string) =>
    navigate({ to: '/', search: (prev) => ({ ...prev, cat: value || undefined }) })

  const clearFilters = () => {
    navigate({ to: '/', search: (prev) => ({ ...prev, q: undefined, cat: undefined }) })
    document.getElementById('search')?.focus()
  }

  const openRecord = (id: string) => {
    if (recordIdFromPath) navigate({ to: '/registro/$id', params: { id } })
    else navigate({ to: '/', search: (prev) => ({ ...prev, registro: id }) })
  }

  const closeRecord = () => {
    if (recordIdFromPath) navigate({ to: '/' })
    else navigate({ to: '/', search: (prev) => ({ ...prev, registro: undefined }), replace: true })
  }

  // Reinicia a paginação quando a busca ou o filtro muda.
  useEffect(() => {
    setLimit(PAGE_SIZE)
  }, [q, cat])

  // Scroll infinito: quando o sentinel abaixo da lista se aproxima da viewport,
  // carrega o próximo bloco. O observer é recriado a cada load para reavaliar a
  // interseção: em viewports altas o sentinel pode continuar visível depois
  // que a lista cresce, sem mudar de estado para disparar de novo.
  useEffect(() => {
    if (!hasMore) return
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setLimit((n) => n + PAGE_SIZE)
      },
      { rootMargin: '600px 0px' },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [limit, hasMore])

  // Compatibilidade com links antigos no formato #registro-XXX.
  useEffect(() => {
    const fromHash = () => {
      if (!location.hash.startsWith('#registro-') || registro) return
      const id = location.hash.slice(1)
      if (cases.some((c) => c.id === id)) {
        navigate({ to: '/', search: (prev) => ({ ...prev, registro: id }), replace: true })
      }
    }
    fromHash()
    window.addEventListener('hashchange', fromHash)
    return () => window.removeEventListener('hashchange', fromHash)
  }, [registro, navigate])

  // Id de rota desconhecido volta para a capa em vez de exibir dialog vazio.
  useEffect(() => {
    if (recordIdFromPath && !cases.some((c) => c.id === recordIdFromPath)) {
      navigate({ to: '/', replace: true })
    }
  }, [recordIdFromPath, navigate])

  const activeRecord = cases.find((c) => c.id === (recordIdFromPath ?? registro))

  return (
    <>
      <a className="skip" href="#acervo">
        Ir para os registros
      </a>
      <Header />
      <main className="main--full">
        <section id="acervo" className="archive" aria-labelledby="archive-title">
          <div className="hero">
            <div className="hero-copy">
              <h1 className="manchete" id="archive-title">
                Acusações contra Flávio Bolsonaro<span className="dot" aria-hidden="true">.</span>
              </h1>
              <p className="hero-status">
                <b className="num">Mais de R$ 660 milhões</b> em valores citados nos casos que
                envolvem o senador e seu círculo (filme de <b className="num">R$ 134 milhões</b>,
                honorários de <b className="num">R$ 427 milhões</b>, mansões, rachadinha e emendas),
                além dos desvios bilionários do INSS.
              </p>
              <div className="hero-facts">
                <div className="fact">
                  <span className="fig num">
                    <small>R$</small>
                    660 <em>mi+</em>
                  </span>
                  <span className="lbl">em valores citados</span>
                </div>
                <div className="fact">
                  <span className="fig num">{cases.length}</span>
                  <span className="lbl">registros do dossiê</span>
                </div>
                <div className="fact">
                  <span className="fig num">{sourceCount}</span>
                  <span className="lbl">fontes citadas</span>
                </div>
              </div>
              <p className="hero-credit">
                Foto: Carlos Moura/Agência Senado ·{' '}
                <a
                  href="https://creativecommons.org/licenses/by-sa/4.0"
                  target="_blank"
                  rel="license noopener noreferrer"
                >
                  CC BY-SA 4.0
                </a>
              </p>
            </div>
            <div className="collage">
              <div className="collage-under" aria-hidden="true" />
              <div className="collage-red" aria-hidden="true" />
              <figure className="collage-portrait dots">
                <img
                  src="/flavio-poster.jpg"
                  width="560"
                  height="700"
                  alt="Retrato de Flávio Bolsonaro em sessão do Senado Federal"
                  decoding="async"
                />
              </figure>
              <img
                className="collage-scrap scrap-doc"
                src="/img/collage/scrap-documentos.jpg"
                alt=""
                aria-hidden="true"
                decoding="async"
              />
              <img
                className="collage-scrap scrap-stamps"
                src="/img/collage/scrap-carimbos.jpg"
                alt=""
                aria-hidden="true"
                decoding="async"
              />
              <img
                className="collage-scrap scrap-poster"
                src="/img/collage/scrap-poster.jpg"
                alt=""
                aria-hidden="true"
                decoding="async"
              />
              <div className="collage-sticker" aria-hidden="true">
                <span>Banco</span>
                <span>Master</span>
              </div>
              <ul className="collage-words" aria-label="Temas do dossiê">
                {COLLAGE_WORDS.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
              <div className="collage-halftone" aria-hidden="true" />
              <span className="collage-tape tape-a" aria-hidden="true" />
              <span className="collage-tape tape-b" aria-hidden="true" />
            </div>
          </div>
          <div className="wrap">
            <p className="materials-promo">
            <Link to="/materiais">
              Quer virar voto? Central de Materiais: cards, jogos e material de rua{' '}
              <span className="arrow" aria-hidden="true">→</span>
            </Link>
          </p>
          <Highlights onOpen={openRecord} />
          <div className="search-panel">
            <SearchBox
              id="search"
              value={q}
              onChange={setQ}
              placeholder="Buscar nome ou assunto"
              srLabel="Buscar nome ou assunto"
            />
          </div>
          <div className="filters" role="group" aria-label="Filtrar por assunto">
            {filterButtons.map((f) => (
              <button
                key={f.value}
                type="button"
                aria-pressed={f.value === cat}
                onClick={() => setCategory(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="results-meta">
            <p id="results-label" role="status" aria-live="polite">
              {filtered.length} {filtered.length === 1 ? 'registro' : 'registros'}
            </p>
            <button id="clear" hidden={!cat && !q} onClick={clearFilters}>
              Limpar filtros
            </button>
          </div>
          <div id="results" className="results">
            {shown.length ? (
              episodeSections ? (
                episodeSections.map((section) => (
                  <section
                    className="episode"
                    key={section.episode?.slug ?? 'outros'}
                    aria-labelledby={`episode-${section.episode?.slug ?? 'outros'}`}
                  >
                    <div className="episode-head">
                      <h3 id={`episode-${section.episode?.slug ?? 'outros'}`}>
                        {section.episode?.title ?? 'Outros registros'}
                      </h3>
                      <span className="episode-count">
                        {section.records.length}{' '}
                        {section.records.length === 1 ? 'registro' : 'registros'}
                      </span>
                    </div>
                    {section.episode && <p className="episode-blurb">{section.episode.blurb}</p>}
                    {section.records.map((c) => (
                      <RecordCard key={c.id} record={c} onOpen={openRecord} />
                    ))}
                  </section>
                ))
              ) : (
                shown.map((c) => (
                  <RecordCard key={c.id} record={c} onOpen={openRecord} showEpisode />
                ))
              )
            ) : (
              <div className="empty">
                <h3>Nenhum registro encontrado.</h3>
                <p>Tente outro nome ou assunto.</p>
              </div>
            )}
          </div>
          <div ref={sentinelRef} aria-hidden="true" />
          {hasMore && filtered.length > 0 && (
            <div className="pagination">
              <p id="page-info">
                Mostrando {shown.length} de {filtered.length} registros
              </p>
            </div>
          )}
          <noscript>
            Ative o JavaScript para usar a busca ou{' '}
            <a href="/documento-original.pdf" download="eleicoes-2026-original.pdf">
              baixe o PDF original
            </a>
            .
          </noscript>
          </div>
        </section>
        <div className="wrap">
          <About />
        </div>
      </main>
      <Footer />
      <RecordDialog record={activeRecord} onClose={closeRecord} showToast={toast.show} />
      <Toast message={toast.message} />
    </>
  )
}
