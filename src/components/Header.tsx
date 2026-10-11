import { useEffect, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'

const PDF_HREF = '/documento-original.pdf'
const PDF_DOWNLOAD = 'eleicoes-2026-original.pdf'

export function Header() {
  const [open, setOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const onPointerDown = (e: PointerEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open])

  const close = () => setOpen(false)

  return (
    <header className="header" id="inicio" ref={headerRef}>
      <div className="header-inner">
        <div className="header-left">
          <Link className="brand" to="/">
            a verdade<span className="brand-dot" aria-hidden="true">.</span>
          </Link>
          <nav className="site-nav" aria-label="Seções do site">
            <Link to="/" activeOptions={{ exact: true }} activeProps={{ className: 'active' }}>
              Acervo
            </Link>
            <Link to="/materiais" activeProps={{ className: 'active' }}>
              Materiais
            </Link>
            <Link to="/processados" activeProps={{ className: 'active' }}>
              Processados
            </Link>
          </nav>
        </div>
        <div className="header-actions">
          <a
            className="btn pdf-link"
            href={PDF_HREF}
            download={PDF_DOWNLOAD}
            aria-label="Baixar PDF do documento original"
          >
            <span className="pdf-label">Baixar PDF</span> <span aria-hidden="true">↓</span>
          </a>
          <button
            type="button"
            className="nav-toggle"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Fechar menu de seções' : 'Abrir menu de seções'}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="nav-toggle-bar" aria-hidden="true" />
            <span className="nav-toggle-bar" aria-hidden="true" />
            <span className="nav-toggle-bar" aria-hidden="true" />
          </button>
        </div>
      </div>
      {open && (
        <nav className="mobile-nav" id="mobile-nav" aria-label="Seções do site">
          <Link to="/" activeOptions={{ exact: true }} activeProps={{ className: 'active' }} onClick={close}>
            Acervo
          </Link>
          <Link to="/materiais" activeProps={{ className: 'active' }} onClick={close}>
            Materiais
          </Link>
          <Link to="/processados" activeProps={{ className: 'active' }} onClick={close}>
            Processados
          </Link>
          <a className="btn mobile-pdf" href={PDF_HREF} download={PDF_DOWNLOAD} onClick={close}>
            Baixar PDF <span aria-hidden="true">↓</span>
          </a>
        </nav>
      )}
    </header>
  )
}
