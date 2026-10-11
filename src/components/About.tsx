import { cases } from '../lib/archive'

export function About() {
  return (
    <details id="criterios" className="about">
      <summary>
        Sobre este acervo <span aria-hidden="true">+</span>
      </summary>
      <div className="about-content">
        <p>
          São <span id="total-count">{cases.length}</span> registros do PDF “Eleições 2026:
          Corrupção”, versão V2-10/10, com 14 páginas. A contagem inclui acusações, relatos e
          contexto; não representa um total de crimes ou processos.
        </p>
        <p>
          As referências não foram todas verificadas. Houve conferência pontual sobre Dark Horse, os
          e-mails envolvendo Willer Tomaz, o contrato ligado à “Turma do KN” e o arquivamento
          relativo a Alfredo Gaspar. Correções e respostas encontradas aparecem nos registros.
          Investigação, reportagem e vínculos pessoais não comprovam culpa.
        </p>
        <p>
          O texto original e seus links foram preservados. Fontes acrescentadas são identificadas
          separadamente. Consulta editorial: 10/10/2026.
        </p>
        <a href="/documento-original.pdf" download="eleicoes-2026-original.pdf">
          Baixar o PDF original ↓
        </a>
      </div>
    </details>
  )
}
