'use client'

import React, { useState } from 'react'
import { Box, Container, Typography } from '@mui/material'
import { WhiteLabelLayout } from './white-label-layout'
import { InputImportPage } from '../components/input/input-import-page'
import { CollapsibleMap, MapMarker, RouteData } from '../components/input/input-panels/input-map'
import { PreferencesPage, PreferencesInput } from '../components/input/input-panels/preferences-page'
import { MappingManagement } from '../components/input/mapping-management'
import { useInputStore } from '../models/input/store'

// Force dynamic rendering to prevent prerendering issues
export const dynamic = 'force-dynamic'

export default function HomePage() {
  const [markers, setMarkers] = useState<MapMarker[]>([])
  const [routes, setRoutes] = useState<RouteData[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [preferences, setPreferences] = useState<PreferencesInput>({
    routing: {
      mode: 'car',
    },
    constraints: {},
    objective: {
      travel_cost: 'none',
    },
  })
  const store = useInputStore()
  const { job, vehicle } = store.inputCore

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

          console.log(`Created vehicle marker: ${description} at ${lat}, ${lng}`)

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

  // Handler for Next button in InputImportPage
  function handleNextStep(nextStep: number) {
    setCurrentStep(nextStep)
  }

  return (
    <WhiteLabelLayout>
      <Container maxWidth="xl" sx={{ minHeight: '100vh', p: 0 }}>
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', backgroundColor: '#E5EEFA' }}>
            <Box sx={{ maxHeight: '25px', height: '25px', display: 'flex', alignItems: 'center', gap: 2 }}>
              <img
                src="/company_logo.png"
                alt="Company Logo"
                style={{
                  height: '25px',
                  width: 'auto',
                  borderRadius: '4px'
                }}
              />
              <Box>
                <Typography
                  variant="h4"
                  component="h1"
                  sx={{ color: '#333', fontWeight: 'bold', fontSize: '1.1rem' }}
                >
                  PlanPath-AI : Plan, manage and monitor your routes
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Map always shown below header */}
          <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', backgroundColor: '#f9f9f9' }}>
            <CollapsibleMap markers={markers} routes={routes} />
          </Box>

          {/* Main content area */}
          <Box sx={{ flex: 1 }}>
            <MappingManagement />
            <InputImportPage
              currentStep={currentStep}
              onStepChange={handleNextStep}
              preferences={preferences}
              onPreferencesChange={setPreferences}
              onRouteResultsChange={setRoutes}
            />
          </Box>

          {/* Footer */}
          <Box sx={{
            borderTop: '1px solid #e0e0e0',
            backgroundColor: '#f5f5f5',
            py: 3,
            px: 2,
            mt: '5px' // Add 5px margin above the footer
          }}>
            <Container maxWidth="xl">
              <Box sx={{ mt: 0, pt: 0, display: 'flex', alignItems: 'center', gap: 1 }}>
                <img
                  src="/company_logo.png"
                  alt="Company Logo"
                  style={{ height: '20px', width: 'auto', marginRight: '8px', verticalAlign: 'middle' }}
                />
                <Typography variant="caption" sx={{ color: '#999' }}>
                  PlanPath-AI powered by NextBillion.ai | Version 1.0.0 | Last updated: {new Date().toLocaleDateString()}
                </Typography>
              </Box>
            </Container>
          </Box>
        </Box>
      </Container>
    </WhiteLabelLayout>
  )
} 