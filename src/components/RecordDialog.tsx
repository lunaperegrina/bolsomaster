import { useEffect, useRef, useState } from 'react'
import { isCorrection, contextLabel, sourceName, type ArchiveCase } from '../lib/archive'

function SourceList({ links }: { links: string[] }) {
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
    ? `${window.location.origin}${window.location.pathname}?registro=${record.id}`
    : ''

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
            <p className="dialog-summary">{record.summary}</p>
            <div className={`context-box ${isCorrection(record.kind) ? 'correction' : ''}`}>
              <strong>{contextLabel(record.kind)}</strong>
              {record.note}
            </div>
            <h3 className="dialog-section">Referências do PDF</h3>
            {record.links.length ? (
              <SourceList links={record.links} />
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
