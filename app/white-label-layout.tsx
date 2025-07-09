'use client'

import React, {createContext, useContext, useEffect, useState} from 'react'
import {ThemeProvider, createTheme} from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import getConfig from 'next/config'

// Create a context for the API key
interface WhiteLabelContextType {
  apiKey: string | null
  isLoading: boolean
  error: string | null
}

const WhiteLabelContext = createContext<WhiteLabelContextType>({
  apiKey: null,
  isLoading: true,
  error: null,
})

export function useWhiteLabelContext() {
  return useContext(WhiteLabelContext)
}

// Create a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
})

interface WhiteLabelLayoutProps {
  children: React.ReactNode
}

export function WhiteLabelLayout({children}: WhiteLabelLayoutProps) {
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Try multiple ways to get the API key
    const {publicRuntimeConfig} = getConfig() || {}
    const configApiKey = publicRuntimeConfig?.NEXTBILLION_API_KEY
    const envApiKey = process.env.NEXTBILLION_API_KEY
    const runtimeApiKey = configApiKey || envApiKey

    console.log('API Key check:', {
      configApiKey: configApiKey ? 'Present' : 'Missing',
      envApiKey: envApiKey ? 'Present' : 'Missing',
      runtimeApiKey: runtimeApiKey ? 'Present' : 'Missing'
    })

    if (!runtimeApiKey) {
      setError('NEXTBILLION_API_KEY environment variable is required')
      setIsLoading(false)
      return
    }

    setApiKey(runtimeApiKey)
    setIsLoading(false)
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
      <WhiteLabelContext.Provider value={{apiKey, isLoading, error}}>
        {children}
      </WhiteLabelContext.Provider>
    </ThemeProvider>
  )
} 