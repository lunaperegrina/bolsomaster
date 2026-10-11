import { useEffect, useRef, useState, type RefObject } from 'react'

// Atalho "/" foca a busca quando o foco não está em campo de texto nem em
// dialog aberto. Compartilhado pelas duas páginas com busca.
export function useSlashFocus(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const onKeydown = (e: KeyboardEvent) => {
      if (e.key !== '/') return
      const tag = (document.activeElement as HTMLElement | null)?.tagName ?? ''
      const dialogOpen = document.querySelector('dialog[open]') !== null
      if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) && !dialogOpen) {
        e.preventDefault()
        ref.current?.focus()
      }
    }
    document.addEventListener('keydown', onKeydown)
    return () => document.removeEventListener('keydown', onKeydown)
  }, [ref])
}

export function SearchBox({
  id,
  value,
  onChange,
  placeholder,
  srLabel,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  srLabel: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  useSlashFocus(inputRef)

  return (
    <label className="search-box" htmlFor={id}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 5 5" />
      </svg>
      <span className="sr-only">{srLabel}</span>
      <input
        ref={inputRef}
        id={id}
        type="search"
        placeholder={placeholder}
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <kbd aria-hidden="true">/</kbd>
    </label>
  )
}

export function useToast() {
  const [message, setMessage] = useState('')
  const timer = useRef<number>(undefined)

  const show = (msg: string) => {
    setMessage(msg)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setMessage(''), 4000)
  }

  useEffect(() => () => window.clearTimeout(timer.current), [])

  return { message, show }
}

export function Toast({ message }: { message: string }) {
  return (
    <div id="toast" role="status" aria-live="polite" className={message ? 'show' : undefined}>
      {message}
    </div>
  )
}
