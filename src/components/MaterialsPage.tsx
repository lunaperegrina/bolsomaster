import { useEffect, useMemo } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Header } from './Header'
import { Footer } from './Footer'
import { MaterialCard } from './MaterialCard'
import { SearchBox, Toast, useToast } from './ui'
import {
  categories,
  countByCategory,
  featuredMaterials,
  masterlistAuthor,
  masterlistUrl,
  materials,
  materialsDate,
  sharePayload,
  type MaterialItem,
} from '../lib/materials'
import { normalize } from '../lib/archive'

const PAGE_TITLE = 'Central de Materiais · a verdade.'
const SITE_TITLE = 'a verdade. Eleições 2026'

export function MaterialsPage() {
  const navigate = useNavigate({ from: '/materiais' })
  const { q = '', cat = '' } = useSearch({ from: '/materiais' })
  const toast = useToast()

  const filtered = useMemo(() => {
    const words = normalize(q.trim())
      .split(/\s+/)
      .filter(Boolean)
    return materials.filter(
      (m) => (!cat || m.category === cat) && words.every((w) => m.searchText.includes(w)),
    )
  }, [q, cat])

  const sections = useMemo(
    () =>
      categories
        .map((c) => ({ ...c, items: filtered.filter((m) => m.category === c.key) }))
        .filter((s) => s.items.length > 0),
    [filtered],
  )

  const setQ = (value: string) =>
    navigate({ to: '/materiais', search: (prev) => ({ ...prev, q: value || undefined }), replace: true })

  const setCategory = (value: string) =>
    navigate({ to: '/materiais', search: (prev) => ({ ...prev, cat: value || undefined }) })

  const clearFilters = () => {
    navigate({ to: '/materiais', search: (prev) => ({ ...prev, q: undefined, cat: undefined }) })
    document.getElementById('search')?.focus()
  }

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      toast.show('Link copiado.')
    } catch {
      toast.show('Não deu para copiar. Abra o material e copie o link do navegador.')
    }
  }

  // Compartilha nativo (mobile); se o usuário cancelar, silencia; em outros erros
  // (ou sem suporte, como na maioria dos desktops) cai para copiar o link.
  const share = async (payload: { title: string; text: string; url: string }) => {
    if (navigator.share) {
      try {
        await navigator.share(payload)
        return
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
      }
    }
    await copyUrl(payload.url)
  }

  const shareItem = (item: MaterialItem) => share(sharePayload(item))

  const shareCentral = () =>
    share({
      title: PAGE_TITLE,
      text: 'Cards, jogos, arte de rua e documentos pra virar voto, tudo num lugar só:',
      url: `${window.location.origin}/materiais`,
    })

  // Título da aba por rota; volta ao padrão do site ao sair.
  useEffect(() => {
    document.title = PAGE_TITLE
    return () => {
      document.title = SITE_TITLE
    }
  }, [])

  const browsing = !q && !cat

  return (
    <>
      <a className="skip" href="#materiais">
        Ir para os materiais
      </a>
      <Header />
      <main className="materials">
        <section id="materiais" className="mat-hero" aria-labelledby="mat-title">
          <div className="mat-hero-copy">
            <h1 className="manchete" id="mat-title">
              Tudo pra <em>virar voto</em>.
            </h1>
            <p className="mat-sub">
              Cards, jogos, arte de rua e documentos pra compartilhar, jogar, imprimir e debater.
              Num lugar só.
            </p>
            <div className="mat-hero-actions">
              <span className="chip">
                <i aria-hidden="true" />
                {materials.length} materiais
              </span>
              <button className="btn primary" type="button" onClick={shareCentral}>
                Compartilhar esta central
              </button>
            </div>
          </div>
          <div className="mat-collage" aria-hidden="true">
            <span className="mat-torn" />
            <div className="mat-frame dots">
              <img
                src="/flavio-640.jpg"
                alt=""
                width="640"
                height="445"
                loading="lazy"
                decoding="async"
              />
            </div>
            <span className="mat-tape tape-a" />
            <span className="mat-tape tape-b" />
            <div className="mat-strip">
              <img src="/img/materiais/superflavio.webp" alt="" loading="lazy" decoding="async" />
              <img src="/img/materiais/pontos-de-coleta.webp" alt="" loading="lazy" decoding="async" />
            </div>
          </div>
        </section>

        <div className="mat-toolbar">
          <div className="search-panel">
            <SearchBox
              id="search"
              value={q}
              onChange={setQ}
              placeholder="Buscar material (ex.: jogo, status, lambe)"
              srLabel="Buscar material por nome ou categoria"
            />
          </div>
          <div className="filters mat-filters" role="group" aria-label="Filtrar por categoria">
            <button type="button" aria-pressed={!cat} onClick={() => setCategory('')}>
              Todos <span className="count">({materials.length})</span>
            </button>
            {categories.map((c) => (
              <button
                key={c.key}
                type="button"
                aria-pressed={c.key === cat}
                onClick={() => setCategory(c.key === cat ? '' : c.key)}
              >
                <i style={{ background: c.key === cat ? c.dot : undefined }} aria-hidden="true" />
                {c.label} <span className="count">({countByCategory(c.key)})</span>
              </button>
            ))}
          </div>
        </div>

        <div className="results-meta">
          <p id="results-label" role="status" aria-live="polite">
            {filtered.length} {filtered.length === 1 ? 'material' : 'materiais'}
          </p>
          <button id="clear" hidden={!cat && !q} onClick={clearFilters}>
            Limpar filtros
          </button>
        </div>

        {browsing && (
          <section className="mat-start" aria-labelledby="mat-start-title">
            <h2 id="mat-start-title">Por onde começar</h2>
            <ol className="mat-start-grid">
              {featuredMaterials.map((item, i) => (
                <li key={item.id}>
                  <MaterialCard item={item} onShare={shareItem} rank={i + 1} layout="row" />
                </li>
              ))}
            </ol>
          </section>
        )}

        {sections.length ? (
          sections.map((s) => (
            <section key={s.key} className="mat-section" aria-labelledby={`sec-${s.key}`}>
              <h2 id={`sec-${s.key}`}>
                <span className="dot" style={{ background: s.dot }} aria-hidden="true" />
                {s.label} <span className="mat-sec-count">({s.items.length})</span>
              </h2>
              <div className="mat-grid">
                {s.items.map((item) => (
                  <MaterialCard key={item.id} item={item} onShare={shareItem} />
                ))}
              </div>
            </section>
          ))
        ) : (
          <div className="empty">
            <h3>Nenhum material encontrado.</h3>
            <p>Tente outra palavra ou categoria.</p>
          </div>
        )}

        <noscript>
          Ative o JavaScript para usar a busca. Os materiais:
          <ul className="mat-noscript">
            {materials
              .filter((m) => m.type !== 'interno')
              .map((m) => (
                <li key={m.id}>
                  <a href={m.url} target="_blank" rel="noopener noreferrer">
                    {m.title}
                  </a>
                </li>
              ))}
            <li>
              <a href="/">Acervo deste site</a>
            </li>
          </ul>
        </noscript>

        <details className="about mat-about">
          <summary>
            Sobre esta central <span aria-hidden="true">+</span>
          </summary>
          <div className="about-content">
            <p>
              Reúne {materials.length} materiais de campanha organizados por intenção: compartilhar,
              jogar, imprimir e debater. A seleção partiu da masterlist publicada por{' '}
              <a href={masterlistUrl} target="_blank" rel="noopener noreferrer">
                {masterlistAuthor}
              </a>{' '}
              em 7 de outubro de 2026.
            </p>
            <p>
              Os links levam a sites, drives e jogos mantidos por terceiros; este acervo não
              verifica nem edita esses conteúdos. Se um link quebrar, procure o material oficial
              da campanha.
            </p>
            <p>Última atualização: {materialsDate}.</p>
          </div>
        </details>
      </main>
      <Footer />
      <Toast message={toast.message} />
    </>
  )
}
