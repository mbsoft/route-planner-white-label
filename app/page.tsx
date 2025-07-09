'use client'

import React, { useState } from 'react'
import { Box, Container, Typography } from '@mui/material'
import { WhiteLabelLayout } from './white-label-layout'
import { InputImportPage } from '../components/input/input-import-page'
import { InputMap, MapMarker } from '../components/input/input-panels/input-map'
import { useInputStore } from '../models/input/store'

export default function HomePage() {
  const [markers, setMarkers] = useState<MapMarker[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const store = useInputStore()
  const { job } = store.inputCore

  // Helper to extract lat/lng from mapped jobs data
  function extractJobMarkers() {
    const header = job.rawData.header
    const rows = job.rawData.rows
    const mapConfig = job.mapConfig
    
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
            description: description
          }
        }
        return null
      })
      .filter(Boolean) as MapMarker[]
  }

  // Handler for Next button in InputImportPage
  function handleNextStep(nextStep: number) {
    // If advancing from Orders/Shipments to Vehicles, update markers
    if (currentStep === 1 && nextStep === 2) {
      const extractedMarkers = extractJobMarkers()
      console.log('Extracted markers:', extractedMarkers)
      console.log('Job data:', job)
      setMarkers(extractedMarkers)
    }
    setCurrentStep(nextStep)
  }

  return (
    <WhiteLabelLayout>
      <Container maxWidth="xl" sx={{ minHeight: '100vh', p: 0 }}>
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', backgroundColor: '#fff' }}>
            <Typography variant="h4" component="h1" sx={{ color: '#333', fontWeight: 'bold' }}>
              Route Planner
            </Typography>
            <Typography variant="body1" sx={{ color: '#666', mt: 1 }}>
              Import your data and configure route optimization
            </Typography>
          </Box>

          {/* Map always shown below header */}
          <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', backgroundColor: '#f9f9f9' }}>
            <InputMap markers={markers} />
          </Box>

          {/* Only the main import page/stepper below */}
          <Box sx={{ flex: 1 }}>
            <InputImportPage
              currentStep={currentStep}
              onStepChange={handleNextStep}
            />
          </Box>
        </Box>
      </Container>
    </WhiteLabelLayout>
  )
} 