// Fix for missing types for @mapbox/polyline
// Remove this if you add @types/mapbox__polyline in the future
declare module '@mapbox/polyline' {
  const polyline: {
    decode: (encoded: string) => [number, number][]
  }
  export = polyline
}

import polyline from '@mapbox/polyline'

/**
 * Decodes a Google polyline string into an array of [latitude, longitude] coordinates
 * @param encoded - The encoded polyline string
 * @returns Array of [latitude, longitude] coordinates
 */
export function decodePolyline(encoded: string): [number, number][] {
  return polyline.decode(encoded) as [number, number][]
}

/**
 * Converts a polyline string to GeoJSON LineString format
 * @param encoded - The encoded polyline string
 * @returns GeoJSON LineString object
 */
export function polylineToGeoJSON(encoded: string) {
  const coordinates = decodePolyline(encoded)
  return {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: coordinates.map(coord => [coord[1], coord[0]]) // GeoJSON uses [lng, lat] order
    },
    properties: {}
  }
} 