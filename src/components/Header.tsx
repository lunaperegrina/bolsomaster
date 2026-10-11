export function Header() {
  return (
    <header className="header" id="inicio">
      <a className="brand" href="#inicio">
        a verdade<span className="brand-dot" aria-hidden="true">.</span>
      </a>
      <a className="pdf-link" href="/documento-original.pdf" download="eleicoes-2026-original.pdf">
        Baixar PDF ↓
      </a>
    </header>
  )
}
