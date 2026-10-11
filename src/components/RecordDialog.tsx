import { useEffect, useRef, useState } from 'react'
import {
  cases,
  episodeBySlug,
  isCorrection,
  contextLabel,
  sourceName,
  type ArchiveCase,
} from '../lib/archive'

function EpisodeBrief({ slug }: { slug: string }) {
  const episode = episodeBySlug[slug]
  if (!episode) return null
  const records = cases.filter((c) => c.episode === slug)
  const pages = [...new Set(records.flatMap((r) => r.pages))].sort((a, b) => a - b)
  const pagesLabel = pages.length
    ? ` — ${pages.length > 1 ? 'páginas' : 'página'} ${pages.join(', ')} do documento original`
    : ''
  return (
    <div className="episode-brief">
      <p className="episode-brief-title">O caso: {episode.title}</p>
      <p>
        <strong>O que foi noticiado.</strong> {episode.what}
      </p>
      <p>
        <strong>A relação de Flávio.</strong> {episode.flavio}
      </p>
      <p>
        <strong>O que sustenta a informação.</strong> {records.length} registros deste acervo
        {pagesLabel}, com as reportagens de referência listadas abaixo.
      </p>
      <p>
        <strong>Resposta e situação.</strong> {episode.response}
      </p>
    </div>
  )
}

function SourceList({ links, date }: { links: string[]; date?: string }) {
  return (
    <ul className="source-list">
      {links.map((url, i) => {
        let u: URL | null = null
        try {
          u = new URL(url)
        } catch {
          return null
        }
        if (!u || !['http:', 'https:'].includes(u.protocol)) return null
        return (
          <li key={url}>
            <a href={url} target="_blank" rel="noopener noreferrer">
              <span>
                {sourceName(url)}
                <small>
                  Referência {i + 1} · {u.hostname}
                  {date ? ` · reportagem de ${date}` : ''}
                </small>
              </span>
              <span aria-hidden="true">↗</span>
            </a>
          </li>
        )
      })}
    </ul>
  )
}

export function RecordDialog({
  record,
  onClose,
  showToast,
}: {
  record: ArchiveCase | undefined
  onClose: () => void
  showToast: (message: string) => void
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const lastFocus = useRef<HTMLElement | null>(null)
  const [manualCopy, setManualCopy] = useState(false)
  const manualInput = useRef<HTMLInputElement>(null)

  const linkUrl = record
    ? `${window.location.origin}/registro/${record.id}`
    : ''

  const whatsappUrl = record
    ? `https://wa.me/?text=${encodeURIComponent(`${record.title} — ${linkUrl}`)}`
    : ''

  const shareNative = async () => {
    if (!record || !navigator.share) return
    try {
      await navigator.share({ title: record.title, text: record.title, url: linkUrl })
    } catch {
      // compartilhamento cancelado pelo usuário
    }
  }

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (record) {
      if (!dialog.open) {
        lastFocus.current = document.activeElement as HTMLElement | null
        dialog.showModal()
      }
      dialog.scrollTop = 0
      document.body.style.overflow = 'hidden'
    } else if (dialog.open) {
      dialog.close()
    }
  }, [record])

  useEffect(() => {
    if (manualCopy) manualInput.current?.select()
  }, [manualCopy])

  const handleClose = () => {
    document.body.style.overflow = ''
    if (lastFocus.current?.isConnected) lastFocus.current.focus({ preventScroll: true })
    onClose()
  }

  const onBackdrop = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target !== dialogRef.current) return
    const r = dialogRef.current.getBoundingClientRect()
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)
      onClose()
  }

  const copyLink = async () => {
    if (!record) return
    try {
      await navigator.clipboard.writeText(linkUrl)
      showToast('Link copiado. O acesso depende da permissão do site.')
    } catch {
      setManualCopy(true)
    }
  }

  return (
    <dialog
      id="record-dialog"
      aria-labelledby="dialog-title"
      ref={dialogRef}
      onClose={handleClose}
      onClick={onBackdrop}
    >
      <div className="dialog-bar">
        <span>Detalhes do registro</span>
        <button aria-label="Fechar registro" onClick={() => dialogRef.current?.close()}>
          ✕
        </button>
      </div>
      <div id="dialog-body">
        {record && (
          <>
            <div className="dialog-category">
              {record.category} · REGISTRO {record.number}
            </div>
            <h2 id="dialog-title">{record.title}</h2>
            {record.episode && <EpisodeBrief slug={record.episode} />}
            <p className="dialog-summary">{record.summary}</p>
            <div className={`context-box ${isCorrection(record.kind) ? 'correction' : ''}`}>
              <strong>{contextLabel(record.kind)}</strong>
              {record.note}
            </div>
            <h3 className="dialog-section">Fontes citadas pelo documento</h3>
            {record.links.length ? (
              <SourceList links={record.links} date={record.sourceDate} />
            ) : (
              <p className="dialog-caption">
                O documento não associa um link específico a esta afirmação. Consulte a página
                original.
              </p>
            )}
            {record.extraLinks.length > 0 && (
              <>
                <h3 className="dialog-section">Fontes de contexto acrescentadas</h3>
                <SourceList links={record.extraLinks} />
              </>
            )}
            <details className="original-details">
              <summary>
                Trecho do documento original <span aria-hidden="true">+</span>
              </summary>
              <blockquote className="original">{record.text}</blockquote>
              <p className="dialog-caption">
                Transcrição do PDF, {record.pages.length > 1 ? 'páginas' : 'página'}{' '}
                {record.pages.join(', ')}. Este trecho preserva a formulação do documento; leia a
                ressalva acima.
              </p>
            </details>
            <div className="dialog-actions">
              <a
                className="secondary share-whatsapp"
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Compartilhar no WhatsApp
              </a>
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button className="secondary" onClick={shareNative}>
                  Compartilhar…
                </button>
              )}
              <a
                className="secondary"
                href="/documento-original.pdf"
                download="eleicoes-2026-original.pdf"
              >
                Baixar PDF original ↓
              </a>
              {manualCopy ? (
                <label className="dialog-caption">
                  Selecione e copie o link:
                  <input
                    ref={manualInput}
                    readOnly
                    value={linkUrl}
                    style={{ width: '100%', padding: 12, fontSize: 16, marginTop: 8 }}
                  />
                </label>
              ) : (
                <button className="secondary" onClick={copyLink}>
                  Copiar link do registro ↗
                </button>
              )}
            </div>
            <p className="dialog-caption" style={{ marginTop: 20 }}>
              Edição de 10/10/2026 · A existência de um registro não comprova crime.
            </p>
          </>
        )}
      </div>
    </dialog>
  )
}
