import { useState, useEffect, useCallback } from 'react'
import { PreferencesInput } from '../components/input/input-panels/preferences-page'
import { preferencesPersistence } from '../utils/preferences-persistence'

export interface PreferencesStatus {
  hasPreferences: boolean
  age: number | null
  loading: boolean
}

export function usePreferencesPersistence() {
  const [status, setStatus] = useState<PreferencesStatus>({
    hasPreferences: false,
    age: null,
    loading: false,
  })

  const savePreferences = useCallback(async (preferences: PreferencesInput): Promise<void> => {
    setStatus(prev => ({ ...prev, loading: true }))
    try {
      // Add timestamp to the preferences
      const preferencesWithTimestamp = {
        ...preferences,
        _timestamp: new Date().toISOString(),
      }
      await preferencesPersistence.savePreferences(preferencesWithTimestamp)
      
      // Update status
      setStatus({
        hasPreferences: true,
        age: 0, // Just saved, so age is 0
        loading: false,
      })
    } catch (error) {
      console.error('Failed to save preferences:', error)
      setStatus(prev => ({ ...prev, loading: false }))
      throw error
    }
  }, [])

  const loadPreferences = useCallback(async (): Promise<PreferencesInput | null> => {
    setStatus(prev => ({ ...prev, loading: true }))
    try {
      const preferences = await preferencesPersistence.loadPreferences()
      if (preferences) {
        const age = await preferencesPersistence.getPreferencesAge()
        setStatus({
          hasPreferences: true,
          age,
          loading: false,
        })
      } else {
        setStatus({
          hasPreferences: false,
          age: null,
          loading: false,
        })
      }
      return preferences
    } catch (error) {
      console.error('Failed to load preferences:', error)
      setStatus({
        hasPreferences: false,
        age: null,
        loading: false,
      })
      return null
    }
  }, [])

  const clearPreferences = useCallback(async (): Promise<void> => {
    setStatus(prev => ({ ...prev, loading: true }))
    try {
      await preferencesPersistence.clearPreferences()
      setStatus({
        hasPreferences: false,
        age: null,
        loading: false,
      })
    } catch (error) {
      console.error('Failed to clear preferences:', error)
      setStatus(prev => ({ ...prev, loading: false }))
      throw error
    }
  }, [])

  const checkPreferencesStatus = useCallback(async (): Promise<void> => {
    setStatus(prev => ({ ...prev, loading: true }))
    try {
      const [hasPreferences, age] = await Promise.all([
        preferencesPersistence.hasPreferences(),
        preferencesPersistence.getPreferencesAge(),
      ])
      
      setStatus({
        hasPreferences,
        age,
        loading: false,
      })
    } catch (error) {
      console.error('Failed to check preferences status:', error)
      setStatus({
        hasPreferences: false,
        age: null,
        loading: false,
      })
    }
  }, [])

  // Check status on mount (only on client side)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      checkPreferencesStatus()
    }
  }, [checkPreferencesStatus])

  return {
    status,
    savePreferences,
    loadPreferences,
    clearPreferences,
    checkPreferencesStatus,
  }
} 