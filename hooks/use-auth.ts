'use client'

import { useState, useEffect } from 'react'
import { SessionInfo, decodeSession } from '../utils/auth-utils'

export function useAuth() {
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          setSessionInfo(data.sessionInfo)
        } else {
          setSessionInfo(null)
        }
      } catch (error) {
        console.error('Error checking auth:', error)
        setSessionInfo(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const isAdmin = sessionInfo?.role === 'admin'
  const isUser = sessionInfo?.role === 'user'
  const isDispatcher = sessionInfo?.role === 'dispatcher'
  const isAuthenticated = !!sessionInfo

  return {
    sessionInfo,
    loading,
    isAdmin,
    isUser,
    isDispatcher,
    isAuthenticated
  }
} 