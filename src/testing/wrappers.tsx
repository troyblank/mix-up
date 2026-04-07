import type { ReactNode } from 'react'
import { MemoryRouter, type InitialEntry } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'styled-components'
import { AuthProvider } from '../contexts'
import { theme } from '../theme'

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
}

export function createWrappersWithoutRouter() {
  const queryClient = createQueryClient()
  return function Wrappers({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </QueryClientProvider>
    )
  }
}

export function createAuthWrappersWithoutRouter() {
  const queryClient = createQueryClient()
  return function AuthWrappers({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    )
  }
}

// Auth in certain situations causes act issues.
export function createAllWrappersWithoutAuth(options?: {
  initialEntries?: InitialEntry[]
}) {
  const { initialEntries } = options ?? {}
  const queryClient = createQueryClient()
  return function AllWrappersWithoutAuth({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
        </ThemeProvider>
      </QueryClientProvider>
    )
  }
}

export function createAllWrappers(options?: { initialEntries?: InitialEntry[] }) {
  const { initialEntries } = options ?? {}
  const queryClient = createQueryClient()
  return function AllWrappers({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <AuthProvider>
            <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    )
  }
}
