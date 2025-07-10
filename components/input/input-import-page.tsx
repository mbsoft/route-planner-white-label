'use client'

import React from 'react'
import { Box, Button, Typography, IconButton, LinearProgress } from '@mui/material'
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

type VehicleType = OptimizationMvrpOrderVehicleV2;

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
  vehicles: VehicleType[]
  shipments?: OptimizationMvrpOrderShipmentV2[]
  locations: {
    id: number
    description: string
    location: string[]
  }
}

// Normalization functions
// Helper to parse lat/lng from a string ("lat,lng" or "lng,lat")
function parseLatLng(str: string): [number, number] | null {
  if (!str) return null;
  const match = str.match(/(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/);
  if (!match) return null;
  const a = parseFloat(match[1]);
  const b = parseFloat(match[2]);
  // Heuristic: if abs(a) > 90, treat as lng,lat; else lat,lng
  if (Math.abs(a) > 90) return [b, a];
  return [a, b];
}

function convertTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  
  // Check if it's an ISO8601 string (contains 'T' or 'Z' or has timezone info)
  if (timeStr.includes('T') || timeStr.includes('Z') || timeStr.includes('+') || timeStr.includes('-')) {
    try {
      const date = new Date(timeStr);
      if (!isNaN(date.getTime())) {
        // Convert to Unix epoch seconds
        return Math.floor(date.getTime() / 1000);
      }
    } catch (e) {
      console.warn('Failed to parse ISO8601 time:', timeStr, e);
    }
  }
  
  // Handle HH:MM format (minutes since midnight)
  const time = timeStr.split(':');
  if (time.length === 2) {
    return parseInt(time[0]) * 60 + parseInt(time[1]);
  }
  
  return 0;
}

// Helper to get location string from row and mapping config
function getLocationString(row: string[], mapConfig: any, prefix: string = 'location') {
  // Try combined field first
  const combined = mapConfig.dataMappings.find((m: any) =>
    m.value === `${prefix}#latLng` ||
    m.value === `${prefix}#lngLat` ||
    m.value === `${prefix}_lat_lng` ||
    m.value === `${prefix}_lng_lat` ||
    m.value === prefix
  );
  if (combined) {
    return row[combined.index];
  }
  // Try separate lat/lng fields
  const latMapping = mapConfig.dataMappings.find((m: any) =>
    m.value === `${prefix}#lat` || m.value === `${prefix}_lat`
  );
  const lngMapping = mapConfig.dataMappings.find((m: any) =>
    m.value === `${prefix}#lng` || m.value === `${prefix}_lng`
  );
  if (latMapping && lngMapping) {
    const lat = row[latMapping.index];
    const lng = row[lngMapping.index];
    if (lat && lng) return `${lat},${lng}`;
  }
  return null;
}

// Build unique locations array and mapping from lat/lng string to index
function buildLocations(jobs: any, vehicles: any, jobMapConfig: any, vehicleMapConfig: any) {
  const locMap = new Map<string, number>();
  const locationStrings: string[] = [];
  let nextId = 0;

  // Helper to add a location and return its index
  function addLocation(str: string): number {
    if (!str) return -1;
    const parsed = parseLatLng(str);
    if (!parsed) return -1;
    const key = parsed.join(',');
    if (locMap.has(key)) return locMap.get(key)!;
    const id = nextId++;
    locMap.set(key, id);
    locationStrings.push(key);
    return id;
  }

  // If no selection array exists or all are false, select all rows
  const jobSelection = jobs.selection || Array(jobs.rows.length).fill(true);
  const jobHasAnySelected = jobSelection.some(Boolean);
  const jobEffectiveSelection = jobHasAnySelected ? jobSelection : Array(jobs.rows.length).fill(true);
  
  const vehicleSelection = vehicles.selection || Array(vehicles.rows.length).fill(true);
  const vehicleHasAnySelected = vehicleSelection.some(Boolean);
  const vehicleEffectiveSelection = vehicleHasAnySelected ? vehicleSelection : Array(vehicles.rows.length).fill(true);

  // Add job locations (only for selected jobs)
  jobs.rows.forEach((row: string[], index: number) => {
    // Only process if this job is selected
    if (jobEffectiveSelection[index]) {
      const locStr = getLocationString(row, jobMapConfig, 'location');
      if (locStr) addLocation(locStr);
    }
  });

  // Add vehicle start/end locations (only for selected vehicles)
  vehicles.rows.forEach((row: string[], index: number) => {
    // Only process if this vehicle is selected
    if (vehicleEffectiveSelection[index]) {
      const startLocStr = getLocationString(row, vehicleMapConfig, 'start_location');
      if (startLocStr) addLocation(startLocStr);
      const endLocStr = getLocationString(row, vehicleMapConfig, 'end_location');
      if (endLocStr) addLocation(endLocStr);
    }
  });

  return { 
    locations: {
      id: 1,
      description: "Locations from imported data",
      location: locationStrings
    }, 
    locMap 
  };
}

function normalizeJobs(jobData: any, mapConfig: any, locMap: Map<string, number>): OptimizationMvrpOrderJobV2[] {
  if (!jobData.rows || jobData.rows.length === 0) return [];
  const selectedJobs: OptimizationMvrpOrderJobV2[] = [];
  
  // If no selection array exists or all are false, select all rows
  const selection = jobData.selection || Array(jobData.rows.length).fill(true);
  const hasAnySelected = selection.some(Boolean);
  const effectiveSelection = hasAnySelected ? selection : Array(jobData.rows.length).fill(true);
  
  jobData.rows.forEach((row: string[], index: number) => {
    // Only process if this job is selected
    if (!effectiveSelection[index]) {
      return;
    }
    
    const job: OptimizationMvrpOrderJobV2 = {
      id: index + 1,
      location_index: -1,
    };
    mapConfig.dataMappings.forEach((mapping: any) => {
      const value = row[mapping.index];
      if (!value) return;
      switch (mapping.value) {
        case 'id':
          job.id = parseInt(value) || index + 1;
          break;
        case 'description':
          job.description = value;
          break;
        case 'service':
          job.service = parseInt(value);
          break;
        case 'priority':
          job.priority = parseInt(value);
          break;
        case 'setup':
          job.setup = parseInt(value);
          break;
        case 'skills':
          job.skills = value.split(',').map((s) => parseInt(s.trim())).filter((n) => !isNaN(n));
          break;
        case 'start_time':
        case 'end_time':
          if (!job.time_windows) job.time_windows = [];
          const timeInMinutes = convertTimeToMinutes(value);
          if (mapping.value === 'start_time') {
            job.time_windows.push([timeInMinutes, timeInMinutes + 60]);
          }
          break;
        case 'pickup_capacity_1':
        case 'pickup_capacity_2':
        case 'pickup_capacity_3':
          if (!job.pickup) job.pickup = [];
          const pickupIndex = parseInt(mapping.value.split('_').pop()) - 1;
          job.pickup[pickupIndex] = parseInt(value);
          break;
        case 'delivery_capacity_1':
        case 'delivery_capacity_2':
        case 'delivery_capacity_3':
          if (!job.delivery) job.delivery = [];
          const deliveryIndex = parseInt(mapping.value.split('_').pop()) - 1;
          job.delivery[deliveryIndex] = parseInt(value);
          break;
      }
    });
    // Set location_index using helper
    const locStr = getLocationString(row, mapConfig, 'location');
    if (locStr) {
      const parsed = parseLatLng(locStr);
      if (parsed) {
        const key = parsed.join(',');
        job.location_index = locMap.get(key) ?? -1;
      }
    }
    selectedJobs.push(job);
  });
  
  return selectedJobs;
}

function normalizeVehicles(vehicleData: any, mapConfig: any, locMap: Map<string, number>): VehicleType[] {
  if (!vehicleData.rows || vehicleData.rows.length === 0) return [];
  const selectedVehicles: VehicleType[] = [];
  
  // If no selection array exists or all are false, select all rows
  const selection = vehicleData.selection || Array(vehicleData.rows.length).fill(true);
  const hasAnySelected = selection.some(Boolean);
  const effectiveSelection = hasAnySelected ? selection : Array(vehicleData.rows.length).fill(true);
  
  vehicleData.rows.forEach((row: string[], index: number) => {
    // Only process if this vehicle is selected
    if (!effectiveSelection[index]) {
      return;
    }
    
    const vehicle: OptimizationMvrpOrderVehicleV2 = {
      id: index + 1,
      start_index: -1,
    };
    mapConfig.dataMappings.forEach((mapping: any) => {
      const value = row[mapping.index];
      if (!value) return;
      switch (mapping.value) {
        case 'id':
          vehicle.id = parseInt(value) || index + 1;
          break;
        case 'description':
          vehicle.description = value;
          break;
        case 'capacity_1':
        case 'capacity_2':
        case 'capacity_3':
          if (!vehicle.capacity) vehicle.capacity = [];
          const capacityIndex = parseInt(mapping.value.split('_').pop()) - 1;
          vehicle.capacity[capacityIndex] = parseInt(value);
          break;
        case 'skills':
          vehicle.skills = value.split(',').map((s) => parseInt(s.trim())).filter((n) => !isNaN(n));
          break;
        case 'max_tasks':
          vehicle.max_tasks = parseInt(value);
          break;
        case 'fixed_cost':
          if (!vehicle.costs) vehicle.costs = {};
          vehicle.costs.fixed = parseInt(value);
          break;
        case 'start_time':
        case 'end_time':
          if (!vehicle.time_window) vehicle.time_window = [0, 1440];
          const timeInMinutes = convertTimeToMinutes(value);
          if (mapping.value === 'start_time') {
            vehicle.time_window[0] = timeInMinutes;
          } else {
            vehicle.time_window[1] = timeInMinutes;
          }
          break;
      }
    });
    // Set start_index and end_index using helper
    const startLocStr = getLocationString(row, mapConfig, 'start_location');
    if (startLocStr) {
      const parsed = parseLatLng(startLocStr);
      if (parsed) {
        const key = parsed.join(',');
        vehicle.start_index = locMap.get(key) ?? -1;
      }
    }
    const endLocStr = getLocationString(row, mapConfig, 'end_location');
    if (endLocStr) {
      const parsed = parseLatLng(endLocStr);
      if (parsed) {
        const key = parsed.join(',');
        vehicle.end_index = locMap.get(key) ?? -1;
      }
    }
    selectedVehicles.push(vehicle);
  });
  
  return selectedVehicles;
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
  const [isPolling, setIsPolling] = React.useState(false);
  const [pollingMessage, setPollingMessage] = React.useState('');
  const [routeResults, setRouteResults] = React.useState<any>(null);
  const [pollInterval, setPollInterval] = React.useState<NodeJS.Timeout | null>(null);

  // Cleanup polling interval on unmount
  React.useEffect(() => {
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [pollInterval]);

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

  // Handler for canceling polling
  const handleCancelPolling = () => {
    if (pollInterval) {
      clearInterval(pollInterval);
      setPollInterval(null);
    }
    setIsPolling(false);
    setPollingMessage('Polling cancelled by user.');
  };

  // Handler for optimization request
  const handleOptimizationRequest = async () => {
    try {
      setIsOptimizing(true)
      
      // Check if at least one job and one vehicle are selected
      const jobSelection = job.selection || Array(job.rawData.rows.length).fill(true);
      const vehicleSelection = vehicle.selection || Array(vehicle.rawData.rows.length).fill(true);
      
      const selectedJobsCount = jobSelection.filter(Boolean).length;
      const selectedVehiclesCount = vehicleSelection.filter(Boolean).length;
      
      if (selectedJobsCount === 0) {
        throw new Error('Please select at least one job to optimize');
      }
      
      if (selectedVehiclesCount === 0) {
        throw new Error('Please select at least one vehicle to optimize');
      }
      
      const apiKey = process.env.NEXTBILLION_API_KEY
      if (!apiKey) {
        throw new Error('NEXTBILLION_API_KEY environment variable is required')
      }
      
      const apiClient = new ApiClient(apiKey)
      
      // Build unique locations and mapping
      const { locations, locMap } = buildLocations(job.rawData, store.inputCore.vehicle.rawData, job.mapConfig, store.inputCore.vehicle.mapConfig);
      
      console.log('Debug - Job data:', {
        rawData: job.rawData,
        selection: job.selection,
        mapConfig: job.mapConfig
      });
      console.log('Debug - Vehicle data:', {
        rawData: store.inputCore.vehicle.rawData,
        selection: store.inputCore.vehicle.selection,
        mapConfig: store.inputCore.vehicle.mapConfig
      });
      
      // Normalize the data
      const normalizedJobs = normalizeJobs(job.rawData, job.mapConfig, locMap)
      const normalizedVehicles = normalizeVehicles(store.inputCore.vehicle.rawData, store.inputCore.vehicle.mapConfig, locMap)
      
      console.log('Debug - Normalized data:', {
        jobs: normalizedJobs,
        vehicles: normalizedVehicles,
        locations: locations
      });
      
      // Build the optimization request
      const optimizationRequest: OptimizationMvrpOrderRequestV2 = {
        jobs: normalizedJobs,
        vehicles: normalizedVehicles,
        locations: locations,
      }
      
      // Send the optimization request
      const response = await apiClient.createOptimizationRequest(optimizationRequest)
      
      console.log('Optimization request successful:', response)
      
      const responseData = response.data as any
      const requestId = responseData.id
      
      if (requestId) {
        // Start polling for results
        setIsPolling(true)
        setPollingMessage('Optimization request submitted successfully! Polling for results...')
        
        // Poll every 5 seconds
        const interval = setInterval(async () => {
          try {
            const resultResponse = await apiClient.getOptimizationResult(requestId)
            const resultData = resultResponse.data as any
            
            if (resultData) {
              // Check if optimization is complete (empty message) or still processing
              if (resultData.message === "" || resultData.message === undefined) {
                // Optimization completed
                clearInterval(interval)
                setPollInterval(null)
                setIsPolling(false)
                setRouteResults(resultData)
                setPollingMessage(`Optimization completed! Found ${resultData.routes?.length || 0} routes.`)
              } else if (resultData.message === "Still processing") {
                // Continue polling - optimization still in progress
                console.log('Optimization still processing...')
              } else {
                // Other status - might be an error or different state
                console.log('Optimization status:', resultData.message)
              }
            }
          } catch (error) {
            console.error('Polling error:', error)
            // Continue polling on error (optimization might still be in progress)
          }
        }, 5000)
        
        setPollInterval(interval)
        
        // Stop polling after 10 minutes (120 polls)
        setTimeout(() => {
          clearInterval(interval)
          setPollInterval(null)
          if (isPolling) {
            setIsPolling(false)
            setPollingMessage('Polling timeout - optimization may still be in progress.')
          }
        }, 600000) // 10 minutes
      } else {
        alert('Optimization request submitted successfully!')
      }
      
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
                <strong>{orderTypeLabel}:</strong> {(store.inputCore[inputType].selection || Array(store.inputCore[inputType].rawData.rows.length).fill(true)).filter(Boolean).length} of {store.inputCore[inputType].rawData.rows.length} records selected
              </Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>
                <strong>Vehicles:</strong> {(vehicle.selection || Array(vehicle.rawData.rows.length).fill(true)).filter(Boolean).length} of {vehicle.rawData.rows.length} records selected
              </Typography>
            </Box>
            {/* Polling Status */}
            {isPolling && (
              <Box sx={{ mt: 3, p: 2, backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#1976d2' }}>
                    {pollingMessage}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleCancelPolling}
                    sx={{ 
                      color: '#d32f2f', 
                      borderColor: '#d32f2f',
                      '&:hover': {
                        borderColor: '#b71c1c',
                        backgroundColor: 'rgba(211, 47, 47, 0.04)'
                      }
                    }}
                  >
                    Cancel
                  </Button>
                </Box>
                <LinearProgress sx={{ height: 8, borderRadius: 4 }} />
              </Box>
            )}
            {/* Results Display */}
            {routeResults && (
              <Box sx={{ mt: 3, p: 2, backgroundColor: '#e8f5e8', borderRadius: '4px' }}>
                <Typography variant="body2" sx={{ color: '#2e7d32', fontWeight: 'bold', mb: 1 }}>
                  ✓ Optimization Complete
                </Typography>
                <Typography variant="body2" sx={{ color: '#2e7d32' }}>
                  {pollingMessage}
                </Typography>
                {routeResults.routes && (
                  <Typography variant="body2" sx={{ color: '#2e7d32', mt: 1 }}>
                    Total routes: {routeResults.routes.length}
                  </Typography>
                )}
              </Box>
            )}
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
            disabled={currentStep === steps.length - 1 && isOptimizing}
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