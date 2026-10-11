import { Link } from '@tanstack/react-router'
import {
  categoryLabel,
  hostLabel,
  typeMeta,
  type MaterialItem,
} from '../lib/materials'

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

  return (
    <article className={`mat-card cat-${item.category}`}>
      <div className="mat-top">
        <span className="mat-icon" aria-hidden="true">
          {meta.icon}
        </span>
        {rank !== undefined && (
          <span className="mat-rank" aria-label={`Passo ${rank}`}>
            {rank}
          </span>
        )}
      </div>
      <div className="mat-meta">
        <span className="mat-badge">{categoryLabel(item.category)}</span>
        <span className="mat-type">{meta.label}</span>
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
          <Link className="mat-open" to="/">
            Ver acervo <span aria-hidden="true">→</span>
          </Link>
        ) : (
          <a className="mat-open" href={item.url} target="_blank" rel="noopener noreferrer">
            Abrir <span aria-hidden="true">↗</span>
          </a>
        )}
        <button
          className="mat-share"
          type="button"
          onClick={() => onShare(item)}
          aria-label={`Compartilhar: ${item.title}`}
        >
          Compartilhar <span aria-hidden="true">📤</span>
        </button>
      </div>
      {!internal && <p className="mat-host">{hostLabel(item.url)}</p>}
    </article>
  )
}
