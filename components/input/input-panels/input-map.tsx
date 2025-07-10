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
import MapOptionsControls from './map-options-controls'
import styles from './input-map.module.scss'

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

export const InputMap = ({ markers }: { markers?: MapMarker[] }) => {
  const [hoverInfo, setHoverInfo] = useState<PickingInfo>()
  const [showJobMarkers, setShowJobMarkers] = useState(true)
  const [showVehicleMarkers, setShowVehicleMarkers] = useState(true)
  const [viewState, setViewState] = useState({
    longitude: -74.0060, // New York City longitude
    latitude: 40.7128,   // New York City latitude
    zoom: 10,            // Regional zoom level for NYC area
    bearing: 0,
  })
  const [isMapReady, setIsMapReady] = useState(false)
  const mapRef = useRef<any>(null)
  const { viewMap } = useMap()

  const apiKey = process.env.NEXTBILLION_API_KEY
  const mapStyleUrl = apiKey
    ? `https://api.nextbillion.io/tt/style/1/style/22.2.1-9?map=2/basic_street-dark&key=${apiKey}`
    : ''



  // Convert markers to GeoJSON features
  const markerFeatures = useMemo(() => {
    console.log('InputMap received markers:', markers)
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

  // Smart bounding box logic - only adjust view if markers are not visible
  useEffect(() => {
    console.log('DEBUG: Bounding box effect triggered')
    console.log('DEBUG: markerFeatures.length:', markerFeatures.length)
    console.log('DEBUG: isMapReady:', isMapReady)
    console.log('DEBUG: mapRef.current:', mapRef.current)
    console.log('DEBUG: viewMap:', viewMap)
    
    if (markerFeatures.length === 0) {
      console.log('DEBUG: No markers to process')
      return
    }
    
    // Use mapRef.current as fallback if viewMap is not available
    const mapInstance = viewMap || mapRef.current
    
    if (!isMapReady || !mapInstance) {
      console.log('DEBUG: Map not ready yet')
      return
    }
    
    try {
      const bbox = turfBbox(featureCollection(markerFeatures))
      
      // Always optimize the view to fit all markers with padding
      console.log('DEBUG: Optimizing map view to fit all markers')
      
      // Calculate new view state from bbox
      const [minLng, minLat, maxLng, maxLat] = bbox
      const centerLng = (minLng + maxLng) / 2
      const centerLat = (minLat + maxLat) / 2
      
      // Calculate appropriate zoom level based on bbox size with padding
      const lngDiff = maxLng - minLng
      const latDiff = maxLat - minLat
      const maxDiff = Math.max(lngDiff, latDiff)
      // Add padding by reducing the zoom level slightly
      const zoom = Math.max(1, Math.min(15, Math.log2(360 / maxDiff) - 0.5))
      
      setViewState({
        longitude: centerLng,
        latitude: centerLat,
        zoom: zoom,
        bearing: 0,
      })
      
      console.log('DEBUG: New view state:', {
        longitude: centerLng,
        latitude: centerLat,
        zoom: zoom,
        bbox: bbox
      })
    } catch (error) {
      console.error('DEBUG: Error in bounding box logic:', error)
    }
  }, [markerFeatures, isMapReady, viewMap])

  // Monitor viewMap availability
  useEffect(() => {
    console.log('DEBUG: viewMap availability changed:', !!viewMap)
    if (viewMap) {
      console.log('DEBUG: viewMap is now available')
      console.log('DEBUG: viewMap.getBounds():', viewMap.getBounds())
    }
  }, [viewMap])

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
      getTextSize: (f: any) => f?.properties?.type === 'vehicle' ? 16 : 10, // Larger text for vehicle icons
      getPointRadius: (f: any) => f?.properties?.type === 'vehicle' ? 12 : 9, // Larger radius for vehicles
      pointRadiusUnits: 'pixels',
      onHover: (info: PickingInfo) => {
        if (info.object) {
          info.object.popupType = 'marker'
        }
        setHoverInfo(info)
      },
    })
  }, [markerFeatures])

  const layers: Layer[] = []
  if (markerLayer) {
    layers.push(markerLayer)
  }

  if (!apiKey) {
    return (
      <div className={styles.root} style={{
        background: '#fffbe6',
        color: '#b26a00',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 500,
        fontSize: 16,
        textAlign: 'center',
        height: '320px',
      }}>
        Missing NEXTBILLION API Key.<br />
        Please set NEXTBILLION_API_KEY in your environment.
      </div>
    )
  }

  return (
    <div className={styles.root}>
      <div className={styles.mapContainer}>
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
              console.log('DEBUG: Map loaded, setting isMapReady to true')
              console.log('DEBUG: mapRef.current:', mapRef.current)
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
              {hoverInfo.object.properties?.description || 'Location'}
            </div>
          )}
        </DeckGL>
        <div className={styles.optionsContainer}>
          <MapOptionsControls
            showJobMarkers={showJobMarkers}
            showVehicleMarkers={showVehicleMarkers}
            onShowJobMarkersChange={setShowJobMarkers}
            onShowVehicleMarkersChange={setShowVehicleMarkers}
          />
        </div>
      </div>
    </div>
  )
} 