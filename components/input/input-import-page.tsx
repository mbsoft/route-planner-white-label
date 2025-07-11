'use client'

import React, { useEffect, useState, useRef } from 'react'
import { Box, Button, Typography, IconButton, LinearProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Collapse, Checkbox } from '@mui/material'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import FlagIcon from '@mui/icons-material/Flag'
import InventoryIcon from '@mui/icons-material/Inventory'
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

// Route Summary Table Component
interface RouteSummaryTableProps {
  routes: any[]
  expandedRoutes: Set<number>
  selectedRoutes: Set<number>
  onToggleRoute: (routeIndex: number) => void
  onToggleRouteSelection: (routeIndex: number) => void
  onSelectAllRoutes: () => void
  onDeselectAllRoutes: () => void
}

const RouteSummaryTable: React.FC<RouteSummaryTableProps> = ({ 
  routes, 
  expandedRoutes, 
  selectedRoutes,
  onToggleRoute, 
  onToggleRouteSelection,
  onSelectAllRoutes,
  onDeselectAllRoutes 
}) => {
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const formatDistance = (meters: number) => {
    const km = meters / 1000
    return `${km.toFixed(1)} km`
  }

  const formatTime = (timestamp: number) => {
    if (!timestamp) return 'N/A'
    return new Date(timestamp * 1000).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  const getRouteStartTime = (route: any) => {
    if (!route.steps || route.steps.length === 0) return 'N/A'
    const firstStep = route.steps[0]
    return formatTime(firstStep.arrival)
  }

  const getRouteEndTime = (route: any) => {
    if (!route.steps || route.steps.length === 0) return 'N/A'
    const lastStep = route.steps[route.steps.length - 1]
    return formatTime(lastStep.arrival)
  }

  const getStepTypeIcon = (type: string) => {
    const iconStyle = {
      width: '20px',
      height: '20px',
      color: '#1976d2',
    }
    
    switch (type) {
      case 'start': 
        return <DirectionsCarIcon sx={iconStyle} />
      case 'job': 
        return <InventoryIcon sx={iconStyle} />
      case 'pickup': 
        return <DownloadIcon sx={iconStyle} />
      case 'delivery': 
        return <UploadIcon sx={iconStyle} />
      case 'end': 
        return <FlagIcon sx={iconStyle} />
      default: 
        return <LocalShippingIcon sx={iconStyle} />
    }
  }

  // Reverse geocode cache: { 'lat,lng': address }
  const [geocodeCache, setGeocodeCache] = useState<{ [key: string]: string }>({})
  const [loadingGeocode, setLoadingGeocode] = useState<{ [key: string]: boolean }>({})
  const apiKey = process.env.NEXTBILLION_API_KEY || ''

  // Helper to fetch and cache reverse geocode
  const fetchGeocode = async (lat: number, lng: number) => {
    const key = `${lat.toFixed(6)},${lng.toFixed(6)}`
    if (geocodeCache[key] || loadingGeocode[key] || !apiKey) return
    setLoadingGeocode(prev => ({ ...prev, [key]: true }))
    try {
      const url = `https://api.nextbillion.io/revgeocode?at=${lat},${lng}&key=${apiKey}`
      const resp = await fetch(url)
      const data = await resp.json()
      if (data.items && data.items.length > 0 && data.items[0].title) {
        setGeocodeCache(prev => ({ ...prev, [key]: data.items[0].title }))
      } else {
        setGeocodeCache(prev => ({ ...prev, [key]: key }))
      }
    } catch {
      setGeocodeCache(prev => ({ ...prev, [key]: key }))
    } finally {
      setLoadingGeocode(prev => ({ ...prev, [key]: false }))
    }
  }

  // When a route is expanded, trigger geocode fetches for its steps
  useEffect(() => {
    expandedRoutes.forEach(routeIndex => {
      const route = routes[routeIndex]
      if (route && route.steps) {
        route.steps.forEach((step: any) => {
          if (Array.isArray(step.location) && step.location.length === 2) {
            const lat = step.location[0]
            const lng = step.location[1]
            fetchGeocode(lat, lng)
          }
        })
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandedRoutes, routes])

  return (
    <TableContainer component={Paper} sx={{ mt: 2, maxHeight: 600 }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: 50 }}>
              <Checkbox
                checked={selectedRoutes.size === routes.length && routes.length > 0}
                indeterminate={selectedRoutes.size > 0 && selectedRoutes.size < routes.length}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  if (e.target.checked) {
                    onSelectAllRoutes();
                  } else {
                    onDeselectAllRoutes();
                  }
                }}
              />
            </TableCell>
            <TableCell sx={{ width: 50 }}></TableCell>
            <TableCell><strong>Vehicle</strong></TableCell>
            <TableCell><strong>Description</strong></TableCell>
            <TableCell><strong>Start Time</strong></TableCell>
            <TableCell><strong>End Time</strong></TableCell>
            <TableCell><strong>Stops</strong></TableCell>
            <TableCell><strong>Distance</strong></TableCell>
            <TableCell><strong>Drive Time</strong></TableCell>
            <TableCell><strong>Cost</strong></TableCell>
            <TableCell><strong>Load</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {routes.map((route, routeIndex) => (
            <React.Fragment key={routeIndex}>
              <TableRow 
                hover 
                sx={{ 
                  cursor: 'pointer',
                  backgroundColor: expandedRoutes.has(routeIndex) ? '#f5f5f5' : 'inherit'
                }}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedRoutes.has(routeIndex)}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      e.stopPropagation();
                      onToggleRouteSelection(routeIndex);
                    }}
                  />
                </TableCell>
                <TableCell onClick={() => onToggleRoute(routeIndex)}>
                  <IconButton size="small">
                    {expandedRoutes.has(routeIndex) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </TableCell>
                <TableCell onClick={() => onToggleRoute(routeIndex)}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {route.vehicle}
                  </Typography>
                </TableCell>
                <TableCell onClick={() => onToggleRoute(routeIndex)}>
                  <Typography variant="body2">
                    {route.description || 'No description'}
                  </Typography>
                </TableCell>
                <TableCell onClick={() => onToggleRoute(routeIndex)}>
                  <Typography variant="body2">
                    {getRouteStartTime(route)}
                  </Typography>
                </TableCell>
                <TableCell onClick={() => onToggleRoute(routeIndex)}>
                  <Typography variant="body2">
                    {getRouteEndTime(route)}
                  </Typography>
                </TableCell>
                <TableCell onClick={() => onToggleRoute(routeIndex)}>
                  <Typography variant="body2">
                    {route.steps ? route.steps.length - 2 : 0} stops
                  </Typography>
                </TableCell>
                <TableCell onClick={() => onToggleRoute(routeIndex)}>
                  <Typography variant="body2">
                    {formatDistance(route.distance || 0)}
                  </Typography>
                </TableCell>
                <TableCell onClick={() => onToggleRoute(routeIndex)}>
                  <Typography variant="body2">
                    {formatDuration(route.duration || 0)}
                  </Typography>
                </TableCell>
                <TableCell onClick={() => onToggleRoute(routeIndex)}>
                  <Typography variant="body2">
                    {route.cost || 0}
                  </Typography>
                </TableCell>
                <TableCell onClick={() => onToggleRoute(routeIndex)}>
                  <Typography variant="body2">
                    {route.delivery && route.delivery.length > 0 ? 
                      `Del: ${route.delivery.join(', ')}` : 
                      route.pickup && route.pickup.length > 0 ? 
                        `Pick: ${route.pickup.join(', ')}` : 
                        'Empty'
                    }
                  </Typography>
                </TableCell>
              </TableRow>
              
              {/* Expanded details */}
              <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={10}>
                  <Collapse in={expandedRoutes.has(routeIndex)} timeout="auto" unmountOnExit>
                    <Box sx={{ margin: 1 }}>
                      <Typography variant="h6" gutterBottom component="div">
                        Route Details
                      </Typography>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell><strong>Type</strong></TableCell>
                            <TableCell><strong>Description</strong></TableCell>
                            <TableCell><strong>Location</strong></TableCell>
                            <TableCell><strong>Arrival</strong></TableCell>
                            <TableCell><strong>Service</strong></TableCell>
                            <TableCell><strong>Load</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {route.steps && route.steps.map((step: any, stepIndex: number) => (
                            <TableRow key={stepIndex}>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {getStepTypeIcon(step.type)}
                                  {step.type !== 'job' && <span>{step.type?.toUpperCase() || 'N/A'}</span>}
                                </Box>
                              </TableCell>
                              <TableCell>
                                {step.description || 'N/A'}
                              </TableCell>
                              <TableCell>
                                {step.location && step.location.length === 2 ? (
                                  geocodeCache[`${step.location[0].toFixed(6)},${step.location[1].toFixed(6)}`]
                                    ? geocodeCache[`${step.location[0].toFixed(6)},${step.location[1].toFixed(6)}`]
                                    : loadingGeocode[`${step.location[0].toFixed(6)},${step.location[1].toFixed(6)}`]
                                      ? <span style={{color:'#aaa'}}>Loading...</span>
                                      : `${step.location[0].toFixed(4)}, ${step.location[1].toFixed(4)}`
                                ) : (step.id || 'N/A')}
                              </TableCell>
                              <TableCell>
                                {step.arrival ? 
                                  new Date(step.arrival * 1000).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false }) : 
                                  'N/A'
                                }
                              </TableCell>
                              <TableCell>
                                {step.service ? formatDuration(step.service) : '-'}
                              </TableCell>
                              <TableCell>
                                {step.load && step.load.length > 0 ? step.load.join(', ') : '-'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Box>
                  </Collapse>
                </TableCell>
              </TableRow>
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
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
  onRouteResultsChange?: (routes: any) => void
}

export const InputImportPage = ({ currentStep, onStepChange, preferences, onPreferencesChange, onRouteResultsChange }: InputImportPageProps) => {
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
          geometry: route.geometry,
          cost: route.cost,
          distance: route.distance,
          duration: route.duration,
          steps: route.steps
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
    console.log('handleRepeatToAll called:', { row, col, value, isEditing })
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
        selectionLength: job.selection?.length,
        rowsLength: job.rawData.rows.length,
        mapConfig: job.mapConfig
      });
      console.log('Debug - Vehicle data:', {
        rawData: store.inputCore.vehicle.rawData,
        selection: store.inputCore.vehicle.selection,
        selectionLength: store.inputCore.vehicle.selection?.length,
        rowsLength: store.inputCore.vehicle.rawData.rows.length,
        mapConfig: store.inputCore.vehicle.mapConfig
      });
      
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
            })
          }
        }
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
                // Reset expanded routes when new results come in
                setExpandedRoutes(new Set())
                setPollingMessage(`Optimization completed! Found ${resultData.result?.routes?.length || 0} routes.`)
                
                // Convert route results to RouteData format and pass to parent
                if (resultData.result?.routes && onRouteResultsChange) {
                  const routeData = resultData.result.routes.map((route: any) => ({
                    vehicle: route.vehicle,
                    geometry: route.geometry,
                    cost: route.cost,
                    distance: route.distance,
                    duration: route.duration,
                    steps: route.steps
                  }))
                  onRouteResultsChange(routeData)
                  // Initialize all routes as selected by default
                  setSelectedRoutes(new Set(routeData.map((_: any, i: number) => i)))
                }
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
            <Box sx={{ mt: 4, position: 'relative' }}>
              <ErrorPanel
                errors={store.inputCore.errors[inputType]}
                style={{
                  position: 'absolute',
                  top: '65px',
                  right: '120px',
                  zIndex: 100,
                }}
                onItemHover={() => {}}
              />
              <DataMapperTable
                inputType={inputType}
                isEditing={isEditing}
                highlightCell={null}
                onCellChange={handleCellChange}
                onRepeatToAll={handleRepeatToAll}
                rows={isEditing ? editRows : store.inputCore[inputType].rawData.rows}
                attachedRows={isEditing ? editAttachedRows : store.inputCore[inputType].rawData.attachedRows}
                header={store.inputCore[inputType].rawData.header}
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

  return (
    <Box sx={{ display: 'flex', gap: 2, height: '100%' }}>
      <InputImportStepper currentStep={currentStep} onStepChange={onStepChange} />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {saveError && (
          <Box sx={{ color: 'red', mb: 2 }}>{saveError}</Box>
        )}
        {renderStepContent()}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
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