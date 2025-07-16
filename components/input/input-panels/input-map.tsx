'use client'

import dynamic from 'next/dynamic'
import { useMemo, useState, useCallback, useEffect, useRef } from 'react'
import { Layer, PickingInfo } from '@deck.gl/core/typed'
import DeckGL from '@deck.gl/react/typed'
import { GeoJsonLayer } from '@deck.gl/layers/typed'
import * as nbmapgl from '@nbai/nbmap-gl'
import Map, { useMap } from 'react-map-gl'
import { point, featureCollection } from '@turf/helpers'
import turfCenter from '@turf/center'
import turfBbox from '@turf/bbox'
import turfBboxPolygon from '@turf/bbox-polygon'
import booleanContains from '@turf/boolean-contains'
import { Box, IconButton, Typography, Collapse } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import MapIcon from '@mui/icons-material/Map'
import { polylineToGeoJSON } from '../../../utils/polyline-decoder'
import MapOptionsControls from './map-options-controls'
import styles from './input-map.module.scss'
import { useWhiteLabelContext } from '../../../app/white-label-layout'

// TypeScript global declaration for NextBillion
declare global {
  interface Window {
    nextbillion?: any;
  }
}

export interface MapMarker {
  latitude: number
  longitude: number
  id?: string
  description?: string
  type?: 'job' | 'vehicle'
}

export interface RouteData {
  vehicle: string
  geometry?: string
  cost?: number
  distance?: number
  duration?: number
  steps?: any[]
  delivery?: number[]
  pickup?: number[]
}

interface CollapsibleMapProps {
  markers?: MapMarker[]
  routes?: RouteData[]
  isVisible?: boolean
  onToggle?: (visible: boolean) => void
}

export const CollapsibleMap = ({ markers, routes, isVisible = false, onToggle }: CollapsibleMapProps) => {
  const [isExpanded, setIsExpanded] = useState(isVisible)
  const [hoverInfo, setHoverInfo] = useState<PickingInfo>()
  const [showJobMarkers, setShowJobMarkers] = useState(true)
  const [showVehicleMarkers, setShowVehicleMarkers] = useState(true)
  const [showRoutes, setShowRoutes] = useState(true)
  const [viewState, setViewState] = useState({
    longitude: -74.0060, // New York City longitude
    latitude: 40.7128,   // New York City latitude
    zoom: 10,            // Regional zoom level for NYC area
    bearing: 0,
  })
  const [isMapReady, setIsMapReady] = useState(false)
  const mapRef = useRef<any>(null)
  const { viewMap } = useMap()
  const { apiKey } = useWhiteLabelContext()
  const mapStyleUrl = apiKey
    ? `https://api.nextbillion.io/tt/style/1/style/22.2.1-9?map=2/basic_street-dark&key=${apiKey}`
    : ''

  const handleToggle = () => {
    const newExpanded = !isExpanded
    setIsExpanded(newExpanded)
    onToggle?.(newExpanded)
  }

  // Convert markers to GeoJSON features
  const markerFeatures = useMemo(() => {
    if (!markers || markers.length === 0) return []
    
    // Filter markers based on options
    const filteredMarkers = markers.filter(marker => {
      if (marker.type === 'vehicle') {
        return showVehicleMarkers
      } else {
        return showJobMarkers
      }
    })
    
    return filteredMarkers.map((marker, index) => {
      const isVehicle = marker.type === 'vehicle'
      return point([marker.longitude, marker.latitude], {
        id: marker.id || `marker-${index}`,
        description: marker.description || `Location ${index + 1}`,
        color: isVehicle ? [76, 175, 80, 255] : [25, 118, 210, 255], // Green for vehicles, Blue for jobs
        text: isVehicle ? '🚗' : (index + 1).toString(), // Vehicle icon for vehicles, number for jobs
        type: marker.type || 'job',
      })
    })
  }, [markers, showJobMarkers, showVehicleMarkers])

  // Helper to generate a random RGBA color
  function getRandomColor(seed: number) {
    // Use a seeded pseudo-random generator for consistent colors per session
    const x = Math.sin(seed + 1) * 10000;
    const r = Math.floor((Math.abs(Math.sin(seed) * 256)) % 256);
    const g = Math.floor((Math.abs(Math.sin(seed + 1) * 256)) % 256);
    const b = Math.floor((Math.abs(Math.sin(seed + 2) * 256)) % 256);
    return [r, g, b, 255];
  }

  // Convert routes to GeoJSON features
  const routeFeatures = useMemo(() => {
    if (!routes || routes.length === 0 || !showRoutes) return []
    
    return routes.map((route, index) => {
      try {
        // Skip routes without geometry (they won't be displayed on map)
        if (!route.geometry) {
          console.warn(`Route ${index} has no geometry data - skipping map display`)
          return null
        }
        
        const geoJSON = polylineToGeoJSON(route.geometry)
        return {
          ...geoJSON,
          properties: {
            id: `route-${index}`,
            vehicle: route.vehicle,
            cost: route.cost,
            distance: route.distance,
            duration: route.duration,
            color: getRandomColor(index), // Assign a different random color for each route
            width: 3,
          }
        }
      } catch (error) {
        console.error(`Failed to decode route ${index}:`, error)
        return null
      }
    }).filter((feature): feature is any => feature !== null)
  }, [routes, showRoutes])

  // Combine all features for bounding box calculation
  const allFeatures = useMemo(() => {
    return [...markerFeatures, ...routeFeatures] as any[]
  }, [markerFeatures, routeFeatures])

  // Smart bounding box logic - only adjust view if markers are not visible
  useEffect(() => {
    if (allFeatures.length === 0) return
    
    const mapInstance = viewMap || mapRef.current
    
    if (!isMapReady || !mapInstance) return
    
    try {
      const bbox = turfBbox(featureCollection(allFeatures))
      
      // Calculate new view state from bbox
      const [minLng, minLat, maxLng, maxLat] = bbox
      const centerLng = (minLng + maxLng) / 2
      const centerLat = (minLat + maxLat) / 2
      
      // Calculate appropriate zoom level based on bbox size with padding
      const lngDiff = maxLng - minLng
      const latDiff = maxLat - minLat
      const maxDiff = Math.max(lngDiff, latDiff)
      const zoom = Math.max(1, Math.min(15, Math.log2(360 / maxDiff) - 0.5))
      
      setViewState({
        longitude: centerLng,
        latitude: centerLat,
        zoom: zoom,
        bearing: 0,
      })
    } catch (error) {
      console.error('Error in bounding box logic:', error)
    }
  }, [allFeatures, isMapReady, viewMap])

  // Create GeoJsonLayer for markers
  const markerLayer = useMemo(() => {
    if (markerFeatures.length === 0) return null

    return new GeoJsonLayer({
      id: 'marker-layer',
      data: featureCollection(markerFeatures),
      pointType: 'circle+text',
      stroked: false,
      filled: true,
      pickable: true,
      getFillColor: (f: any) => f?.properties?.color ?? [25, 118, 210, 255],
      getText: (f: any) => f?.properties?.text ?? '',
      getTextColor: [255, 255, 255, 255],
      getTextSize: (f: any) => f?.properties?.type === 'vehicle' ? 16 : 10,
      getPointRadius: (f: any) => f?.properties?.type === 'vehicle' ? 12 : 9,
      pointRadiusUnits: 'pixels',
      onHover: (info: PickingInfo) => {
        if (info.object) {
          info.object.popupType = 'marker'
        }
        setHoverInfo(info)
      },
    })
  }, [markerFeatures])

  // Create GeoJsonLayer for routes
  const routeLayer = useMemo(() => {
    if (routeFeatures.length === 0) return null

    return new GeoJsonLayer({
      id: 'route-layer',
      data: featureCollection(routeFeatures),
      stroked: true,
      filled: false,
      lineWidthUnits: 'pixels',
      getLineColor: (f: any) => f?.properties?.color ?? [255, 87, 34, 255],
      getLineWidth: (f: any) => f?.properties?.width ?? 3,
      pickable: true,
      onHover: (info: PickingInfo) => {
        if (info.object) {
          info.object.popupType = 'route'
        }
        setHoverInfo(info)
      },
    })
  }, [routeFeatures])

  const layers: Layer[] = []
  if (routeLayer) {
    layers.push(routeLayer)
  }
  if (markerLayer) {
    layers.push(markerLayer)
  }

  if (!apiKey) {
    return (
      <Box className={styles.collapsibleRoot}>
        <Box className={styles.toggleButton} onClick={handleToggle}>
          <MapIcon sx={{ mr: 1, fontSize: 20, color: '#666' }} />
          <Typography variant="body2">Map View</Typography>
          {isExpanded ? <ExpandLessIcon sx={{ fontSize: 20 }} /> : <ExpandMoreIcon sx={{ fontSize: 20 }} />}
        </Box>
        <Collapse in={isExpanded} timeout={300}>
          <Box className={styles.errorContainer}>
            <Typography variant="body1" color="warning.main">
              Missing NEXTBILLION API Key.<br />
              Please set NEXTBILLION_API_KEY in your environment.
            </Typography>
          </Box>
        </Collapse>
      </Box>
    )
  }

  return (
    <Box className={styles.collapsibleRoot}>
      <Box className={styles.toggleButton} onClick={handleToggle}>
        <MapIcon sx={{ mr: 1, fontSize: 20, color: '#666' }} />
        <Typography variant="body2">
          Map View {markers && markers.length > 0 && `(${markers.length} locations)`}
          {routes && routes.length > 0 && ` • ${routes.length} routes`}
        </Typography>
        {isExpanded ? <ExpandLessIcon sx={{ fontSize: 20 }} /> : <ExpandMoreIcon sx={{ fontSize: 20 }} />}
      </Box>
      
      <Collapse in={isExpanded} timeout={300}>
        <Box className={styles.mapContainer}>
          <DeckGL
            style={{ width: '100%', height: '100%' }}
            viewState={viewState}
            onViewStateChange={({ viewState: newViewState }) => {
              setViewState({
                longitude: newViewState.longitude,
                latitude: newViewState.latitude,
                zoom: newViewState.zoom,
                bearing: newViewState.bearing,
              })
            }}
            pickingRadius={10}
            controller={{ doubleClickZoom: false }}
            layers={layers}
          >
            <Map
              id="viewMap"
              mapLib={nbmapgl as any}
              style={{ width: '100%', height: '100%' }}
              mapStyle={mapStyleUrl}
              projection={{ name: 'globe' }}
              attributionControl={false}
              ref={mapRef}
              onLoad={() => {
                setIsMapReady(true)
              }}
            />
            {hoverInfo?.object && (
              <div
                className={styles.tooltip}
                style={{
                  left: hoverInfo.x,
                  top: hoverInfo.y,
                }}
              >
                {hoverInfo.object.popupType === 'route' 
                  ? `Route ${hoverInfo.object.properties?.vehicle || 'Unknown'}`
                  : hoverInfo.object.properties?.description || 'Location'
                }
              </div>
            )}
          </DeckGL>
          <div className={styles.optionsContainer}>
            <MapOptionsControls
              showJobMarkers={showJobMarkers}
              showVehicleMarkers={showVehicleMarkers}
              showRoutes={showRoutes}
              onShowJobMarkersChange={setShowJobMarkers}
              onShowVehicleMarkersChange={setShowVehicleMarkers}
              onShowRoutesChange={setShowRoutes}
            />
          </div>
        </Box>
      </Collapse>
    </Box>
  )
}

// Keep the original InputMap for backward compatibility
export const InputMap = ({ markers }: { markers?: MapMarker[] }) => {
  return <CollapsibleMap markers={markers} />
} 