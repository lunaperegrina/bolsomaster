import highlights from '../data/highlights.json'

export function Highlights({ onOpen }: { onOpen: (id: string) => void }) {
  return (
    <section className="highlights" aria-labelledby="highlights-title">
      <h2 id="highlights-title">Entenda os principais casos em 2 minutos</h2>
      <ol className="highlight-list">
        {highlights.items.map((item, i) => (
          <li key={item.registroId} className="highlight">
            <h3>
              <span className="highlight-index" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              {item.title}
            </h3>
            <p>{item.summary}</p>
            <button type="button" className="highlight-source" onClick={() => onOpen(item.registroId)}>
              Ver fontes <span aria-hidden="true">→</span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  )
}
