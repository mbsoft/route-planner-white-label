'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  InputAdornment,
  IconButton
} from '@mui/material'
import { Visibility, VisibilityOff, Login as LoginIcon } from '@mui/icons-material'
import { WhiteLabelLayout, useWhiteLabelContext } from '../white-label-layout'
import { buildThemeFromConfig, parseThemeConfigFromAPI, ThemeConfig } from '../../utils/theme-builder'

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

function LoginPageContent() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(defaultThemeConfig)
  const router = useRouter()
  const { companyLogo, companyColor, companyName } = useWhiteLabelContext()

  // Create a dynamic theme based on theme configuration
  const theme = buildThemeFromConfig(themeConfig)

  // Fetch theme configuration on mount
  React.useEffect(() => {
    const fetchThemeConfig = async () => {
      try {
        const response = await fetch('/api/config')
        if (response.ok) {
          const config = await response.json()
          const parsedThemeConfig = parseThemeConfigFromAPI(config)
          setThemeConfig(parsedThemeConfig)
        }
      } catch (error) {
        console.error('Error fetching theme config:', error)
      }
    }

    fetchThemeConfig()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      if (response.ok) {
        router.push('/')
        router.refresh()
      } else {
        const data = await response.json()
        setError(data.error || 'Login failed')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            py: 4
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              width: '100%',
              maxWidth: 400,
              borderRadius: 2
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <img 
                src={companyLogo} 
                alt="Company Logo" 
                style={{ height: 160, marginBottom: 16 }}
              />
              <Typography variant="h4" component="h1" gutterBottom>
                {companyName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sign in to access the route planning system
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit} autoComplete="off">
              <TextField
                fullWidth
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                margin="normal"
                required
                autoFocus
                disabled={loading}
                placeholder=""
                autoComplete="off"
              />
              
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
                disabled={loading}
                placeholder=""
                autoComplete="off"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading || !username || !password}
                sx={{ mt: 3, mb: 2 }}
                startIcon={<LoginIcon />}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mt: 2, fontSize: '16px' }}>
              Powered by NextBillion.ai
            </Typography>
          </Paper>
        </Box>
      </Container>
  )
}

export default function LoginPage() {
  return (
    <WhiteLabelLayout>
      <LoginPageContent />
    </WhiteLabelLayout>
  )
} 