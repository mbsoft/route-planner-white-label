'use client'

import React, { useEffect, useState } from 'react'
import { 
  Box, 
  Typography, 
  IconButton, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Collapse, 
  Checkbox 
} from '@mui/material'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import FlagIcon from '@mui/icons-material/Flag'
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation'
import DownloadIcon from '@mui/icons-material/Download'
import UploadIcon from '@mui/icons-material/Upload'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
// Removed timeline imports
import { useWhiteLabelContext } from '../../app/white-label-layout'

// Route Summary Table Component
interface RouteSummaryTableProps {
  routes: any[]
  expandedRoutes?: Set<number>
  selectedRoutes?: Set<number>
  onToggleRoute?: (routeIndex: number) => void
  onToggleRouteSelection?: (routeIndex: number) => void
  onSelectAllRoutes?: () => void
  onDeselectAllRoutes?: () => void
  showSelection?: boolean
  maxHeight?: number
}

export const RouteSummaryTable: React.FC<RouteSummaryTableProps> = ({ 
  routes, 
  expandedRoutes = new Set(), 
  selectedRoutes = new Set(),
  onToggleRoute, 
  onToggleRouteSelection,
  onSelectAllRoutes,
  onDeselectAllRoutes,
  showSelection = true,
  maxHeight = 600
}) => {
  const { companyColor, apiKey } = useWhiteLabelContext()

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
      color: companyColor,
    }
    
    switch (type) {
      case 'start': 
        return <DirectionsCarIcon sx={iconStyle} />
      case 'job': 
        return <LocalGasStationIcon sx={iconStyle} />
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
  const [pendingGeocodes, setPendingGeocodes] = useState<Set<string>>(new Set())

  // Helper to fetch and cache reverse geocode with rate limiting
  const fetchGeocode = async (lat: number, lng: number) => {
    const key = `${lat.toFixed(6)},${lng.toFixed(6)}`
    if (geocodeCache[key] || loadingGeocode[key] || pendingGeocodes.has(key) || !apiKey) return
    
    // Add to pending set to prevent duplicate requests
    setPendingGeocodes(prev => new Set(prev).add(key))
    setLoadingGeocode(prev => ({ ...prev, [key]: true }))
    
    try {
      // Add a small delay to prevent overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 100))
      
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
      setPendingGeocodes(prev => {
        const newSet = new Set(prev)
        newSet.delete(key)
        return newSet
      })
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

  const handleToggleRoute = (routeIndex: number) => {
    if (onToggleRoute) {
      onToggleRoute(routeIndex)
    }
  }

  const handleToggleRouteSelection = (routeIndex: number) => {
    if (onToggleRouteSelection) {
      onToggleRouteSelection(routeIndex)
    }
  }

  const handleSelectAllRoutes = () => {
    if (onSelectAllRoutes) {
      onSelectAllRoutes()
    }
  }

  const handleDeselectAllRoutes = () => {
    if (onDeselectAllRoutes) {
      onDeselectAllRoutes()
    }
  }

  return (
    <TableContainer component={Paper} sx={{ mt: 2, maxHeight }}>
      <Table stickyHeader sx={{ tableLayout: 'fixed' }}>
        <TableHead>
          <TableRow>
            {showSelection && (
              <TableCell sx={{ width: 50, minWidth: 50 }}>
                <Checkbox
                  checked={selectedRoutes.size === routes.length && routes.length > 0}
                  indeterminate={selectedRoutes.size > 0 && selectedRoutes.size < routes.length}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    if (e.target.checked) {
                      handleSelectAllRoutes();
                    } else {
                      handleDeselectAllRoutes();
                    }
                  }}
                />
              </TableCell>
            )}
            <TableCell sx={{ width: 50, minWidth: 50 }}></TableCell>
            <TableCell sx={{ width: 120, minWidth: 120 }}><strong>Vehicle</strong></TableCell>
            <TableCell sx={{ width: 150, minWidth: 150 }}><strong>Description</strong></TableCell>
            <TableCell sx={{ width: 100, minWidth: 100 }}><strong>Start</strong></TableCell>
            <TableCell sx={{ width: 100, minWidth: 100 }}><strong>End</strong></TableCell>
            <TableCell sx={{ width: 80, minWidth: 80 }}><strong>Stops</strong></TableCell>
            <TableCell sx={{ width: 100, minWidth: 100 }}><strong>Distance</strong></TableCell>
            <TableCell sx={{ width: 100, minWidth: 100 }}><strong>Drive</strong></TableCell>
            <TableCell sx={{ width: 120, minWidth: 120 }}><strong>Delivery</strong></TableCell>
            <TableCell sx={{ width: 140, minWidth: 140 }}><strong>Departure</strong></TableCell>
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
                {showSelection && (
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedRoutes.has(routeIndex)}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        e.stopPropagation();
                        handleToggleRouteSelection(routeIndex);
                      }}
                    />
                  </TableCell>
                )}
                <TableCell onClick={() => handleToggleRoute(routeIndex)}>
                  <IconButton size="small">
                    {expandedRoutes.has(routeIndex) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </TableCell>
                <TableCell onClick={() => handleToggleRoute(routeIndex)}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {route.vehicle}
                  </Typography>
                </TableCell>
                <TableCell onClick={() => handleToggleRoute(routeIndex)}>
                  <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {route.description || 'No description'}
                  </Typography>
                </TableCell>
                <TableCell onClick={() => handleToggleRoute(routeIndex)}>
                  <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {getRouteStartTime(route)}
                  </Typography>
                </TableCell>
                <TableCell onClick={() => handleToggleRoute(routeIndex)}>
                  <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {getRouteEndTime(route)}
                  </Typography>
                </TableCell>
                <TableCell onClick={() => handleToggleRoute(routeIndex)}>
                  <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {route.steps ? route.steps.length - 2 : 0} stops
                  </Typography>
                </TableCell>
                <TableCell onClick={() => handleToggleRoute(routeIndex)}>
                  <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {formatDistance(route.distance || 0)}
                  </Typography>
                </TableCell>
                <TableCell onClick={() => handleToggleRoute(routeIndex)}>
                  <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {formatDuration(route.duration || 0)}
                  </Typography>
                </TableCell>
                <TableCell onClick={() => handleToggleRoute(routeIndex)}>
                  {route.delivery && route.delivery.length >= 2 ? (
                    <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <Typography variant="caption" sx={{ display: 'block', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        ULSD Clear: {route.delivery[0]} gal
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        ULSD Dyed: {route.delivery[1]} gal
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', fontWeight: 'bold', color: companyColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        Total: {route.delivery[0] + route.delivery[1] + route.delivery[2] + route.delivery[3] + route.delivery[4]} gal
                      </Typography>
                    </Box>
                  ) : route.delivery && route.delivery.length > 0 ? (
                    <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {route.delivery.join(', ')}
                    </Typography>
                  ) : (
                    <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      -
                    </Typography>
                  )}
                </TableCell>
                <TableCell onClick={() => handleToggleRoute(routeIndex)}>
                  <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {(() => {
                      const startLoad = route.steps && route.steps[0] && route.steps[0].load;
                      const capacity = route.capacity;
                      if (Array.isArray(startLoad) && Array.isArray(capacity) && capacity.length > 0) {
                        const totalLoad = startLoad.reduce((a: number, b: number) => a + b, 0);
                        const totalCapacity = capacity.reduce((a: number, b: number) => a + b, 0);
                        if (totalCapacity > 0) {
                          const percent = (totalLoad / totalCapacity) * 100;
                          return percent.toFixed(1) + '%';
                        }
                      }
                      return '-';
                    })()}
                  </Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={showSelection ? 11 : 10}>
                  <Collapse in={expandedRoutes.has(routeIndex)} timeout="auto" unmountOnExit>
                    <Box sx={{ margin: 1 }}>
                      <Typography variant="h6" gutterBottom component="div">
                        Route Details
                      </Typography>
                      
                      <TableContainer sx={{ maxHeight: 300, overflow: 'auto' }}>
                        <Table size="small" sx={{ tableLayout: 'fixed' }}>
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ width: '80px', minWidth: '80px' }}><strong>Type</strong></TableCell>
                              <TableCell sx={{ width: '200px', minWidth: '200px' }}><strong>Description</strong></TableCell>
                              <TableCell sx={{ width: '250px', minWidth: '250px' }}><strong>Location</strong></TableCell>
                              <TableCell sx={{ width: '80px', minWidth: '80px' }}><strong>Arrival</strong></TableCell>
                              <TableCell sx={{ width: '80px', minWidth: '80px' }}><strong>Service</strong></TableCell>
                              <TableCell sx={{ width: '150px', minWidth: '150px' }}><strong>Fuel Delivery</strong></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {route.steps && route.steps.map((step: any, stepIndex: number) => (
                              <TableRow key={stepIndex}>
                                <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {getStepTypeIcon(step.type)}
                                    {step.type !== 'job' && <span>{step.type?.toUpperCase() || 'N/A'}</span>}
                                  </Box>
                                </TableCell>
                                <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {step.description || 'N/A'}
                                </TableCell>
                                <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {step.location && step.location.length === 2 ? (
                                    geocodeCache[`${step.location[0].toFixed(6)},${step.location[1].toFixed(6)}`]
                                      ? geocodeCache[`${step.location[0].toFixed(6)},${step.location[1].toFixed(6)}`]
                                      : loadingGeocode[`${step.location[0].toFixed(6)},${step.location[1].toFixed(6)}`]
                                        ? <span style={{color:'#aaa'}}>Loading...</span>
                                        : `${step.location[0].toFixed(4)}, ${step.location[1].toFixed(4)}`
                                  ) : (step.id || 'N/A')}
                                </TableCell>
                                <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {step.arrival ? 
                                    new Date(step.arrival * 1000).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false }) : 
                                    'N/A'
                                  }
                                </TableCell>
                                <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {step.service ? formatDuration(step.service) : '-'}
                                </TableCell>
                                <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {step.load && step.load.length >= 2 ? (
                                    <Box>
                                      <Typography variant="caption" sx={{ display: 'block', color: '#666' }}>
                                        ULSD Clear: {step.load[0]} gal
                                      </Typography>
                                      <Typography variant="caption" sx={{ display: 'block', color: '#666' }}>
                                        ULSD Dyed: {step.load[1]} gal
                                      </Typography>
                                      <Typography variant="caption" sx={{ display: 'block', fontWeight: 'bold', color: companyColor }}>
                                        Total: {step.load[0] + step.load[1]} gal
                                      </Typography>
                                    </Box>
                                  ) : step.load && step.load.length > 0 ? (
                                    step.load.join(', ')
                                  ) : (
                                    '-'
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
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