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
        return <LocalShippingIcon sx={iconStyle} />
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
  const [geocodeCache, setGeocodeCache] = useState<Record<string, string>>({})
  const [loadingGeocode, setLoadingGeocode] = useState<Record<string, boolean>>({})
  const [pendingGeocodes, setPendingGeocodes] = useState<Set<string>>(new Set())

  // Helper function to format address (street + city only)
  const formatAddress = (fullAddress: string) => {
    if (!fullAddress) return fullAddress
    
    // Split by commas to get address parts
    const parts = fullAddress.split(',').map(part => part.trim())
    
    if (parts.length <= 2) {
      // If only 2 parts or less, return as is
      return fullAddress
    }
    
    // Take the first two parts (street address and city)
    // Skip state, zip, country, etc.
    return parts.slice(0, 2).join(', ')
  }

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
        const formattedAddress = formatAddress(data.items[0].title)
        setGeocodeCache(prev => ({ ...prev, [key]: formattedAddress }))
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



  // Function to calculate tank capacity distribution
  const calculateTankCapacityDistribution = (vehicleId: string, adoptedCapacity: number[]) => {
    if (!vehicleId || !adoptedCapacity || !Array.isArray(adoptedCapacity)) {
      return []
    }

    // Extract tank configuration from first token (before first '|')
    const firstToken = vehicleId.split('|')[0]
    const tankCapacities = firstToken.split(',').map(cap => parseInt(cap.trim())).filter(cap => !isNaN(cap))
    
    if (tankCapacities.length === 0) {
      return []
    }

    // Get capacity type labels
    const capacityTypeLabels = adoptedCapacity.map((_, index) => {
      switch (index) {
        case 0:
          return process.env.NEXT_PUBLIC_CAP_TYPE_1 || `Capacity ${index + 1}`
        case 1:
          return process.env.NEXT_PUBLIC_CAP_TYPE_2 || `Capacity ${index + 1}`
        case 2:
          return process.env.NEXT_PUBLIC_CAP_TYPE_3 || `Capacity ${index + 1}`
        case 3:
          return process.env.NEXT_PUBLIC_CAP_TYPE_4 || `Capacity ${index + 1}`
        case 4:
          return process.env.NEXT_PUBLIC_CAP_TYPE_5 || `Capacity ${index + 1}`
        case 5:
          return process.env.NEXT_PUBLIC_CAP_TYPE_6 || `Capacity ${index + 1}`
        default:
          return `Capacity ${index + 1}`
      }
    })

    // Create array of capacity types with their labels and amounts
    const capacityTypes = adoptedCapacity
      .map((amount, index) => ({
        type: capacityTypeLabels[index],
        amount: amount,
        originalIndex: index
      }))
      .filter(cap => cap.amount > 0)
      .sort((a, b) => b.amount - a.amount) // Sort by amount descending

      // Create tank info array
  const tankInfos = tankCapacities
    .map((capacity, index) => ({ capacity, originalIndex: index }))

  // Distribute capacity types across tanks (no mixing within tanks)
  const tankDistribution = []
  let remainingCapacity = [...capacityTypes]
  let remainingTanks = [...tankInfos]

  // First pass: handle exact matches
  for (let i = 0; i < remainingTanks.length; i++) {
    const tankInfo = remainingTanks[i]
    const tankCapacity = tankInfo.capacity
    const tankIndex = tankInfo.originalIndex

    // Look for exact matches between tank capacity and capacity type amount
    const exactMatch = remainingCapacity.find(cap => cap.amount === tankCapacity)
    if (exactMatch) {
      tankDistribution.push({
        tankNumber: tankIndex + 1,
        capacity: tankCapacity,
        contents: [{
          type: exactMatch.type,
          amount: tankCapacity
        }]
      })

      exactMatch.amount -= tankCapacity
      if (exactMatch.amount <= 0) {
        remainingCapacity = remainingCapacity.filter(cap => cap.amount > 0)
      }
      
      // Remove this tank from remaining tanks
      remainingTanks.splice(i, 1)
      i-- // Adjust index since we removed an element
    }
  }

  // Second pass: handle remaining tanks and capacity types (sorted by size)
  const sortedRemainingTanks = remainingTanks.sort((a, b) => b.capacity - a.capacity)
  
  for (const tankInfo of sortedRemainingTanks) {
    const tankCapacity = tankInfo.capacity
    const tankIndex = tankInfo.originalIndex

    if (remainingCapacity.length > 0) {
      // Find the best capacity type for this tank - prefer smaller amounts for smaller tanks
      let bestCapacityType = null
      let bestFit = 0
      
      for (const cap of remainingCapacity) {
        const fit = Math.min(cap.amount, tankCapacity)
        if (fit > bestFit) {
          bestFit = fit
          bestCapacityType = cap
        }
      }
      
      if (bestCapacityType) {
        const fillAmount = Math.min(bestCapacityType.amount, tankCapacity)
        
        tankDistribution.push({
          tankNumber: tankIndex + 1,
          capacity: tankCapacity,
          contents: [{
            type: bestCapacityType.type,
            amount: fillAmount
          }]
        })

        bestCapacityType.amount -= fillAmount
        if (bestCapacityType.amount <= 0) {
          remainingCapacity = remainingCapacity.filter(cap => cap.amount > 0)
        }
      }
    }
  }

    // Sort back to original tank order
    return tankDistribution.sort((a, b) => a.tankNumber - b.tankNumber)
  }

  return (
    <>
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
              <TableCell sx={{ width: 250, minWidth: 250 }}><strong>Vehicle ID</strong></TableCell>
              <TableCell sx={{ width: 100, minWidth: 100 }}><strong>Start</strong></TableCell>
              <TableCell sx={{ width: 100, minWidth: 100 }}><strong>End</strong></TableCell>
              <TableCell sx={{ width: 80, minWidth: 80 }}><strong>Stops</strong></TableCell>
              <TableCell sx={{ width: 100, minWidth: 100 }}><strong>Distance</strong></TableCell>
              <TableCell sx={{ width: 100, minWidth: 100 }}><strong>Drive</strong></TableCell>
              <TableCell sx={{ width: 180, minWidth: 180 }}><strong>Fuel Delivery</strong></TableCell>
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
                    {route.vehicle ? (
                      route.vehicle.includes('|') ? (
                        <Box>
                          {route.vehicle.split('|').map((vehicleId: string, index: number) => (
                            <Box key={index}>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  overflow: 'hidden', 
                                  textOverflow: 'ellipsis', 
                                  whiteSpace: 'nowrap',
                                  fontSize: '0.875rem',
                                  color: index === 0 ? 'inherit' : '#666',
                                  fontWeight: index === 0 ? 'medium' : 'normal'
                                }}
                              >
                                {vehicleId.trim()}
                              </Typography>
                              {index < route.vehicle.split('|').length - 1 && (
                                <Box sx={{ height: '2px', backgroundColor: '#f0f0f0', my: 0.5 }} />
                              )}
                            </Box>
                          ))}
                        </Box>
                      ) : (
                        <Typography variant="body2" sx={{ fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {route.vehicle}
                        </Typography>
                      )
                    ) : (
                      <Typography variant="body2" sx={{ fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        No vehicle
                      </Typography>
                    )}
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
                    {route.delivery && route.delivery.length > 0 ? (
                      <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {/* Tank Distribution Details */}
                        {route.vehicle && route.vehicle.includes('|') && route.delivery && (
                          <Box sx={{ mb: 1 }}>
                            {(() => {
                              const tankDistribution = calculateTankCapacityDistribution(route.vehicle, route.delivery)
                              const firstToken = route.vehicle.split('|')[0]
                              const tankCapacities = firstToken.split(',').map((cap: string) => parseInt(cap.trim())).filter((cap: number) => !isNaN(cap))
                              
                              // Filter to only show tanks that have adopted capacity allocation
                              const usedTankNumbers = new Set<number>()
                              tankDistribution.forEach((tank: any) => {
                                usedTankNumbers.add(tank.tankNumber)
                              })
                              
                              // Create a map of tank distribution for easy lookup
                              const tankMap = new Map<number, any>()
                              tankDistribution.forEach((tank: any) => {
                                tankMap.set(tank.tankNumber, tank)
                              })
                              
                              // Generate colors for capacity types
                              const capacityColors: { [key: string]: string } = {
                                'ULSD_CLEAR': '#4CAF50',
                                'ULSD_DYED': '#2196F3',
                                'GASOLINE_UNL': '#FF9800',
                                'GASOLINE_UNL_PRE': '#FF5722',
                                'REC_90_GASOLINE': '#9C27B0',
                                'DEF': '#607D8B'
                              }
                              
                              return tankCapacities
                                .map((capacity: number, index: number) => {
                                  const tankNumber = index + 1
                                  return { capacity, tankNumber, index }
                                })
                                .filter((tankInfo: any) => usedTankNumbers.has(tankInfo.tankNumber))
                                .map((tankInfo: any) => {
                                  const tank = tankMap.get(tankInfo.tankNumber)
                                  
                                  return (
                                    <Box key={tankInfo.index} sx={{ mb: 0.5 }}>
                                      <Box
                                        sx={{
                                          width: '100%',
                                          height: '16px',
                                          backgroundColor: '#f5f5f5',
                                          borderRadius: '2px',
                                          overflow: 'hidden',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'flex-start',
                                          position: 'relative'
                                        }}
                                      >
                                        {tank.contents.map((content: any, contentIndex: number) => (
                                          <Box
                                            key={contentIndex}
                                            sx={{
                                              width: `${(content.amount / tankInfo.capacity) * 100}%`,
                                              height: '100%',
                                              backgroundColor: capacityColors[content.type] || '#666',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              color: 'white',
                                              fontSize: '0.6rem',
                                              fontWeight: 'bold',
                                              textAlign: 'center',
                                              padding: '0 2px',
                                              boxSizing: 'border-box',
                                              whiteSpace: 'nowrap',
                                              overflow: 'hidden',
                                              textOverflow: 'ellipsis'
                                            }}
                                            title={`${content.amount} ${content.type}`}
                                          >
                                            {content.amount} {content.type}
                                          </Box>
                                        ))}
                                      </Box>
                                    </Box>
                                  )
                                })
                            })()}
                          </Box>
                        )}
                        
                        {route.delivery.map((delivery: number, index: number) => {
                          if (delivery > 0) {
                            let capTypeLabel = `Capacity ${index + 1}`
                            
                            // Use environment variables for capacity type labels
                            switch (index) {
                              case 0:
                                capTypeLabel = process.env.NEXT_PUBLIC_CAP_TYPE_1 || capTypeLabel
                                break
                              case 1:
                                capTypeLabel = process.env.NEXT_PUBLIC_CAP_TYPE_2 || capTypeLabel
                                break
                              case 2:
                                capTypeLabel = process.env.NEXT_PUBLIC_CAP_TYPE_3 || capTypeLabel
                                break
                              case 3:
                                capTypeLabel = process.env.NEXT_PUBLIC_CAP_TYPE_4 || capTypeLabel
                                break
                              case 4:
                                capTypeLabel = process.env.NEXT_PUBLIC_CAP_TYPE_5 || capTypeLabel
                                break
                              case 5:
                                capTypeLabel = process.env.NEXT_PUBLIC_CAP_TYPE_6 || capTypeLabel
                                break
                            }
                            
                            return (
                              <Typography key={index} variant="body2" sx={{ display: 'block', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.75rem' }}>
                                {capTypeLabel}: {delivery} gal
                              </Typography>
                            )
                          }
                          return null
                        })}
                        <Typography variant="body2" sx={{ display: 'block', fontWeight: 'bold', color: companyColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.75rem' }}>
                          Total: {route.delivery.reduce((sum: number, delivery: number) => sum + delivery, 0)} gal
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        -
                      </Typography>
                    )}
                  </TableCell>

                </TableRow>
                <TableRow>
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={showSelection ? 9 : 8}>
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
                                    {step.load && step.load.length > 0 ? (
                                      <Box>
                                        {step.load.map((load: number, index: number) => {
                                          if (load > 0) {
                                            let capTypeLabel = `Capacity ${index + 1}`
                                            
                                            // Use environment variables for capacity type labels
                                            switch (index) {
                                              case 0:
                                                capTypeLabel = process.env.NEXT_PUBLIC_CAP_TYPE_1 || capTypeLabel
                                                break
                                              case 1:
                                                capTypeLabel = process.env.NEXT_PUBLIC_CAP_TYPE_2 || capTypeLabel
                                                break
                                              case 2:
                                                capTypeLabel = process.env.NEXT_PUBLIC_CAP_TYPE_3 || capTypeLabel
                                                break
                                              case 3:
                                                capTypeLabel = process.env.NEXT_PUBLIC_CAP_TYPE_4 || capTypeLabel
                                                break
                                              case 4:
                                                capTypeLabel = process.env.NEXT_PUBLIC_CAP_TYPE_5 || capTypeLabel
                                                break
                                              case 5:
                                                capTypeLabel = process.env.NEXT_PUBLIC_CAP_TYPE_6 || capTypeLabel
                                                break
                                            }
                                            
                                            return (
                                              <Typography key={index} variant="body2" sx={{ display: 'block', color: '#666', fontSize: '0.75rem' }}>
                                                {capTypeLabel}: {load} gal
                                              </Typography>
                                            )
                                          }
                                          return null
                                        })}
                        
                        
                                        <Typography variant="body2" sx={{ display: 'block', fontWeight: 'bold', color: companyColor, fontSize: '0.75rem' }}>
                                          Total: {step.load.reduce((sum: number, load: number) => sum + load, 0)} gal
                                        </Typography>
                                      </Box>
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
      
    </>
  )
} 