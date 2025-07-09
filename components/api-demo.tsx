'use client'

import {useState} from 'react'
import {useWhiteLabelContext} from '../app/white-label-layout'
import {ApiClient} from '../utils/api-client'

export function ApiDemo() {
  const {apiKey} = useWhiteLabelContext()
  const [geocodeResult, setGeocodeResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testGeocoding = async () => {
    if (!apiKey) return

    setIsLoading(true)
    setError(null)
    
    try {
      const apiClient = new ApiClient(apiKey)
      const result = await apiClient.structuredGeocode({
        limit: 1,
        countryCode: 'DE',
        countrySubdivision: 'Baden-Württemberg',
        countrySecondarySubdivision: 'Stuttgart',
        countryTertiarySubdivision: 'Esslingen',
        streetNumber: '10',
        city: 'Esslingen am Neckar',
        streetName: 'Bahnhofstraße'
      })
      setGeocodeResult(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{padding: '20px', border: '1px solid #ccc', borderRadius: '8px', margin: '20px 0'}}>
      <h3>API Demo</h3>
      
      <button 
        onClick={testGeocoding}
        disabled={isLoading || !apiKey}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          opacity: isLoading ? 0.6 : 1
        }}
      >
        {isLoading ? 'Testing...' : 'Test Geocoding API'}
      </button>

      {error && (
        <div style={{color: 'red', marginTop: '10px'}}>
          Error: {error}
        </div>
      )}

      {geocodeResult && (
        <div style={{marginTop: '20px'}}>
          <h4>Geocoding Result:</h4>
          <pre style={{
            backgroundColor: '#f5f5f5',
            padding: '10px',
            borderRadius: '4px',
            overflow: 'auto'
          }}>
            {JSON.stringify(geocodeResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
} 