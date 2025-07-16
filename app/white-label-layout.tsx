'use client'

import React, {createContext, useContext, useEffect, useState} from 'react'
import {ThemeProvider, createTheme} from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { buildThemeFromConfig, parseThemeConfigFromAPI, ThemeConfig } from '../utils/theme-builder'

// Create a context for the API key
interface WhiteLabelContextType {
  apiKey: string | null
  isLoading: boolean
  error: string | null
  companyName: string
  companyLogo: string
  companyColor: string
  themeConfig: ThemeConfig
}

const defaultThemeConfig: ThemeConfig = {
  primaryColor: '#D36784',
  secondaryColor: '#dc004e',
  backgroundColor: '#ffffff',
  paperColor: '#ffffff',
  textPrimary: '#000000',
  textSecondary: '#666666',
  errorColor: '#d32f2f',
  warningColor: '#ed6c02',
  infoColor: '#0288d1',
  successColor: '#2e7d32',
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  fontSizeSmall: '0.875rem',
  fontSizeMedium: '1rem',
  fontSizeLarge: '1.25rem',
  borderRadius: '4px',
  spacingUnit: 8,
}

const WhiteLabelContext = createContext<WhiteLabelContextType>({
  apiKey: null,
  isLoading: true,
  error: null,
  companyName: 'Route Planner',
  companyLogo: '/company_logo.svg',
  companyColor: '#D36784',
  themeConfig: defaultThemeConfig,
})

export function useWhiteLabelContext() {
  return useContext(WhiteLabelContext)
}

interface WhiteLabelLayoutProps {
  children: React.ReactNode
}

export function WhiteLabelLayout({children}: WhiteLabelLayoutProps) {
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [companyName, setCompanyName] = useState('Route Planner')
  const [companyLogo, setCompanyLogo] = useState('/company_logo.svg')
  const [companyColor, setCompanyColor] = useState('#D36784')
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(defaultThemeConfig)

  // Create a dynamic theme based on theme configuration
  const theme = buildThemeFromConfig(themeConfig)

  useEffect(() => {
    // Fetch configuration from both public and protected endpoints
    const fetchConfig = async () => {
      try {
        // First, fetch branding info from public config endpoint
        const publicResponse = await fetch('/api/config')
        if (!publicResponse.ok) {
          throw new Error('Failed to fetch public configuration')
        }
        
        const publicConfig = await publicResponse.json()
        console.log('Public config from API:', publicConfig)
        
        // Set branding values from public config
        const companyName = publicConfig.COMPANY_NAME || 'Route Planner'
        const companyLogo = publicConfig.COMPANY_LOGO || '/company_logo.svg'
        const companyColor = publicConfig.COMPANY_COLOR || '#D36784'
        setCompanyName(companyName)
        setCompanyLogo(companyLogo)
        setCompanyColor(companyColor)

        // Parse and set theme configuration
        const parsedThemeConfig = parseThemeConfigFromAPI(publicConfig)
        setThemeConfig(parsedThemeConfig)

        // Then, fetch API key from protected config endpoint
        const protectedResponse = await fetch('/api/config/full')
        if (!protectedResponse.ok) {
          console.warn('Failed to fetch protected configuration - API key not available')
          setApiKey(null)
          setIsLoading(false)
          return
        }
        
        const protectedConfig = await protectedResponse.json()
        console.log('Protected config from API:', protectedConfig)
        
        const apiKey = protectedConfig.NEXTBILLION_API_KEY
        console.log('API Key from API:', apiKey)

        if (!apiKey) {
          console.warn('NEXTBILLION_API_KEY not found in environment variables')
          setApiKey(null)
          setIsLoading(false)
          return
        }

        setApiKey(apiKey)
        setIsLoading(false)

      } catch (error) {
        console.error('Error fetching config:', error)
        // Don't show error, just continue without API key
        setApiKey(null)
        setIsLoading(false)
      }
    }

    fetchConfig()
  }, [])

  if (isLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '18px'
        }}>
          Loading Route Planner...
          <br />
          <small>Checking API configuration...</small>
        </div>
      </ThemeProvider>
    )
  }

  if (error) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          color: 'red',
          fontSize: '18px',
          textAlign: 'center',
          padding: '20px'
        }}>
          Error: {error}
        </div>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <WhiteLabelContext.Provider value={{apiKey, isLoading, error, companyName, companyLogo, companyColor, themeConfig}}>
        {children}
      </WhiteLabelContext.Provider>
    </ThemeProvider>
  )
} 