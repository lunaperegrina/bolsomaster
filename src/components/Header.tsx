import { useState } from 'react'
import { Link } from '@tanstack/react-router'

function setTheme(theme: 'dark' | 'light') {
  document.documentElement.dataset.theme = theme
  localStorage.setItem('av-theme', theme)
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', theme === 'light' ? '#F7F6F2' : '#0F0E0D')
}

function ThemeToggle() {
  const [theme, setThemeState] = useState<'dark' | 'light'>(() =>
    document.documentElement.dataset.theme === 'light' ? 'light' : 'dark',
  )
  const next = theme === 'dark' ? 'light' : 'dark'
  const label = theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'

  return (
    <button
      type="button"
      className="icon-btn"
      onClick={() => {
        setTheme(next)
        setThemeState(next)
      }}
      aria-label={label}
      title={label}
    >
      {theme === 'dark' ? (
        // sol
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <circle cx="12" cy="12" r="4.2" />
          <path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M18.5 5.5l-1.7 1.7M7.2 16.8l-1.7 1.7" />
        </svg>
      ) : (
        // lua
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M20.2 14.2A8.2 8.2 0 0 1 9.8 3.8a8.5 8.5 0 1 0 10.4 10.4Z" />
        </svg>
      )}
    </button>
  )
}

export function Header() {
  return (
    <header className="header" id="inicio">
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
          </nav>
        </div>
        <div className="header-actions">
          <ThemeToggle />
          <a className="btn pdf-link" href="/documento-original.pdf" download="eleicoes-2026-original.pdf">
            <span>Baixar PDF</span> <span aria-hidden="true">↓</span>
          </a>
        </div>
      </div>
    </header>
  )
}
