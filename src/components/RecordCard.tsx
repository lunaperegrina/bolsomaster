import { sourceName, badgeClass, isCorrection, type ArchiveCase } from '../lib/archive'

export function RecordCard({
  record,
  onOpen,
}: {
  record: ArchiveCase
  onOpen: (id: string) => void
}) {
  const source = record.links.find((url) => /^https?:\/\//.test(url))

  return (
    <article className="record">
      <div className="record-meta">
        <span className={`status ${badgeClass(record.kind)}`}>{record.kind}</span>
        <span className="record-category">{record.category}</span>
      </div>
      <h3>
        <button onClick={() => onOpen(record.id)}>{record.title}</button>
      </h3>
      <p className="record-summary">{record.summary}</p>
      {isCorrection(record.kind) && <p className="record-correction">{record.note}</p>}
      <div className="record-bottom">
        {source && (
          <a
            className="direct-source"
            href={source}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Abrir fonte: ${sourceName(source)}`}
          >
            {sourceName(source)} ↗
          </a>
        )}
        <button
          className="read-button"
          onClick={() => onOpen(record.id)}
          aria-label={`Ver detalhes e fontes: ${record.title}`}
        >
          {source ? 'Ver detalhes' : 'Ver registro'} →
        </button>
      </div>
    </article>
  )
}
