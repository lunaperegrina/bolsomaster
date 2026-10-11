import highlights from '../data/highlights.json'

export function Highlights({ onOpen }: { onOpen: (id: string) => void }) {
  return (
    <section className="highlights" aria-labelledby="highlights-title">
      <div className="card">
        <div className="hd">
          <h2 id="highlights-title">Entenda os principais casos</h2>
          <span className="aside">2 min</span>
        </div>
        <ol className="highlight-list">
          {highlights.items.map((item, i) => (
            <li key={item.registroId} className="highlight">
              <span className="highlight-index" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
              </div>
              <button type="button" className="quiet-link" onClick={() => onOpen(item.registroId)}>
                Ver fontes <span aria-hidden="true">→</span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
