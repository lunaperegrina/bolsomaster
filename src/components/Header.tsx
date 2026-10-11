import { Link } from '@tanstack/react-router'

export function Header() {
  return (
    <header className="header" id="inicio">
      <div className="header-left">
        <Link className="brand" to="/">
          a verdade<span className="brand-dot" aria-hidden="true">.</span>
        </Link>
        <nav className="site-nav" aria-label="Seções do site">
          <Link to="/">Acervo</Link>
          <Link to="/materiais">Materiais</Link>
        </nav>
      </div>
      <a className="pdf-link" href="/documento-original.pdf" download="eleicoes-2026-original.pdf">
        Baixar PDF ↓
      </a>
    </header>
  )
}
