import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import {
  categoryByKey,
  hostLabel,
  typeMeta,
  type MaterialType,
  type MaterialItem,
} from '../lib/materials'

// Ícones por tipo de material: traço fino, 16px, na cor do texto secundário.
const typeIcons: Record<MaterialType, ReactNode> = {
  site: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </svg>
  ),
  jogo: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="2.5" y="7" width="19" height="10" rx="5" />
      <path d="M7 12h3M8.5 10.5v3" />
      <circle cx="15.5" cy="10.8" r="0.4" />
      <circle cx="18" cy="13" r="0.4" />
    </svg>
  ),
  drive: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
  ),
  pdf: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M6 2h8l4 4v16H6z" />
      <path d="M14 2v4h4M9.5 12h5M9.5 16h5" />
    </svg>
  ),
  mapa: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 21s-6-5.2-6-10a6 6 0 1 1 12 0c0 4.8-6 10-6 10Z" />
      <circle cx="12" cy="11" r="2.2" />
    </svg>
  ),
  tweet: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M4 4l16 16M20 4L4 20" />
    </svg>
  ),
  interno: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5z" />
      <path d="M20 17v5H6.5a2.5 2.5 0 0 1 0-5" />
    </svg>
  ),
}

export function MaterialCard({
  item,
  onShare,
  rank,
}: {
  item: MaterialItem
  onShare: (item: MaterialItem) => void
  rank?: number
}) {
  const meta = typeMeta[item.type]
  const internal = item.type === 'interno'
  const category = categoryByKey(item.category)

  return (
    <article className="mat-card card">
      <div className="mat-cover">
        <img
          src={item.image}
          alt={`Colagem em estilo zine sobre: ${item.title}`}
          width="640"
          height="427"
          loading="lazy"
          decoding="async"
        />
        {rank !== undefined && (
          <span className="mat-rank num" aria-label={`Passo ${rank}`}>
            {rank}
          </span>
        )}
        <span className="chip mat-cover-chip">
          <i style={{ background: category?.dot }} aria-hidden="true" />
          {category?.label ?? item.category}
        </span>
      </div>
      <div className="mat-meta">
        <span className="mat-type">
          {typeIcons[item.type]}
          {meta.label}
        </span>
      </div>
      <h3 className="mat-title">
        {internal ? (
          <Link to="/">{item.title}</Link>
        ) : (
          <a href={item.url} target="_blank" rel="noopener noreferrer">
            {item.title}
          </a>
        )}
      </h3>
      <p className="mat-desc">{item.description}</p>
      {item.note && <p className="mat-note">{item.note}</p>}
      <div className="mat-actions">
        {internal ? (
          <Link className="btn" to="/">
            Ver acervo <span aria-hidden="true">→</span>
          </Link>
        ) : (
          <a className="btn" href={item.url} target="_blank" rel="noopener noreferrer">
            Abrir <span aria-hidden="true">↗</span>
          </a>
        )}
        <button
          className="btn ghost"
          type="button"
          onClick={() => onShare(item)}
          aria-label={`Compartilhar: ${item.title}`}
        >
          Compartilhar
        </button>
      </div>
      {!internal && <p className="mat-host">{hostLabel(item.url)}</p>}
    </article>
  )
}
