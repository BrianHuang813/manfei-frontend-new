import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import { SiteSettingsProvider } from './contexts/SiteSettingsContext.jsx'
import './index.css'

// Create QueryClient for data fetching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
    <BrowserRouter>
      <ScrollToTop />
      <QueryClientProvider client={queryClient}>
        <SiteSettingsProvider>
          <App />
        </SiteSettingsProvider>
      </QueryClientProvider>
    </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>,
)
