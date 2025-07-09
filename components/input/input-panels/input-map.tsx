'use client'

import dynamic from 'next/dynamic'
import { useMemo, useState, useCallback } from 'react'
import { Layer, PickingInfo } from '@deck.gl/core/typed'
import DeckGL from '@deck.gl/react/typed'
import { GeoJsonLayer } from '@deck.gl/layers/typed'
import * as nbmapgl from '@nbai/nbmap-gl'
import Map, { useMap } from 'react-map-gl'
import { point, featureCollection } from '@turf/helpers'

// Dynamically import Map from react-map-gl to avoid SSR issues
const MapComponent = dynamic(() => import('react-map-gl').then(mod => mod.Map), { ssr: false })

export interface MapMarker {
  latitude: number
  longitude: number
  id?: string
  description?: string
  type?: 'job' | 'vehicle'
}

export const InputMap = ({ markers }: { markers?: MapMarker[] }) => {
  const [hoverInfo, setHoverInfo] = useState<PickingInfo>()
  const { viewMap } = useMap()

  const apiKey = process.env.NEXTBILLION_API_KEY
  const mapStyleUrl = apiKey
    ? `https://api.nextbillion.io/maps/streets/style.json?key=${apiKey}`
    : ''

  // Convert markers to GeoJSON features
  const markerFeatures = useMemo(() => {
    console.log('InputMap received markers:', markers)
    if (!markers || markers.length === 0) return []
    
    return markers.map((marker, index) => {
      const isVehicle = marker.type === 'vehicle'
      return point([marker.longitude, marker.latitude], {
        id: marker.id || `marker-${index}`,
        description: marker.description || `Location ${index + 1}`,
        color: isVehicle ? [76, 175, 80, 255] : [25, 118, 210, 255], // Green for vehicles, Blue for jobs
        text: isVehicle ? '🚗' : (index + 1).toString(), // Vehicle icon for vehicles, number for jobs
        type: marker.type || 'job',
      })
    })
  }, [markers])

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
      <div style={{
        width: '100%',
        height: 300,
        borderRadius: 8,
        border: '1px solid #e0e0e0',
        background: '#fffbe6',
        color: '#b26a00',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 500,
        fontSize: 16,
        textAlign: 'center',
      }}>
        Missing NEXTBILLION API Key.<br />
        Please set NEXTBILLION_API_KEY in your environment.
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height: 300, borderRadius: 8, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
      <DeckGL
        style={{ position: 'relative' }}
        initialViewState={{
          longitude: -98.5795,
          latitude: 39.8283,
          zoom: 2.5,
          bearing: 0,
        }}
        pickingRadius={10}
        controller={{ doubleClickZoom: false }}
        layers={layers}
      >
        <MapComponent
          id="viewMap"
          mapLib={nbmapgl as any}
          style={{ width: '100%', height: '100%' }}
          mapStyle={mapStyleUrl}
          projection={{ name: 'globe' }}
          attributionControl={true}
        />
        {hoverInfo?.object && (
          <div
            style={{
              position: 'absolute',
              zIndex: 1,
              pointerEvents: 'none',
              left: hoverInfo.x,
              top: hoverInfo.y,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '4px',
              fontSize: '12px',
              maxWidth: '200px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {hoverInfo.object.properties?.description || 'Location'}
          </div>
        )}
      </DeckGL>
    </div>
  )
} 