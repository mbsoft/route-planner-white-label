'use client'

import React from 'react'
import { Box, Button } from '@mui/material'
import { InputOrderPanel } from './input-panels/input-order'
import { InputVehiclePanel } from './input-panels/input-vehicle'
import { InputImportStepper } from './input-import-stepper'
import { useInputStore } from '../../models/input/store'
import { DataMapper } from './data-mapper/data-mapper'

const steps = [
  'Preferences',
  'Orders/Shipments',
  'Vehicles',
]

interface InputImportPageProps {
  currentStep: number
  onStepChange: (nextStep: number) => void
}

export const InputImportPage = ({ currentStep, onStepChange }: InputImportPageProps) => {
  const store = useInputStore()
  const { job, vehicle, shipment } = store.inputCore

  // Only show mapping table in the relevant step
  const showMapping = (step: number) => {
    if (step === 1 && (job.rawData.rows.length > 0 || shipment.rawData.rows.length > 0)) return true
    if (step === 2 && vehicle.rawData.rows.length > 0) return true
    return false
  }

  // Render the main content for each step
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Box sx={{ p: 2 }}>
            <h3 style={{ color: '#585656', fontSize: '16px', fontWeight: 500 }}>Preferences</h3>
            <p style={{ color: '#666', fontSize: '14px' }}>Preferences step coming soon.</p>
          </Box>
        )
      case 1:
        return <InputOrderPanel />
      case 2:
        return <InputVehiclePanel />
      default:
        return null
    }
  }

  // Render mapping table for the current step
  const renderMapping = () => {
    if (currentStep === 1 && (job.rawData.rows.length > 0 || shipment.rawData.rows.length > 0)) {
      return (
        <Box sx={{ mt: 2 }}>
          {job.rawData.rows.length > 0 && (
            <>
              <h4 style={{ margin: '10px 0 4px 0' }}>Jobs Data Mapping</h4>
              <DataMapper
                headers={job.rawData.header}
                rows={job.rawData.rows}
                attachedRows={job.rawData.attachedRows}
                inputType="job"
              />
            </>
          )}
          {shipment.rawData.rows.length > 0 && (
            <>
              <h4 style={{ margin: '10px 0 4px 0' }}>Shipments Data Mapping</h4>
              <DataMapper
                headers={shipment.rawData.header}
                rows={shipment.rawData.rows}
                attachedRows={shipment.rawData.attachedRows}
                inputType="shipment"
              />
            </>
          )}
        </Box>
      )
    }
    if (currentStep === 2 && vehicle.rawData.rows.length > 0) {
      return (
        <Box sx={{ mt: 2 }}>
          <h4 style={{ margin: '10px 0 4px 0' }}>Vehicles Data Mapping</h4>
          <DataMapper
            headers={vehicle.rawData.header}
            rows={vehicle.rawData.rows}
            attachedRows={vehicle.rawData.attachedRows}
            inputType="vehicle"
          />
        </Box>
      )
    }
    return null
  }

  return (
    <Box sx={{ display: 'flex', flex: 1, gap: '20px', paddingBottom: '72px' }}>
      {/* Sidebar Stepper */}
      <Box sx={{ flex: 0 }}>
        <InputImportStepper currentStep={currentStep} onStepChange={onStepChange} />
      </Box>
      {/* Main Content */}
      <Box sx={{ flex: 1, overflow: 'auto', padding: '0 5px' }}>
        {renderStepContent()}
        {showMapping(currentStep) && renderMapping()}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            variant="outlined"
            disabled={currentStep === 0}
            onClick={() => onStepChange(Math.max(0, currentStep - 1))}
          >
            Back
          </Button>
          <Button
            variant="contained"
            disabled={currentStep === steps.length - 1}
            onClick={() => onStepChange(Math.min(steps.length - 1, currentStep + 1))}
          >
            Next
          </Button>
        </Box>
      </Box>
    </Box>
  )
} 