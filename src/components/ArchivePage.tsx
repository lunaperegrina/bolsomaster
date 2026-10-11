import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { cases, filterButtons, normalize } from '../lib/archive'
import { Header } from './Header'
import { Footer } from './Footer'
import { About } from './About'
import { RecordCard } from './RecordCard'
import { RecordDialog } from './RecordDialog'

const PAGE_SIZE = 12

export function ArchivePage() {
  const navigate = useNavigate({ from: '/' })
  const { q = '', cat = '', registro = '' } = useSearch({ from: '/' })

  const [limit, setLimit] = useState(PAGE_SIZE)
  const [toastMessage, setToastMessage] = useState('')
  const toastTimer = useRef<number>(undefined)
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

  const openRecord = (id: string) =>
    navigate({ to: '/', search: (prev) => ({ ...prev, registro: id }) })

  const closeRecord = () =>
    navigate({ to: '/', search: (prev) => ({ ...prev, registro: undefined }), replace: true })

  const loadMore = () => setLimit((n) => n + PAGE_SIZE)

  const showToast = (message: string) => {
    setToastMessage(message)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToastMessage(''), 4000)
  }

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
    const next = resultsRef.current?.querySelectorAll('.record')[before]
    const button = next?.querySelector('h3 button') as HTMLButtonElement | null
    button?.focus({ preventScroll: true })
  }, [limit])

  // Atalho "/" para focar a busca.
  useEffect(() => {
    const onKeydown = (e: KeyboardEvent) => {
      const tag = (document.activeElement as HTMLElement | null)?.tagName ?? ''
      const dialogOpen = (document.getElementById('record-dialog') as HTMLDialogElement | null)?.open
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) && !dialogOpen) {
        e.preventDefault()
        document.getElementById('search')?.focus()
        document.getElementById('acervo')?.scrollIntoView()
      }
    }
    document.addEventListener('keydown', onKeydown)
    return () => document.removeEventListener('keydown', onKeydown)
  }, [])

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

  const activeRecord = cases.find((c) => c.id === registro)

  return (
    <>
      <a className="skip" href="#acervo">
        Ir para os registros
      </a>
      <Header />
      <main>
        <section id="acervo" className="archive" aria-labelledby="archive-title">
          <div className="intro">
            <p className="eyebrow">ELEIÇÕES 2026</p>
            <h1 id="archive-title">Acusações contra Flávio Bolsonaro.</h1>
          </div>
          <div className="search-panel">
            <label className="search-box">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <circle cx="10.5" cy="10.5" r="6.5" />
                <path d="m16 16 5 5" />
              </svg>
              <span className="sr-only">Buscar nome ou assunto</span>
              <input
                id="search"
                type="search"
                placeholder="Buscar nome ou assunto"
                autoComplete="off"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <kbd aria-hidden="true">/</kbd>
            </label>
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
              shown.map((c) => <RecordCard key={c.id} record={c} onOpen={openRecord} />)
            ) : (
              <div className="empty">
                <h3>Nenhum registro encontrado.</h3>
                <p>Tente outro nome ou assunto.</p>
              </div>
            )}
          </div>
          <div className="pagination">
            <button className="secondary" id="load-more" hidden={filtered.length <= limit} onClick={loadMore}>
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
      <RecordDialog record={activeRecord} onClose={closeRecord} showToast={showToast} />
      <div id="toast" role="status" aria-live="polite" className={toastMessage ? 'show' : undefined}>
        {toastMessage}
      </div>
    </>
  )
}
