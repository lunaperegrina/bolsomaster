import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router'
import { ArchivePage } from './components/ArchivePage'
import { MaterialsPage } from './components/MaterialsPage'
import { ProcessadosPage } from './components/ProcessadosPage'

interface ArchiveSearch {
  q?: string
  cat?: string
  registro?: string
}

interface MaterialsSearch {
  q?: string
  cat?: string
}

interface ProcessadosSearch {
  q?: string
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

const materialsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/materiais',
  validateSearch: (search: Record<string, unknown>): MaterialsSearch => ({
    q: str(search.q),
    cat: str(search.cat),
  }),
  component: MaterialsPage,
})

const processadosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/processados',
  validateSearch: (search: Record<string, unknown>): ProcessadosSearch => ({
    q: str(search.q),
  }),
  component: ProcessadosPage,
})

const recordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/registro/$id',
  component: RecordRoutePage,
})

function RecordRoutePage() {
  const { id } = recordRoute.useParams()
  return <ArchivePage recordIdFromPath={id} />
}

export const routeTree = rootRoute.addChildren([
  indexRoute,
  materialsRoute,
  processadosRoute,
  recordRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
