'use client'

import React, { useState, useEffect } from 'react'
import { Container, Box, Typography, Button } from '@mui/material'
import { Logout as LogoutIcon } from '@mui/icons-material'
import { useRouter } from 'next/navigation'
import { WhiteLabelLayout, useWhiteLabelContext } from '../white-label-layout'
import { InputImportPage } from '../../components/input/input-import-page'
import { CollapsibleMap } from '../../components/input/input-panels/input-map'
import { MappingManagement } from '../../components/input/mapping-management'
import { PreferencesManagement } from '../../components/input/preferences-management'
import { Sidebar } from '../../components/common/sidebar'
import { useInputStore } from '../../models/input/store'
import { PreferencesInput } from '../../components/input/input-panels/preferences-page'
import { usePreferencesPersistence } from '../../hooks/use-preferences-persistence'
import { useAuth } from '../../hooks/use-auth'

export interface MapMarker {
  id: string
  latitude: number
  longitude: number
  description: string
  type: 'job' | 'vehicle'
}

export interface RouteData {
  vehicle: string
  geometry: string
  cost: number
  distance: number
  duration: number
  steps: any[]
  delivery?: number[]
  pickup?: number[]
}

// Force dynamic rendering to prevent prerendering issues
export const dynamic = 'force-dynamic'

export default function HomePage() {
  const router = useRouter()
  const { companyLogo, companyColor } = useWhiteLabelContext()
  const [markers, setMarkers] = useState<MapMarker[]>([])
  const [routes, setRoutes] = useState<RouteData[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [preferences, setPreferences] = useState<PreferencesInput>({
    routing: {
      mode: 'car',
      use_depot: false,
      depot_runs: 1,
    },
    constraints: {
      max_working_time: 10,
    },
    objective: {
      travel_cost: 'duration',
    },
  })
  
  const store = useInputStore()
  const { job, vehicle } = store.inputCore
  const { status: preferencesStatus, savePreferences, loadPreferences } = usePreferencesPersistence()
  const { isAdmin } = useAuth()

  // Initialize store and load persisted mappings on mount
  React.useEffect(() => {
    const initializeApp = async () => {
      try {
        await store.inputCore.initialize({
          isFleetifyEnable: false,
          isTelematicEnable: false,
        })
        console.log('App initialized with persisted mappings')
      } catch (error) {
        console.error('Failed to initialize app:', error)
      }
    }

    // Only initialize if not already initialized
    if (!store.inputCore.isInitialized) {
      initializeApp()
    }
  }, []) // Empty dependency array - only run once on mount

  // Load persisted preferences on mount
  useEffect(() => {
    const loadPersistedPreferences = async () => {
      try {
        const persistedPreferences = await loadPreferences()
        if (persistedPreferences) {
          // Remove the timestamp from the loaded preferences
          const { _timestamp, ...cleanPreferences } = persistedPreferences as PreferencesInput & { _timestamp?: string }
          setPreferences(cleanPreferences)
          console.log('Loaded persisted preferences')
        }
      } catch (error) {
        console.error('Failed to load persisted preferences:', error)
      }
    }

    loadPersistedPreferences()
  }, [loadPreferences])

  // Auto-save preferences when they change
  useEffect(() => {
    const savePreferencesToStorage = async () => {
      try {
        await savePreferences(preferences)
      } catch (error) {
        console.error('Failed to auto-save preferences:', error)
      }
    }

    // Don't save on initial load (when preferences are being loaded from storage)
    if (preferencesStatus.hasPreferences) {
      savePreferencesToStorage()
    }
  }, [preferences, savePreferences, preferencesStatus.hasPreferences])

  // Helper to extract lat/lng from mapped jobs data, only for selected rows
  function extractJobMarkers() {
    const header = job.rawData.header
    const rows = job.rawData.rows
    const mapConfig = job.mapConfig
    const selection = job.selection || []

    // Try to find latitude and longitude columns with various common names
    const latIdx = header.findIndex(h =>
      h.toLowerCase().includes('lat') ||
      h.toLowerCase().includes('latitude') ||
      h.toLowerCase().includes('pickup_lat') ||
      h.toLowerCase().includes('delivery_lat')
    )
    const lngIdx = header.findIndex(h =>
      h.toLowerCase().includes('lng') ||
      h.toLowerCase().includes('long') ||
      h.toLowerCase().includes('longitude') ||
      h.toLowerCase().includes('pickup_lng') ||
      h.toLowerCase().includes('delivery_lng')
    )

    if (latIdx === -1 || lngIdx === -1) {
      console.warn('Could not find latitude/longitude columns. Available headers:', header)
      return []
    }

    return rows
      .map((row, index) => {
        if (!selection[index]) return null
        const lat = parseFloat(row[latIdx])
        const lng = parseFloat(row[lngIdx])
        if (!isNaN(lat) && !isNaN(lng)) {
          // Try to get a meaningful description from the row data
          let description = `Job ${index + 1}`

          // Look for an ID or description column in the mapped data
          const idMapping = mapConfig.dataMappings.find(m => m.realKey === 'id')
          const descMapping = mapConfig.dataMappings.find(m => m.realKey === 'description')

          if (idMapping && row[idMapping.index]) {
            description = `Job ${row[idMapping.index]}`
          } else if (descMapping && row[descMapping.index]) {
            description = row[descMapping.index]
          }

          return {
            latitude: lat,
            longitude: lng,
            id: `job-${index}`,
            description: description,
            type: 'job'
          }
        }
        return null
      })
      .filter(Boolean) as MapMarker[]
  }

  // Helper to extract lat/lng from mapped vehicle data, only for selected rows
  function extractVehicleMarkers() {
    const header = vehicle.rawData.header
    const rows = vehicle.rawData.rows
    const mapConfig = vehicle.mapConfig
    const selection = vehicle.selection || []

    // First try to find a combined lat,lng field (like "start location" or "end location")
    const combinedLocationIdx = header.findIndex(h =>
      h.toLowerCase().includes('start location') ||
      h.toLowerCase().includes('end location') ||
      h.toLowerCase().includes('location') ||
      h.toLowerCase().includes('start_location') ||
      h.toLowerCase().includes('end_location')
    )

    if (combinedLocationIdx !== -1) {
      console.log('Found combined location field at index:', combinedLocationIdx, 'Header:', header[combinedLocationIdx])

      return rows
        .map((row, index) => {
          if (!selection[index]) return null
          const locationValue = row[combinedLocationIdx]
          if (!locationValue) return null

          // Parse "lat, lng" format (e.g., "46.9099, -117.082")
          const locationMatch = locationValue.match(/(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/)
          if (!locationMatch) {
            console.warn(`Could not parse location value: ${locationValue}`)
            return null
          }

          const lat = parseFloat(locationMatch[1])
          const lng = parseFloat(locationMatch[2])

          if (isNaN(lat) || isNaN(lng)) {
            console.warn(`Invalid lat/lng values: ${lat}, ${lng} from ${locationValue}`)
            return null
          }

          // Try to get a meaningful description from the row data
          let description = `Vehicle ${index + 1}`

          // Look for an ID or description column in the mapped data
          const idMapping = mapConfig.dataMappings.find(m => m.realKey === 'id')
          const descMapping = mapConfig.dataMappings.find(m => m.realKey === 'description')

          if (idMapping && row[idMapping.index]) {
            description = `Vehicle ${row[idMapping.index]}`
          } else if (descMapping && row[descMapping.index]) {
            description = row[descMapping.index]
          }

          return {
            latitude: lat,
            longitude: lng,
            id: `vehicle-${index}`,
            description: description,
            type: 'vehicle'
          }
        })
        .filter(Boolean) as MapMarker[]
    }

    // Fallback: Try to find separate latitude and longitude columns
    const latIdx = header.findIndex(h =>
      h.toLowerCase().includes('start_lat') ||
      h.toLowerCase().includes('start latitude') ||
      h.toLowerCase().includes('depot_lat') ||
      h.toLowerCase().includes('depot latitude') ||
      h.toLowerCase().includes('lat') ||
      h.toLowerCase().includes('latitude')
    )
    const lngIdx = header.findIndex(h =>
      h.toLowerCase().includes('start_lng') ||
      h.toLowerCase().includes('start longitude') ||
      h.toLowerCase().includes('start_lon') ||
      h.toLowerCase().includes('depot_lng') ||
      h.toLowerCase().includes('depot longitude') ||
      h.toLowerCase().includes('depot_lon') ||
      h.toLowerCase().includes('lng') ||
      h.toLowerCase().includes('long') ||
      h.toLowerCase().includes('longitude')
    )

    if (latIdx === -1 || lngIdx === -1) {
      console.warn('Could not find latitude/longitude columns for vehicles. Available headers:', header)
      return []
    }

    return rows
      .map((row, index) => {
        if (!selection[index]) return null
        const lat = parseFloat(row[latIdx])
        const lng = parseFloat(row[lngIdx])
        if (!isNaN(lat) && !isNaN(lng)) {
          // Try to get a meaningful description from the row data
          let description = `Vehicle ${index + 1}`

          // Look for an ID or description column in the mapped data
          const idMapping = mapConfig.dataMappings.find(m => m.realKey === 'id')
          const descMapping = mapConfig.dataMappings.find(m => m.realKey === 'description')

          if (idMapping && row[idMapping.index]) {
            description = `Vehicle ${row[idMapping.index]}`
          } else if (descMapping && row[descMapping.index]) {
            description = row[descMapping.index]
          }

          return {
            latitude: lat,
            longitude: lng,
            id: `vehicle-${index}`,
            description: description,
            type: 'vehicle'
          }
        }
        return null
      })
      .filter(Boolean) as MapMarker[]
  }

  // Update markers whenever selection or data changes
  React.useEffect(() => {
    const jobMarkers = extractJobMarkers()
    const vehicleMarkers = extractVehicleMarkers()
    setMarkers([...jobMarkers, ...vehicleMarkers])
  }, [job.rawData, job.selection, vehicle.rawData, vehicle.selection])

  const handleNextStep = (step: number) => {
    setCurrentStep(step)
  }

  const handlePreferencesChange = (newPreferences: PreferencesInput) => {
    console.log('Preferences changed (locale):', newPreferences)
    setPreferences(newPreferences)
  }

  const handleOptimizationComplete = (jobId: string) => {
    // Navigate to analysis page with the job ID as a query parameter
    router.push(`/analysis?job_id=${encodeURIComponent(jobId)}`)
  }

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })
      
      if (response.ok) {
        router.push('/login')
      } else {
        console.error('Logout failed')
      }
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <WhiteLabelLayout>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        {/* Sidebar */}
        <Sidebar currentPage="home" />
        {/* Main Content Area */}
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          ml: 'var(--sidebar-width, 280px)',
          transition: 'margin-left 0.3s ease',
          backgroundColor: '#ffffff' 
        }}>
          {/* Header */}
          <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', backgroundColor: '#ffffff' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <img
                  src={companyLogo}
                  alt="Company Logo"
                  style={{
                    height: '60px',
                    width: 'auto',
                    borderRadius: '4px'
                  }}
                />
                <Typography
                  variant="h4"
                  component="h1"
                  sx={{ color: '#333', fontWeight: 'bold', fontSize: '1.1rem' }}
                >
                  Plan, manage and monitor your routes
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {isAdmin && (
                  <Typography
                    variant="caption"
                    sx={{
                      backgroundColor: companyColor,
                      color: 'white',
                      px: 1,
                      py: 0.5,
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 'bold'
                    }}
                  >
                    ADMIN
                  </Typography>
                )}
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleLogout}
                  startIcon={<LogoutIcon />}
                  sx={{ 
                    height: '25px',
                    fontSize: '0.75rem',
                    textTransform: 'none'
                  }}
                >
                  Logout
                </Button>
              </Box>
            </Box>
          </Box>

          {/* Map always shown below header */}
          <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', backgroundColor: '#ffffff' }}>
            <CollapsibleMap markers={markers} routes={routes} />
          </Box>

          {/* Main content area */}
          <Box sx={{ 
            flex: 1, 
            backgroundColor: '#ffffff',
            pb: 2, // Add bottom padding to ensure content doesn't get hidden behind footer
            overflow: 'auto', // Allow scrolling if content is too long
          }}>
            <MappingManagement />
            {isAdmin && <PreferencesManagement />}
            <InputImportPage
              currentStep={currentStep}
              onStepChange={handleNextStep}
              preferences={preferences}
              onPreferencesChange={handlePreferencesChange}
              onRouteResultsChange={setRoutes}
              onOptimizationComplete={handleOptimizationComplete}
            />
          </Box>

          {/* Footer */}
          <Box sx={{
            borderTop: '1px solid #e0e0e0',
            backgroundColor: '#ffffff',
            py: 3,
            px: 2,
            mt: '5px', // Add 5px margin above the footer
            position: 'relative',
            zIndex: 10, // Ensure footer is above content but below sticky elements
            flexShrink: 0, // Prevent footer from shrinking
          }}>
            <Box sx={{ mt: 0, pt: 0, display: 'flex', alignItems: 'center', gap: 1 }}>
              <img
                src={companyLogo}
                alt="Company Logo"
                style={{ height: '40px', width: 'auto', marginRight: '8px', verticalAlign: 'middle' }}
              />
              <Typography variant="body2" sx={{ color: '#999', fontSize: '14px' }}>
                powered by NextBillion.ai | Version 1.0.0 | Last updated: {new Date().toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </WhiteLabelLayout>
  )
} 