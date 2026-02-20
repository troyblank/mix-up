import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'styled-components'
import { theme } from './theme'
import { GlobalStyles } from './GlobalStyles'
import { HomeScreen } from './components/HomeScreen'
import { AppWrapper } from './App.styles'

const queryClient = new QueryClient()

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        <AppWrapper>
          <HomeScreen />
        </AppWrapper>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
