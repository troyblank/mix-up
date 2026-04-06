import type { FunctionComponent } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'styled-components'
import { theme } from './theme'
import { GlobalStyles } from './GlobalStyles'
import { AuthProvider } from './contexts'
import { Router } from './Router'
import { AppWrapper } from './App.styles'

const queryClient = new QueryClient()

export const App: FunctionComponent = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        <AuthProvider>
          <AppWrapper>
            <Router />
          </AppWrapper>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
