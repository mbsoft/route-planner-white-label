'use client'

import React, { useEffect, useState, useRef } from 'react'
import { Box, Button, Typography, IconButton, LinearProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Collapse, Checkbox } from '@mui/material'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import FlagIcon from '@mui/icons-material/Flag'
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation'
import DownloadIcon from '@mui/icons-material/Download'
import UploadIcon from '@mui/icons-material/Upload'
import { InputOrderPanel } from './input-panels/input-order'
import { InputVehiclePanel } from './input-panels/input-vehicle'
import { InputImportStepper } from './input-import-stepper'
import { PreferencesPage, PreferencesInput } from './input-panels/preferences-page'
import { useInputStore } from '../../models/input/store'
import { DataMapper } from './data-mapper/data-mapper'
import { DataMapperTable } from './data-mapper/data-mapper-table'
import ErrorPanel from './data-mapper/error-panel'
import { useUseCase } from '../../utils/use-case'
import { ApiClient } from '../../utils/api-client'
import ReplayIcon from '@mui/icons-material/Replay';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import { usePreferencesPersistence } from '../../hooks/use-preferences-persistence'
import { RouteSummaryTable } from '../common/route-summary-table'
import { useWhiteLabelContext } from '../../app/white-label-layout'

// Types for optimization API
interface OptimizationMvrpOrderJobV2 {
  id: string
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
  id: string | number
  start_index: number
  end_index?: number
  capacity?: number[]
  alternative_capacities?: number[][]
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
  options?: {
    objective?: {
      travel_cost?: string
      custom?: {
        type?: string
        value?: string
      }
    }
    constraint?: {
      max_vehicle_overtime?: number
      max_visit_lateness?: number
      max_activity_waiting_time?: number
    }
    routing?: {
      mode?: string
      traffic_timestamp?: number
      truck_size?: string
      truck_weight?: number
    }
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

  // Only process explicitly selected rows, ensure selection arrays are properly initialized
  const jobSelection = jobs.selection && jobs.selection.length === jobs.rows.length 
    ? jobs.selection 
    : Array(jobs.rows.length).fill(true);
  const vehicleSelection = vehicles.selection && vehicles.selection.length === vehicles.rows.length 
    ? vehicles.selection 
    : Array(vehicles.rows.length).fill(true);

  // Add job locations (only for selected jobs)
  jobs.rows.forEach((row: string[], index: number) => {
    // Only process if this job is explicitly selected
    if (jobSelection[index]) {
      const locStr = getLocationString(row, jobMapConfig, 'location');
      if (locStr) addLocation(locStr);
    }
  });

  // Add vehicle start/end locations (only for selected vehicles)
  vehicles.rows.forEach((row: string[], index: number) => {
    // Only process if this vehicle is explicitly selected
    if (vehicleSelection[index]) {
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
  
  // Only process explicitly selected rows, ensure selection array is properly initialized
  const selection = jobData.selection && jobData.selection.length === jobData.rows.length 
    ? jobData.selection 
    : Array(jobData.rows.length).fill(true);
  
  jobData.rows.forEach((row: string[], index: number) => {
    // Only process if this job is explicitly selected
    if (!selection[index]) {
      return;
    }
    
    const job: OptimizationMvrpOrderJobV2 = {
      id: (index + 1).toString(),
      location_index: -1,
    };
    mapConfig.dataMappings.forEach((mapping: any) => {
      const value = row[mapping.index];
      if (!value) return;
      
      switch (mapping.value) {
        case 'id':
          job.id = value || (index + 1).toString();
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
        case 'pickup':
          try {
            // Handle both JSON array format and comma-separated string
            let pickupArray: number[];
            if (value.startsWith('[') && value.endsWith(']')) {
              // JSON array format
              pickupArray = JSON.parse(value);
            } else {
              // Comma-separated string format
              pickupArray = value.split(',').map(v => parseInt(v.trim())).filter(n => !isNaN(n));
            }
            if (Array.isArray(pickupArray) && pickupArray.length > 0) {
              job.pickup = pickupArray;
            }
          } catch (error) {
            console.warn('Failed to parse pickup array:', value);
          }
          break;
        case 'delivery_capacity_1':
        case 'delivery_capacity_2':
        case 'delivery_capacity_3':
          if (!job.delivery) job.delivery = [];
          const deliveryIndex = parseInt(mapping.value.split('_').pop()) - 1;
          job.delivery[deliveryIndex] = parseInt(value);
          break;
        case 'delivery':
          try {
            // Handle both JSON array format and comma-separated string
            let deliveryArray: number[];
            if (value.startsWith('[') && value.endsWith(']')) {
              // JSON array format
              deliveryArray = JSON.parse(value);
            } else {
              // Comma-separated string format
              deliveryArray = value.split(',').map(v => parseInt(v.trim())).filter(n => !isNaN(n));
            }
            if (Array.isArray(deliveryArray) && deliveryArray.length > 0) {
              job.delivery = deliveryArray;
            }
          } catch (error) {
            console.warn('Failed to parse delivery array:', value);
          }
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
  
  // Only process explicitly selected rows, ensure selection array is properly initialized
  const selection = vehicleData.selection && vehicleData.selection.length === vehicleData.rows.length 
    ? vehicleData.selection 
    : Array(vehicleData.rows.length).fill(true);
  
  vehicleData.rows.forEach((row: string[], index: number) => {
    // Only process if this vehicle is explicitly selected
    if (!selection[index]) {
      return;
    }
    
    const vehicle: OptimizationMvrpOrderVehicleV2 = {
      id: (index + 1).toString(),
      start_index: -1,
    };
    mapConfig.dataMappings.forEach((mapping: any) => {
      const value = row[mapping.index];
      if (!value) return;
      switch (mapping.value) {
        case 'id':
          vehicle.id = value || (index + 1).toString();
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
        case 'capacity':
          try {
            const parsedCapacity = JSON.parse(value);
            if (Array.isArray(parsedCapacity)) {
              vehicle.capacity = parsedCapacity;
            }
          } catch (error) {
            console.warn('Failed to parse capacity array:', value);
          }
          break;
        case 'alternative_capacities':
          try {
            const parsedAlternativeCapacities = JSON.parse(value);
            if (Array.isArray(parsedAlternativeCapacities)) {
              vehicle.alternative_capacities = parsedAlternativeCapacities;
            }
          } catch (error) {
            console.warn('Failed to parse alternative_capacities array:', value);
          }
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
  'Review & Run',
]

interface InputImportPageProps {
  currentStep: number
  onStepChange: (nextStep: number) => void
  preferences?: PreferencesInput
  onPreferencesChange?: (preferences: PreferencesInput) => void
  onRouteResultsChange?: (routes: any) => void
  onOptimizationComplete?: (jobId: string) => void
}

export const InputImportPage = ({ currentStep, onStepChange, preferences, onPreferencesChange, onRouteResultsChange, onOptimizationComplete }: InputImportPageProps) => {
  const store = useInputStore()
  const { job, vehicle, shipment } = store.inputCore
  const useCase = useUseCase()
  const inputType = useCase === 'jobs' ? 'job' : 'shipment'
  const orderTypeLabel = useCase === 'jobs' ? 'Jobs' : 'Shipments'
  const { apiKey } = useWhiteLabelContext()

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
  const { savePreferences } = usePreferencesPersistence();
  const [isSavingPreferences, setIsSavingPreferences] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);

  // State for expanded routes in RouteSummaryTable
  const [expandedRoutes, setExpandedRoutes] = React.useState<Set<number>>(new Set());
  const [selectedRoutes, setSelectedRoutes] = React.useState<Set<number>>(new Set());

  // Cleanup polling interval on unmount
  React.useEffect(() => {
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [pollInterval]);

  // Update route data passed to parent when selection changes
  React.useEffect(() => {
    if (routeResults?.result?.routes && onRouteResultsChange) {
      const selectedRouteData = routeResults.result.routes
        .filter((_: any, index: number) => selectedRoutes.has(index))
        .map((route: any) => ({
          vehicle: route.vehicle,
          cost: route.cost,
          distance: route.distance,
          duration: route.duration,
          steps: route.steps,
          delivery: route.delivery,
          pickup: route.pickup
        }))
      onRouteResultsChange(selectedRouteData)
    }
  }, [selectedRoutes, routeResults, onRouteResultsChange])

  // Handlers for editing
  const handleEdit = () => {
    setEditRows(store.inputCore[inputType].rawData.rows.map(row => [...row]))
    setEditAttachedRows(store.inputCore[inputType].rawData.attachedRows.map(row => [...row]))
    setIsEditing(true)
    store.inputPhase.setIsTableEditable(true)
  }
  const handleCancel = () => {
    setIsEditing(false)
    setEditRows([])
    setEditAttachedRows([])
    store.inputPhase.setIsTableEditable(false)
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
    store.inputPhase.setIsTableEditable(false)
  }
  const handleCellChange = (row: number, col: number, value: string) => {
    setEditRows(prev => {
      const updated = prev.map(r => [...r])
      if (updated[row]) updated[row][col] = value
      return updated
    })
  }
  const handleRepeatToAll = (row: number, col: number, value: string) => {
    if (isEditing) {
      setEditRows(prev => {
        const updated = prev.map(r => [...r])
        for (let i = 0; i < updated.length; i++) {
          updated[i][col] = value
        }
        return updated
      })
    } else {
      const newRows = store.inputCore[inputType].rawData.rows.map((r, i) => {
        const updated = [...r]
        updated[col] = value
        return updated
      })
      store.inputCore.setRawData(inputType, {
        header: store.inputCore[inputType].rawData.header,
        rows: newRows,
        attachedRows: store.inputCore[inputType].rawData.attachedRows,
      })
    }
  }

  // Handler for deleting an attribute column
  const handleDeleteAttributeColumn = (colIndex: number) => {
    if (isEditing) {
      setEditAttachedRows(prev => prev.map(row => row.filter((_, i) => i !== colIndex)))
    } else {
      store.inputCore.deleteAttachedColumn(inputType, colIndex)
    }
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
    setRouteResults(null); // Clear any partial results
    setPollingMessage('Polling cancelled by user.');
  };

  // Handler for optimization request
  const handleOptimizationRequest = async () => {
    let optimizationStartTime: number | null = null;
    try {
      setIsOptimizing(true)
      // Clear any prior optimization results
      setRouteResults(null)
      setPollingMessage('')
      
      // Check if at least one job and one vehicle are selected
      // Ensure selection arrays are properly initialized
      const jobSelection = job.selection && job.selection.length === job.rawData.rows.length 
        ? job.selection 
        : Array(job.rawData.rows.length).fill(true);
      const vehicleSelection = vehicle.selection && vehicle.selection.length === vehicle.rawData.rows.length 
        ? vehicle.selection 
        : Array(vehicle.rawData.rows.length).fill(true);
      
      const selectedJobsCount = jobSelection.filter(Boolean).length;
      const selectedVehiclesCount = vehicleSelection.filter(Boolean).length;
      
      if (selectedJobsCount === 0) {
        throw new Error('Please select at least one job to optimize');
      }
      
      if (selectedVehiclesCount === 0) {
        throw new Error('Please select at least one vehicle to optimize');
      }
      
      if (!apiKey) {
        throw new Error('NEXTBILLION_API_KEY environment variable is required')
      }
      
      const apiClient = new ApiClient(apiKey)
      
      // Build unique locations and mapping
      const { locations, locMap } = buildLocations(job.rawData, store.inputCore.vehicle.rawData, job.mapConfig, store.inputCore.vehicle.mapConfig);
      
      // Normalize the data
      const normalizedJobs = normalizeJobs(
        { ...job.rawData, selection: job.selection },
        job.mapConfig,
        locMap
      )
      const normalizedVehicles = normalizeVehicles(
        { ...store.inputCore.vehicle.rawData, selection: store.inputCore.vehicle.selection },
        store.inputCore.vehicle.mapConfig,
        locMap
      )
      
      // Build the optimization request
      const optimizationRequest: OptimizationMvrpOrderRequestV2 = {
        jobs: normalizedJobs,
        vehicles: normalizedVehicles,
        locations: locations,
        options: {
          objective: {
            travel_cost: (preferences?.objective?.travel_cost && 
              ['duration', 'distance', 'air_distance', 'customized'].includes(preferences.objective.travel_cost)) 
              ? preferences.objective.travel_cost 
              : 'duration',
            ...(preferences?.objective?.custom && {
              custom: {
                type: preferences.objective.custom.type || 'min',
                value: preferences.objective.custom.value || 'vehicles'
              }
            })
          },
          constraint: {
            max_vehicle_overtime: preferences?.constraints?.max_vehicle_overtime || 0,
            max_visit_lateness: preferences?.constraints?.max_visit_lateness || 0,
            max_activity_waiting_time: preferences?.constraints?.max_activity_waiting_time || 0
          },
          routing: {
            mode: preferences?.routing?.mode || 'car',
            ...(preferences?.routing?.traffic_timestamps && {
              traffic_timestamp: Math.floor(new Date(preferences.routing.traffic_timestamps).getTime() / 1000)
            }),
            ...(preferences?.routing?.mode === 'truck' && preferences?.routing?.truck_size && {
              truck_size: preferences.routing.truck_size
            }),
            ...(preferences?.routing?.mode === 'truck' && preferences?.routing?.truck_weight && {
              truck_weight: preferences.routing.truck_weight
            }),
            ...(preferences?.routing?.mode === 'truck' && preferences?.routing?.hazmat_type && preferences.routing.hazmat_type.length > 0 && {
              hazmat_type: preferences.routing.hazmat_type
            }),
            ...(preferences?.routing?.avoid && preferences.routing.avoid.length > 0 && {
              avoid: preferences.routing.avoid
            })
          }
        }
      }
      
      // Before sending the optimization request
      optimizationStartTime = Date.now();
      const response = await apiClient.createOptimizationRequest(optimizationRequest)
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
                // Reset expanded routes when new results come in
                setExpandedRoutes(new Set())
                setPollingMessage(`Optimization completed! Found ${resultData.result?.routes?.length || 0} routes.`)
                
                // Save optimization results to Turso storage
                try {
                  // Generate a unique job ID based on the current job data
                  const jobIds = normalizedJobs.map(job => job.id).join(',');
                  const jobId = jobIds.length > 50 ? jobIds.substring(0, 50) + '...' : jobIds;
                  
                  // Generate title from optimization results
                  const dateTime = new Date().toLocaleString();
                  const routes = resultData.result?.routes?.length || 0;
                  const unassigned = resultData.result?.summary?.unassigned || 0;
                  const duration = resultData.result?.summary?.duration || 0;
                  const title = `${dateTime}|Routes: ${routes}|Unassigned: ${unassigned}|Duration: ${duration}`;
                  
                  // Create shared URL for the optimization result
                  let sharedUrl = null;
                  try {
                    console.log('Creating shared URL for request ID:', requestId);
                    const sharedResponse = await apiClient.createSharedResult(requestId);
                    console.log('Shared response:', sharedResponse);
                    
                    // If the shared result was created successfully, construct the shared URL
                    if ((sharedResponse.data as any)?.message === "Create shared result successfully") {
                      const sharedResultId = (sharedResponse.data as any)?.id || requestId;
                      sharedUrl = `https://console.nextbillion.ai/route-planner-viewer?id=${sharedResultId}&host=api.nextbillion.io`;
                      console.log('Shared URL constructed:', sharedUrl);
                    } else {
                      console.log('Shared result creation failed or returned unexpected response');
                    }
                  } catch (sharedError) {
                    console.error('Failed to create shared URL:', sharedError);
                    console.error('Shared URL error details:', sharedError);
                    // Don't fail the optimization if shared URL creation fails
                  }
                  
                  // Calculate solution_time
                  let solutionTime = null;
                  if (optimizationStartTime) {
                    solutionTime = (Date.now() - optimizationStartTime) / 1000;
                  }
                  await fetch('/api/optimization-results', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      id: requestId,
                      job_id: jobId,
                      title: title,
                      response_data: resultData,
                      shared_url: sharedUrl,
                      status: 'completed',
                      solution_time: solutionTime
                    }),
                  });
                  console.log('Optimization results saved to Turso storage');
                  
                  // Navigate to analysis page with the completed optimization
                  if (onOptimizationComplete) {
                    onOptimizationComplete(jobId);
                  }
                } catch (error) {
                  console.error('Failed to save optimization results:', error);
                  // Don't fail the optimization if storage fails
                }
                
                // Convert route results to RouteData format and pass to parent
                if (resultData.result?.routes && onRouteResultsChange) {
                  const routeData = resultData.result.routes.map((route: any) => ({
                    vehicle: route.vehicle,
                    cost: route.cost,
                    distance: route.distance,
                    duration: route.duration,
                    steps: route.steps,
                    delivery: route.delivery,
                    pickup: route.pickup
                  }))
                  onRouteResultsChange(routeData)
                  // Initialize all routes as selected by default
                  setSelectedRoutes(new Set(routeData.map((_: any, i: number) => i)))
                }
              } else if (resultData.message === "Still processing") {
                // Continue polling - optimization still in progress
              } else {
                // Other status - might be an error or different state
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
      console.error('=== OPTIMIZATION REQUEST FAILED ===');
      console.error('Error details:', error);
      console.error('Optimization request failed:', error)
      alert('Optimization request failed: ' + (error as Error).message)
    } finally {
      setIsOptimizing(false)
    }
  }

  // Handler for Next/Run Optimization button
  const handleNextOrRun = async () => {
    setSaveError(null);
    if (preferences) {
      setIsSavingPreferences(true);
      try {
        await savePreferences(preferences);
      } catch (err: any) {
        setSaveError('Failed to save preferences. Please try again.');
        setIsSavingPreferences(false);
        return;
      }
      setIsSavingPreferences(false);
    }
    if (currentStep === steps.length - 1) {
      handleOptimizationRequest();
    } else {
      onStepChange(Math.min(steps.length - 1, currentStep + 1));
    }
  };

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
        // Jobs/Shipments step: always show the InputOrderPanel to handle database saves properly
        return <InputOrderPanel />;
      case 2:
        return <InputVehiclePanel />
      case 3:
        return (
          <Box sx={{ p: 2 }}>
            <h3 style={{ color: '#585656', fontSize: '16px', fontWeight: 500 }}>Review & Run</h3>
            <p style={{ color: '#666', fontSize: '14px' }}>
              All data has been imported and mapped. You can now review the data and proceed with route optimization.
            </p>
            <Box sx={{ mt: 2, p: 2, backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
              <Typography variant="body2" sx={{ color: '#666' }}>
                <strong>{orderTypeLabel}:</strong> {(store.inputCore[inputType].selection || []).filter(Boolean).length} of {store.inputCore[inputType].rawData.rows.length} records selected
              </Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>
                <strong>Vehicles:</strong> {(vehicle.selection || []).filter(Boolean).length} of {vehicle.rawData.rows.length} records selected
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
                    onClick={handleCancelPolling}
                    sx={{ 
                      color: '#d32f2f', 
                      borderColor: '#d32f2f',
                      minWidth: '80px',
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

            
            {/* Route Summary Table */}
            {routeResults?.result?.routes && (
              <RouteSummaryTable
                routes={routeResults.result.routes}
                expandedRoutes={expandedRoutes}
                selectedRoutes={selectedRoutes}
                onToggleRoute={(index) => {
                  setExpandedRoutes(prev => {
                    const newSet = new Set(prev);
                    if (newSet.has(index)) {
                      newSet.delete(index);
                    } else {
                      newSet.add(index);
                    }
                    return newSet;
                  });
                }}
                onToggleRouteSelection={(index) => {
                  setSelectedRoutes(prev => {
                    const newSet = new Set(prev);
                    if (newSet.has(index)) {
                      newSet.delete(index);
                    } else {
                      newSet.add(index);
                    }
                    return newSet;
                  });
                }}
                                 onSelectAllRoutes={() => {
                   setSelectedRoutes(new Set(routeResults.result.routes.map((_: any, i: number) => i)));
                 }}
                onDeselectAllRoutes={() => {
                  setSelectedRoutes(new Set());
                }}
              />
            )}
          </Box>
        )
      default:
        return null
    }
  }

  // Remove renderMapping and showMapping logic for jobs step, since mapping is now inside the card

  // Determine if data has been imported and mapped
  const hasJobsData = store.inputCore[inputType].rawData.rows.length > 0;
  const hasVehiclesData = vehicle.rawData.rows.length > 0;
  const hasJobsMapping = job.mapConfig.dataMappings.length > 0;
  const hasVehiclesMapping = vehicle.mapConfig.dataMappings.length > 0;

  return (
    <Box sx={{ display: 'flex', gap: 2, height: '100%' }}>
      <InputImportStepper 
        currentStep={currentStep} 
        onStepChange={onStepChange}
        hasJobsData={hasJobsData}
        hasVehiclesData={hasVehiclesData}
        hasJobsMapping={hasJobsMapping}
        hasVehiclesMapping={hasVehiclesMapping}
      />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {saveError && (
          <Box sx={{ color: 'red', mb: 2 }}>{saveError}</Box>
        )}
        {renderStepContent()}
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2, mt: 4 }}>
          <Button
            variant="outlined"
            disabled={currentStep === 0 || isSavingPreferences}
            onClick={() => onStepChange(Math.max(0, currentStep - 1))}
          >
            Back
          </Button>
          <Button
            variant="contained"
            disabled={(currentStep === steps.length - 1 && isOptimizing) || isSavingPreferences}
            onClick={handleNextOrRun}
          >
            {isSavingPreferences
              ? 'Saving...'
              : currentStep === steps.length - 1
                ? (isOptimizing ? 'Optimizing...' : 'Run Optimization')
                : 'Next'}
          </Button>
        </Box>
      </Box>
    </Box>
  )
} 