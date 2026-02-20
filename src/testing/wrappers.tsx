import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'styled-components'
import { theme } from '../theme'

export function createAllWrappers() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
  return function AllWrappers({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </QueryClientProvider>
    )
  }
}
