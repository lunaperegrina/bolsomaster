import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router'
import { ArchivePage } from './components/ArchivePage'

interface ArchiveSearch {
  q?: string
  cat?: string
  registro?: string
}

function RootLayout() {
  return <Outlet />
}

const str = (v: unknown) => (typeof v === 'string' ? v : undefined)

const rootRoute = createRootRoute({
  component: RootLayout,
  validateSearch: (search: Record<string, unknown>): ArchiveSearch => ({
    q: str(search.q),
    cat: str(search.cat),
    registro: str(search.registro),
  }),
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: ArchivePage,
})

export const routeTree = rootRoute.addChildren([indexRoute])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
