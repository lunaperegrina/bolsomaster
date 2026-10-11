import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Header } from './Header'
import { Footer } from './Footer'
import { SearchBox, Toast, useToast } from './ui'
import {
  findExact,
  igCount,
  listaDate,
  postsCitados,
  processados,
  processadosCount,
  processadosDate,
  sourceAuthor,
  sourceUrl,
  tseAuthor,
  tseCase,
  tseDate,
  tseTotal,
  tseUrl,
  xCount,
  type ProcessadoItem,
} from '../lib/processados'
import { normalize } from '../lib/archive'

const PAGE_TITLE = 'Fui processado? · a verdade.'
const SITE_TITLE = 'a verdade. Eleições 2026'
const PAGE_SIZE = 60

export function ProcessadosPage() {
  const navigate = useNavigate({ from: '/processados' })
  const { q = '' } = useSearch({ from: '/processados' })
  const toast = useToast()
  const [limit, setLimit] = useState(PAGE_SIZE)

  const words = useMemo(
    () => normalize(q.trim().replace(/^@/, '')).split(/\s+/).filter(Boolean),
    [q],
  )

  const filtered = useMemo(() => {
    if (!words.length) return processados
    return processados.filter((p) => words.every((w) => p.searchText.includes(w)))
  }, [words])

  const shown = filtered.slice(0, limit)
  const exact = words.length ? findExact(q) : undefined
  const searching = q.trim().length >= 2

  const setQ = (value: string) =>
    navigate({ to: '/processados', search: (prev) => ({ ...prev, q: value || undefined }), replace: true })

  useEffect(() => {
    setLimit(PAGE_SIZE)
  }, [q])

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      toast.show('Link copiado.')
    } catch {
      toast.show('Não deu para copiar. Copie o link do navegador.')
    }
  }

  const share = async () => {
    const payload = {
      title: PAGE_TITLE,
      text: `${xCount} perfis do X listados como processados numa ação do Flávio Bolsonaro, e ${igCount} do Instagram citados no pedido dele ao TSE. Será que você está em alguma das listas?`,
      url: `${window.location.origin}/processados`,
    }
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

  useEffect(() => {
    document.title = PAGE_TITLE
    return () => {
      document.title = SITE_TITLE
    }
  }, [])

  return (
    <>
      <a className="skip" href="#processados">
        Ir para a consulta
      </a>
      <Header />
      <main className="processados">
        <section id="processados" className="proc-hero" aria-labelledby="proc-title">
          <h1 className="manchete" id="proc-title">
            Fui processado pelo <em>Flávio Bolsonaro</em>?
          </h1>
          <p className="proc-sub">
            {xCount} perfis do X constam como <strong>processados</strong> na ação do senador. Os{' '}
            {igCount} do Instagram só foram <strong>citados</strong> no pedido dele ao TSE, que quer{' '}
            <strong>suspender contas, não processar pessoas</strong>.{' '}
            <strong>Digite um @ e confira.</strong>
          </p>
          <div className="mat-hero-actions">
            <button className="btn primary" type="button" onClick={share}>
              Compartilhar a consulta
            </button>
          </div>
        </section>

        <div className="mat-toolbar proc-toolbar">
          <div className="search-panel">
            <SearchBox
              id="search"
              value={q}
              onChange={setQ}
              placeholder="Digite um @, um pedaço do nome… (ex.: joao)"
              srLabel="Buscar perfil processado por @ ou nome"
            />
          </div>
        </div>

        {searching && exact && (
          <div className="proc-verdict hit" role="status">
            <p className="proc-verdict-label">{exact.network === 'ig' ? 'Citado' : 'Sim'}</p>
            <p className="proc-verdict-text">
              {exact.network === 'ig' ? (
                <>
                  <strong>@{exact.handle}</strong> não foi processado, mas foi citado no pedido
                  ao TSE: perfil nº {exact.index}.{' '}
                </>
              ) : (
                <>
                  <strong>@{exact.handle}</strong> consta no documento da ação como processado:
                  perfil nº {exact.index}
                  {exact.citacoes > 1 ? ` com ${exact.citacoes} posts citados` : ''}.{' '}
                </>
              )}
              <a href={exact.url} target="_blank" rel="noopener noreferrer">
                Abrir {exact.network === 'ig' ? 'no Instagram' : 'no X'} ↗
              </a>
            </p>
          </div>
        )}
        {searching && !exact && filtered.length === 0 && (
          <div className="proc-verdict miss" role="status">
            <p className="proc-verdict-label">Não achamos</p>
            <p className="proc-verdict-text">
              Nenhum perfil parecido com <strong>“{q.trim()}”</strong> nas listas. Se quiser
              conferir nas fontes originais, veja o{' '}
              <a href={sourceUrl} target="_blank" rel="noopener noreferrer">
                documento no post de {sourceAuthor}
              </a>{' '}
              e o{' '}
              <a href={tseUrl} target="_blank" rel="noopener noreferrer">
                carrossel de {tseAuthor}
              </a>
              .
            </p>
          </div>
        )}

        <div className="results-meta">
          <p id="results-label" role="status" aria-live="polite">
            {filtered.length === processadosCount
              ? `${processadosCount} perfis na lista`
              : filtered.length === 1
                ? '1 perfil encontrado'
                : `${filtered.length} perfis encontrados`}
          </p>
          <button id="clear" hidden={!q} onClick={() => setQ('')}>
            Limpar busca
          </button>
        </div>

        {shown.length ? (
          <>
            <ol className="proc-list" aria-label="Perfis processados">
              {shown.map((p) => (
                <ProcRow key={p.handle} item={p} highlight={exact?.handle === p.handle} />
              ))}
            </ol>
            {filtered.length > limit && (
              <div className="pagination">
                <button className="btn ghost" type="button" onClick={() => setLimit((n) => n + PAGE_SIZE)}>
                  Mostrar mais{' '}
                  <span className="count">
                    ({Math.min(limit + PAGE_SIZE, filtered.length)} de {filtered.length})
                  </span>
                </button>
              </div>
            )}
          </>
        ) : (
          searching && (
            <div className="empty">
              <h3>Nada nas listas com “{q.trim()}”.</h3>
              <p>Nem parecido. As fontes são os documentos públicos das ações.</p>
            </div>
          )
        )}

        <noscript>
          Ative o JavaScript para usar a busca. Os {processadosCount} perfis das duas listas
          ({xCount} listados como processados no X, {igCount} citados no pedido ao TSE):
          <ul className="proc-noscript">
            {processados.map((p) => (
              <li key={p.handle}>
                <a href={p.url} target="_blank" rel="noopener noreferrer">
                  @{p.handle}
                </a>
              </li>
            ))}
          </ul>
        </noscript>

        <details className="about proc-about">
          <summary>
            Sobre esta consulta <span aria-hidden="true">+</span>
          </summary>
          <div className="about-content">
            <p>
              Esta consulta reúne duas listas públicas. A primeira: em {listaDate}, o advogado{' '}
              {sourceAuthor} publicou no X os prints de um documento judicial com{' '}
              {postsCitados} URLs de posts de {xCount} contas do X, alvo de ação movida pelo
              senador Flávio Bolsonaro. A segunda: em {tseDate}, o perfil {tseAuthor} publicou
              no Instagram a lista consolidada de {tseTotal} perfis citados na petição da
              campanha ao TSE ({tseCase}), que pede a suspensão de 32 contas até depois do
              segundo turno.
            </p>
            <p>
              As transcrições foram feitas por leitura óptica dos prints, conferidas conta por
              conta; ainda assim, podem conter erros de leitura. A fonte da verdade são o{' '}
              <a href={sourceUrl} target="_blank" rel="noopener noreferrer">
                post original de {sourceAuthor} no X
              </a>{' '}
              e o{' '}
              <a href={tseUrl} target="_blank" rel="noopener noreferrer">
                carrossel de {tseAuthor} no Instagram
              </a>
              . No caso do TSE, são pedidos da campanha, não decisões judiciais.
            </p>
            <p>
              Aparecer aqui descreve apenas uma citação em documento público; não diz nada
              sobre o mérito de qualquer ação.
            </p>
            <p>Última atualização: {processadosDate}.</p>
          </div>
        </details>
      </main>
      <Footer />
      <Toast message={toast.message} />
    </>
  )
}

function ProcRow({ item, highlight }: { item: ProcessadoItem; highlight: boolean }) {
  const [open, setOpen] = useState(false)
  const isIg = item.network === 'ig'
  return (
    <li className={`proc-item${isIg ? ' ig' : ''}`} data-handle={item.handle}>
      <div className={`proc-row${highlight ? ' highlight' : ''}`}>
        <span className="proc-num" aria-hidden="true">
          {String(item.index).padStart(3, '0')}
        </span>
        <a
          className="proc-handle"
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`@${item.handle}${highlight ? ', está na lista' : ''}, abrir ${isIg ? 'no Instagram' : 'no X'}`}
        >
          @{item.handle}
        </a>
        <span className="proc-sit">
          {isIg ? 'Citado · TSE' : `Listado na ação${item.citacoes > 1 ? ` · ${item.citacoes} posts` : ''}`}
        </span>
        <button
          className="proc-toggle"
          type="button"
          aria-expanded={open}
          aria-controls={`proc-det-${item.index}`}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Detalhes de @{item.handle}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true" style={{ transform: open ? 'rotate(180deg)' : undefined, transition: 'transform var(--hover) var(--ease)' }}>
            <path d="m4 8 8 8 8-8" />
          </svg>
        </button>
        {highlight && <span className="chip tint-warn proc-flag">na lista</span>}
      </div>
      {open && (
        <div className="proc-detail" id={`proc-det-${item.index}`}>
          {isIg ? (
            <>
              <p className="proc-situ">
                Situação: <strong>citado no pedido ao TSE</strong>, que pede suspensão de contas
                às plataformas. Não é réu em processo.
              </p>
              <p className="proc-note">
                A lista-fonte (carrossel de {tseAuthor}) enumera perfis, não posts: as postagens
                analisadas na petição não aparecem por perfil.{' '}
                <a href={tseUrl} target="_blank" rel="noopener noreferrer">
                  Ver o carrossel ↗
                </a>
              </p>
            </>
          ) : (
            <>
              <p className="proc-situ">
                Situação: <strong>processado no documento da ação</strong>, que cita{' '}
                {item.citacoes === 1 ? '1 post' : `${item.citacoes} posts`} deste perfil.
              </p>
              {item.postLinks.length > 0 && (
                <ul className="proc-posts">
                  {item.postLinks.map((l, i) => (
                    <li key={l.url}>
                      <a href={l.url} target="_blank" rel="noopener noreferrer" title={l.url}>
                        Post {i + 1} ↗
                      </a>
                      <span className="proc-date">{l.date}</span>
                    </li>
                  ))}
                </ul>
              )}
              {item.unreadable > 0 && (
                <p className="proc-note">
                  +{item.unreadable} {item.unreadable === 1 ? 'citação sem' : 'citações sem'}{' '}
                  link: o ID não ficou legível no print do documento.
                </p>
              )}
              <p className="proc-note">
                Os links são os posts citados no documento; alguns podem ter sido apagados desde
                então.
              </p>
            </>
          )}
        </div>
      )}
    </li>
  )
}
