import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearch, Link } from '@tanstack/react-router'
import { cases, episodes, filterButtons, normalize, sourceCount, editionDate, type ArchiveCase, type Episode } from '../lib/archive'
import { Header } from './Header'
import { Footer } from './Footer'
import { About } from './About'
import { Highlights } from './Highlights'
import { RecordCard } from './RecordCard'
import { RecordDialog } from './RecordDialog'
import { SearchBox, Toast, useToast } from './ui'

const PAGE_SIZE = 12

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
  const resultsRef = useRef<HTMLDivElement>(null)
  const limitFocused = useRef(true)

  const filtered = useMemo(() => {
    const words = normalize(q.trim())
      .split(/\s+/)
      .filter(Boolean)
    return cases.filter(
      (c) => (!cat || c.category === cat) && words.every((w) => c.searchText.includes(w)),
    )
  }, [q, cat])

  const shown = filtered.slice(0, limit)

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

  const setCategory = (value: string) => {
    navigate({ to: '/', search: (prev) => ({ ...prev, cat: value || undefined }) })
    document.getElementById('acervo')?.scrollIntoView({
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    })
  }

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

  const loadMore = () => setLimit((n) => n + PAGE_SIZE)

  // Reinicia a paginação quando a busca ou o filtro muda.
  useEffect(() => {
    setLimit(PAGE_SIZE)
  }, [q, cat])

  // Mantém o foco acessível no primeiro registro novo após "Mostrar mais".
  useEffect(() => {
    if (limitFocused.current) {
      limitFocused.current = false
      return
    }
    const before = Math.min(limit - PAGE_SIZE, filtered.length)
    const target = shown[before]
    if (!target) return
    const button = resultsRef.current?.querySelector(
      `[data-record-id="${target.id}"] h3 button`,
    ) as HTMLButtonElement | null
    button?.focus({ preventScroll: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit])

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
      <main>
        <section id="acervo" className="archive" aria-labelledby="archive-title">
          <div className="hero">
            <div className="hero-main">
              <p className="hero-kick">
                <span>Eleições 2026</span>
                <span className="sep" aria-hidden="true">·</span>
                <span>Dossiê V2-10/10</span>
                <span className="sep" aria-hidden="true">·</span>
                <span>Acervo</span>
              </p>
              <h1 className="manchete" id="archive-title">
                Acusações contra Flávio Bolsonaro.
              </h1>
              <p className="hero-status">
                <b className="num">{cases.length}</b> registros ·{' '}
                <b className="num">{sourceCount}</b> fontes citadas · consulta editorial de{' '}
                {editionDate}
              </p>
            </div>
            <figure className="hero-card">
              <img
                src="/flavio-320.jpg"
                srcSet="/flavio-320.jpg 320w, /flavio-640.jpg 640w"
                sizes="(max-width: 739px) 96px, 216px"
                width="320"
                height="445"
                alt="Retrato de Flávio Bolsonaro em sessão do Senado Federal"
                decoding="async"
              />
              <figcaption>
                Foto: Carlos Moura/Agência Senado ·{' '}
                <a
                  href="https://creativecommons.org/licenses/by-sa/4.0"
                  target="_blank"
                  rel="license noopener noreferrer"
                >
                  CC BY-SA 4.0
                </a>
              </figcaption>
              <div className="hero-stats">
                <div className="hero-stat">
                  <span className="fig num">{cases.length}</span>
                  <span>registros do dossiê</span>
                </div>
                <div className="hero-stat">
                  <span className="fig num">{sourceCount}</span>
                  <span>fontes citadas</span>
                </div>
              </div>
            </figure>
          </div>
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
          <div id="results" className="results" ref={resultsRef}>
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
          <div className="pagination">
            <button className="btn ghost" id="load-more" hidden={filtered.length <= limit} onClick={loadMore}>
              Mostrar mais <span aria-hidden="true">↓</span>
            </button>
            <p id="page-info">
              {filtered.length ? `${shown.length} de ${filtered.length} registros` : ''}
            </p>
          </div>
          <noscript>
            Ative o JavaScript para usar a busca ou{' '}
            <a href="/documento-original.pdf" download="eleicoes-2026-original.pdf">
              baixe o PDF original
            </a>
            .
          </noscript>
        </section>
        <About />
      </main>
      <Footer />
      <RecordDialog record={activeRecord} onClose={closeRecord} showToast={toast.show} />
      <Toast message={toast.message} />
    </>
  )
}
