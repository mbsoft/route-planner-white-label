'use client'

import React from 'react'
import { Box, Button, Typography, IconButton } from '@mui/material'
import { InputOrderPanel } from './input-panels/input-order'
import { InputVehiclePanel } from './input-panels/input-vehicle'
import { InputImportStepper } from './input-import-stepper'
import { PreferencesPage, PreferencesInput } from './input-panels/preferences-page'
import { useInputStore } from '../../models/input/store'
import { DataMapper } from './data-mapper/data-mapper'
import { useUseCase } from '../../utils/use-case'
import { ApiClient } from '../../utils/api-client'
import ReplayIcon from '@mui/icons-material/Replay';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';

// Types for optimization API
interface OptimizationMvrpOrderJobV2 {
  id: number
  location_index: number
  service?: number
  delivery?: number[]
  pickup?: number[]
  time_windows?: number[][]
  skills?: number[]
  description?: string
  priority?: number
  setup?: number
}

interface OptimizationMvrpOrderVehicleV2 {
  id: number
  start_index: number
  end_index?: number
  capacity?: number[]
  skills?: number[]
  time_window?: [number, number]
  costs?: {
    fixed?: number
  }
  max_tasks?: number
  max_travel_cost?: number
  description?: string
  depot?: number
  break?: {
    id: number
    service?: number
    time_windows: number[][]
    description?: string
  }
}

interface OptimizationMvrpOrderShipmentV2 {
  id?: number | string
  amount?: number[]
  delivery: {
    id: number
    location_index: number
    service?: number
    setup?: number
    time_windows?: [number, number][]
    description: string
  }
  pickup: {
    id: number
    location_index: number
    service?: number
    setup?: number
    time_windows?: [number, number][]
    description?: string
  }
  priority?: number
  skills?: number[]
}

interface OptimizationMvrpOrderLocationV2 {
  id: number
  location: string[]
  approaches?: string[]
}

interface OptimizationMvrpOrderRequestV2 {
  jobs?: OptimizationMvrpOrderJobV2[]
  vehicles: OptimizationMvrpOrderVehicleV2[]
  shipments?: OptimizationMvrpOrderShipmentV2[]
  locations: OptimizationMvrpOrderLocationV2[]
}

// Normalization functions
function normalizeJobs(jobData: any, mapConfig: any): OptimizationMvrpOrderJobV2[] {
  if (!jobData.rows || jobData.rows.length === 0) return []
  
  return jobData.rows.map((row: string[], index: number) => {
    const job: OptimizationMvrpOrderJobV2 = {
      id: index + 1,
      location_index: index + 1,
    }
    
    // Map each column based on the mapping configuration
    mapConfig.dataMappings.forEach((mapping: any) => {
      const value = row[mapping.index]
      if (!value) return
      
      switch (mapping.value) {
        case 'id':
          job.id = parseInt(value) || index + 1
          break
        case 'description':
          job.description = value
          break
        case 'service':
          job.service = parseInt(value)
          break
        case 'priority':
          job.priority = parseInt(value)
          break
        case 'setup':
          job.setup = parseInt(value)
          break
        case 'skills':
          job.skills = value.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n))
          break
        case 'start_time':
        case 'end_time':
          // Handle time windows - this is simplified, you may need more complex logic
          if (!job.time_windows) job.time_windows = []
          // Convert time to minutes since midnight
          const timeInMinutes = convertTimeToMinutes(value)
          if (mapping.value === 'start_time') {
            job.time_windows.push([timeInMinutes, timeInMinutes + 60]) // Default 1 hour window
          }
          break
        case 'pickup_capacity_1':
        case 'pickup_capacity_2':
        case 'pickup_capacity_3':
          if (!job.pickup) job.pickup = []
          const pickupIndex = parseInt(mapping.value.split('_').pop()) - 1
          job.pickup[pickupIndex] = parseInt(value)
          break
        case 'delivery_capacity_1':
        case 'delivery_capacity_2':
        case 'delivery_capacity_3':
          if (!job.delivery) job.delivery = []
          const deliveryIndex = parseInt(mapping.value.split('_').pop()) - 1
          job.delivery[deliveryIndex] = parseInt(value)
          break
      }
    })
    
    return job
  })
}

function normalizeVehicles(vehicleData: any, mapConfig: any): OptimizationMvrpOrderVehicleV2[] {
  if (!vehicleData.rows || vehicleData.rows.length === 0) return []
  
  return vehicleData.rows.map((row: string[], index: number) => {
    const vehicle: OptimizationMvrpOrderVehicleV2 = {
      id: index + 1,
      start_index: index + 1,
    }
    
    // Map each column based on the mapping configuration
    mapConfig.dataMappings.forEach((mapping: any) => {
      const value = row[mapping.index]
      if (!value) return
      
      switch (mapping.value) {
        case 'id':
          vehicle.id = parseInt(value) || index + 1
          break
        case 'description':
          vehicle.description = value
          break
        case 'capacity_1':
        case 'capacity_2':
        case 'capacity_3':
          if (!vehicle.capacity) vehicle.capacity = []
          const capacityIndex = parseInt(mapping.value.split('_').pop()) - 1
          vehicle.capacity[capacityIndex] = parseInt(value)
          break
        case 'skills':
          vehicle.skills = value.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n))
          break
        case 'max_tasks':
          vehicle.max_tasks = parseInt(value)
          break
        case 'fixed_cost':
          if (!vehicle.costs) vehicle.costs = {}
          vehicle.costs.fixed = parseInt(value)
          break
        case 'start_time':
        case 'end_time':
          if (!vehicle.time_window) vehicle.time_window = [0, 1440] // Default full day
          const timeInMinutes = convertTimeToMinutes(value)
          if (mapping.value === 'start_time') {
            vehicle.time_window[0] = timeInMinutes
          } else {
            vehicle.time_window[1] = timeInMinutes
          }
          break
      }
    })
    
    return vehicle
  })
}

function normalizeLocations(jobData: any, vehicleData: any, mapConfig: any): OptimizationMvrpOrderLocationV2[] {
  const locations: OptimizationMvrpOrderLocationV2[] = []
  let locationIndex = 1
  
  // Add job locations
  if (jobData.rows) {
    jobData.rows.forEach((row: string[], index: number) => {
      const locationMapping = mapConfig.dataMappings.find((m: any) => 
        m.value === 'location' || m.value === 'location_lat_lng' || m.value === 'location_lng_lat'
      )
      
      if (locationMapping) {
        const locationValue = row[locationMapping.index]
        if (locationValue) {
          locations.push({
            id: locationIndex,
            location: [locationValue], // This should be parsed as lat,lng
          })
          locationIndex++
        }
      }
    })
  }
  
  // Add vehicle start/end locations
  if (vehicleData.rows) {
    vehicleData.rows.forEach((row: string[], index: number) => {
      const startLocationMapping = mapConfig.dataMappings.find((m: any) => 
        m.value === 'start_location' || m.value === 'start_location_lat_lng'
      )
      
      if (startLocationMapping) {
        const locationValue = row[startLocationMapping.index]
        if (locationValue) {
          locations.push({
            id: locationIndex,
            location: [locationValue],
          })
          locationIndex++
        }
      }
    })
  }
  
  return locations
}

function convertTimeToMinutes(timeStr: string): number {
  // Simple time conversion - you may need more robust parsing
  const time = timeStr.split(':')
  if (time.length === 2) {
    return parseInt(time[0]) * 60 + parseInt(time[1])
  }
  return 0
}

const steps = [
  'Preferences',
  'Orders/Shipments',
  'Vehicles',
  'Review',
]

interface InputImportPageProps {
  currentStep: number
  onStepChange: (nextStep: number) => void
  preferences?: PreferencesInput
  onPreferencesChange?: (preferences: PreferencesInput) => void
}

export const InputImportPage = ({ currentStep, onStepChange, preferences, onPreferencesChange }: InputImportPageProps) => {
  const store = useInputStore()
  const { job, vehicle, shipment } = store.inputCore
  const useCase = useUseCase()
  const inputType = useCase === 'jobs' ? 'job' : 'shipment'
  const orderTypeLabel = useCase === 'jobs' ? 'Jobs' : 'Shipments'

  // Local editing state for jobs mapping
  const [isEditing, setIsEditing] = React.useState(false)
  const [editRows, setEditRows] = React.useState<string[][]>([])
  const [editAttachedRows, setEditAttachedRows] = React.useState<string[][]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [isOptimizing, setIsOptimizing] = React.useState(false);

  // Handlers for editing
  const handleEdit = () => {
    setEditRows(store.inputCore[inputType].rawData.rows.map(row => [...row]))
    setEditAttachedRows(store.inputCore[inputType].rawData.attachedRows.map(row => [...row]))
    setIsEditing(true)
  }
  const handleCancel = () => {
    setIsEditing(false)
    setEditRows([])
    setEditAttachedRows([])
  }
  const handleSave = () => {
    store.inputCore.setRawData(inputType, {
      header: store.inputCore[inputType].rawData.header,
      rows: editRows,
      attachedRows: editAttachedRows,
    })
    setIsEditing(false)
    setEditRows([])
    setEditAttachedRows([])
  }
  const handleCellChange = (row: number, col: number, value: string) => {
    setEditRows(prev => {
      const updated = prev.map(r => [...r])
      if (updated[row]) updated[row][col] = value
      return updated
    })
  }
  const handleRepeatToAll = (row: number, col: number, value: string) => {
    setEditRows(prev => {
      const updated = prev.map(r => [...r])
      for (let i = 0; i < updated.length; i++) {
        updated[i][col] = value
      }
      return updated
    })
  }

  // Handler for delete with confirmation
  const handleDelete = () => setDeleteDialogOpen(true);
  const handleDeleteConfirm = () => {
    store.inputCore.setRawData(inputType, { header: [], rows: [], attachedRows: [] });
    setDeleteDialogOpen(false);
  };
  const handleDeleteCancel = () => setDeleteDialogOpen(false);

  // Handler for optimization request
  const handleOptimizationRequest = async () => {
    try {
      setIsOptimizing(true)
      
      const apiKey = process.env.NEXTBILLION_API_KEY
      if (!apiKey) {
        throw new Error('NEXTBILLION_API_KEY environment variable is required')
      }
      
      const apiClient = new ApiClient(apiKey)
      
      // Normalize the data
      const normalizedJobs = normalizeJobs(job.rawData, job.mapConfig)
      const normalizedVehicles = normalizeVehicles(vehicle.rawData, vehicle.mapConfig)
      const normalizedLocations = normalizeLocations(job.rawData, vehicle.rawData, job.mapConfig)
      
      // Build the optimization request
      const optimizationRequest: OptimizationMvrpOrderRequestV2 = {
        jobs: normalizedJobs,
        vehicles: normalizedVehicles,
        locations: normalizedLocations,
      }
      
      // Send the optimization request
      const response = await apiClient.createOptimizationRequest(optimizationRequest)
      
      console.log('Optimization request successful:', response)
      
      // You can handle the response here - redirect to results page, show success message, etc.
      const responseData = response.data as any
      alert('Optimization request submitted successfully! Request ID: ' + responseData.id)
      
    } catch (error) {
      console.error('Optimization request failed:', error)
      alert('Optimization request failed: ' + (error as Error).message)
    } finally {
      setIsOptimizing(false)
    }
  }

  // Only show mapping table in the relevant step
  const showMapping = (step: number) => {
    if (step === 1 && store.inputCore[inputType].rawData.rows.length > 0) return true
    if (step === 2 && vehicle.rawData.rows.length > 0) return true
    return false
  }

  // Render the main content for each step
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return preferences && onPreferencesChange ? (
          <PreferencesPage
            preferences={preferences}
            onPreferencesChange={onPreferencesChange}
          />
        ) : (
          <Box sx={{ p: 2 }}>
            <h3 style={{ color: '#585656', fontSize: '16px', fontWeight: 500 }}>Preferences</h3>
            <p style={{ color: '#666', fontSize: '14px' }}>Preferences step coming soon.</p>
          </Box>
        )
      case 1:
        // Jobs/Shipments step: show drag-drop if no data, otherwise show summary, icons, and mapping table
        if (store.inputCore[inputType].rawData.rows.length === 0) {
          return <InputOrderPanel />;
        }
        return (
          <Box sx={{ border: '1px solid #e0e0e0', borderRadius: '12px', background: '#fff', p: 4, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="h5" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                ✓ {orderTypeLabel} Data Imported
              </Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>
                {store.inputCore[inputType].rawData.rows.length} records loaded
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
              Your {orderTypeLabel.toLowerCase()} data has been successfully imported. You can now proceed to the mapping step or click the delete icon above to remove the data and upload a different file.
            </Typography>
            {/* Icon toolbar and mapping table are rendered here */}
            <Box sx={{ mt: 2, mb: 2, display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'flex-end' }}>
              <IconButton onClick={() => store.inputCore.resetMapping(inputType)} color="primary" title="Reset Mapping">
                <ReplayIcon />
              </IconButton>
              <IconButton onClick={() => store.inputCore.appendAttachedRows(inputType)} color="primary" title="Add attribute">
                <AddIcon />
              </IconButton>
              {!isEditing && (
                <IconButton onClick={handleEdit} color="primary" title="Edit table">
                  <EditIcon />
                </IconButton>
              )}
              {isEditing && (
                <>
                  <IconButton onClick={handleSave} color="success" title="Save changes">
                    <SaveIcon />
                  </IconButton>
                  <IconButton onClick={handleCancel} color="error" title="Cancel editing">
                    <CloseIcon />
                  </IconButton>
                </>
              )}
              <IconButton onClick={handleDelete} color="error" title="Delete imported data">
                <DeleteIcon />
              </IconButton>
            </Box>
            {/* Delete confirmation dialog */}
            <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
              <DialogTitle>Are you sure?</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  This will delete all imported data. This action cannot be undone.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleDeleteCancel} color="primary">Cancel</Button>
                <Button onClick={handleDeleteConfirm} color="error" variant="contained">Confirm</Button>
              </DialogActions>
            </Dialog>
            <Box sx={{ mt: 4 }}>
              <DataMapper
                headers={store.inputCore[inputType].rawData.header}
                rows={isEditing ? editRows : store.inputCore[inputType].rawData.rows}
                attachedRows={isEditing ? editAttachedRows : store.inputCore[inputType].rawData.attachedRows}
                inputType={inputType}
              />
            </Box>
          </Box>
        );
      case 2:
        return <InputVehiclePanel />
      case 3:
        return (
          <Box sx={{ p: 2 }}>
            <h3 style={{ color: '#585656', fontSize: '16px', fontWeight: 500 }}>Review & Optimize</h3>
            <p style={{ color: '#666', fontSize: '14px' }}>
              All data has been imported and mapped. You can now review the data and proceed with route optimization.
            </p>
            <Box sx={{ mt: 2, p: 2, backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
              <Typography variant="body2" sx={{ color: '#666' }}>
                <strong>{orderTypeLabel}:</strong> {store.inputCore[inputType].rawData.rows.length} records
              </Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>
                <strong>Vehicles:</strong> {vehicle.rawData.rows.length} records
              </Typography>
            </Box>
          </Box>
        )
      default:
        return null
    }
  }

  // Remove renderMapping and showMapping logic for jobs step, since mapping is now inside the card

  return (
    <Box sx={{ display: 'flex', gap: 2, height: '100%' }}>
      <InputImportStepper currentStep={currentStep} onStepChange={onStepChange} />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {renderStepContent()}
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
            onClick={() => {
              if (currentStep === steps.length - 1) {
                // This is the Finish button - trigger optimization
                handleOptimizationRequest()
              } else {
                onStepChange(Math.min(steps.length - 1, currentStep + 1))
              }
            }}
          >
            {currentStep === steps.length - 1 ? (isOptimizing ? 'Optimizing...' : 'Finish') : 'Next'}
          </Button>
        </Box>
      </Box>
    </Box>
  )
} 