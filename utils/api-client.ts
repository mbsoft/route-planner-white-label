export interface ApiResponse<T> {
  data: T
  status: number
  message: string
}

export class ApiClient {
  private apiKey: string
  private baseUrl: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
    this.baseUrl = 'https://api.nextbillion.io'
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    // Add API key to query parameters
    const urlWithApiKey = `${url}${url.includes('?') ? '&' : '?'}key=${this.apiKey}`

    const response = await fetch(urlWithApiKey, {
      ...options,
      headers,
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return {
      data,
      status: response.status,
      message: 'Success',
    }
  }

  // Geocoding API
  async batchGeocode(queries: string[], lang: string = 'en') {
    return this.request('/geocode/batch', {
      method: 'POST',
      body: JSON.stringify({
        queries: queries.map(query => ({ q: query, lang, limit: 1 }))
      }),
    })
  }

  // Structured Geocoding API
  async structuredGeocode(params: {
    limit?: number
    countryCode?: string
    countrySubdivision?: string
    countrySecondarySubdivision?: string
    countryTertiarySubdivision?: string
    streetNumber?: string
    city?: string
    streetName?: string
  }) {
    const queryParams = new URLSearchParams()
    
    // Add all parameters to query string
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString())
      }
    })
    
    return this.request(`/geocode/structured?${queryParams.toString()}`)
  }

  // Route optimization API
  async createOptimizationRequest(payload: any) {
    return this.request('/optimization/v2', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  async getOptimizationResult(id: string) {
    return this.request(`/optimization/v2/result?id=${id}`)
  }

  // Create shared optimization result
  async createSharedResult(id: string) {
    return this.request(`/optimization/v2/create_shared_result?id=${id}`)
  }

  // Directions API
  async getDirections(waypoints: Array<[number, number]>, mode: string = 'driving') {
    const waypointsStr = waypoints.map(wp => `${wp[0]},${wp[1]}`).join('|')
    return this.request(`/directions/v2?waypoints=${waypointsStr}&mode=${mode}`)
  }
} 