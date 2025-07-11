'use client'

import React, {createContext, useContext, useEffect, useState} from 'react'
import {ThemeProvider, createTheme} from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import Footer from '../components/Footer'

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
      main: '#d36784', // Light pink/mauve for buttons and badges
      light: '#E0859A',
      dark: '#B54A6A',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
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
    // Fetch the API key from the config API route
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/config')
        if (!response.ok) {
          throw new Error('Failed to fetch configuration')
        }
        
        const config = await response.json()
        console.log('Config from API:', config)
        
        const apiKey = config.NEXTBILLION_API_KEY
        console.log('API Key from API:', apiKey)

        if (!apiKey) {
          console.warn('NEXTBILLION_API_KEY not found in environment variables')
          // Don't set error, just continue without API key for now
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
      <WhiteLabelContext.Provider value={{apiKey, isLoading, error}}>
        {children}
        {/* <Footer /> removed to prevent duplicate footers */}
      </WhiteLabelContext.Provider>
    </ThemeProvider>
  )
} 