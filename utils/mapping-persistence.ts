import { MapConfig, InputType } from '../models/input/input-core'

// Storage keys for different mapping types
const STORAGE_KEYS = {
  JOB_MAPPING: 'route-planner-job-mapping',
  VEHICLE_MAPPING: 'route-planner-vehicle-mapping',
  SHIPMENT_MAPPING: 'route-planner-shipment-mapping',
} as const

// Interface for stored mapping data
interface StoredMapping {
  mapConfig: MapConfig
  timestamp: number
  version: string
}

// Current version for migration purposes
const CURRENT_VERSION = '1.0.0'

/**
 * Mapping persistence service
 * Now uses Vercel Edge Storage via API routes
 */
export class MappingPersistence {
  private static instance: MappingPersistence

  private constructor() {}

  static getInstance(): MappingPersistence {
    if (!MappingPersistence.instance) {
      MappingPersistence.instance = new MappingPersistence()
    }
    return MappingPersistence.instance
  }

  /**
   * Save mapping configuration to Vercel Edge Storage
   */
  async saveMapping(inputType: InputType, mapConfig: MapConfig): Promise<void> {
    try {
      const storageKey = this.getStorageKey(inputType)
      const storedData: StoredMapping = {
        mapConfig,
        timestamp: Date.now(),
        version: CURRENT_VERSION,
      }
      await fetch(`/api/map/${inputType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storedData),
      })
      console.log(`Saved ${inputType} mapping to Vercel Edge Storage`)
    } catch (error) {
      console.error(`Failed to save ${inputType} mapping:`, error)
      throw error
    }
  }

  /**
   * Load mapping configuration from Vercel Edge Storage
   */
  async loadMapping(inputType: InputType): Promise<MapConfig | null> {
    try {
      const res = await fetch(`/api/map/${inputType}`)
      if (!res.ok) {
        console.log(`No stored mapping found for ${inputType}`)
        return null
      }
      const data = await res.json()
      if (!data.value) return null
      const parsedData: StoredMapping = data.value
      if (!this.isValidStoredMapping(parsedData)) {
        console.warn(`Invalid stored mapping for ${inputType}, clearing...`)
        await this.clearMapping(inputType)
        return null
      }
      console.log(`Loaded ${inputType} mapping from Vercel Edge Storage`)
      return parsedData.mapConfig
    } catch (error) {
      console.error(`Failed to load ${inputType} mapping:`, error)
      return null
    }
  }

  /**
   * Clear mapping configuration from Vercel Edge Storage
   */
  async clearMapping(inputType: InputType): Promise<void> {
    try {
      // Set to null (or you could implement a DELETE endpoint)
      await fetch(`/api/map/${inputType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(null),
      })
      console.log(`Cleared ${inputType} mapping from Vercel Edge Storage`)
    } catch (error) {
      console.error(`Failed to clear ${inputType} mapping:`, error)
      throw error
    }
  }

  /**
   * Check if mapping exists in Vercel Edge Storage
   */
  async hasMapping(inputType: InputType): Promise<boolean> {
    try {
      const res = await fetch(`/api/map/${inputType}`)
      if (!res.ok) return false
      const data = await res.json()
      return !!data.value
    } catch (error) {
      console.error(`Failed to check ${inputType} mapping existence:`, error)
      return false
    }
  }

  /**
   * Get storage key for input type (for API route)
   */
  private getStorageKey(inputType: InputType): string {
    switch (inputType) {
      case 'job':
        return 'jobs'
      case 'vehicle':
        return 'vehicles'
      case 'shipment':
        return 'shipments'
      default:
        throw new Error(`Unknown input type: ${inputType}`)
    }
  }

  /**
   * Validate stored mapping data
   */
  private isValidStoredMapping(data: any): data is StoredMapping {
    return (
      data &&
      typeof data === 'object' &&
      typeof data.timestamp === 'number' &&
      typeof data.version === 'string' &&
      data.mapConfig &&
      Array.isArray(data.mapConfig.dataMappings) &&
      Array.isArray(data.mapConfig.metaMappings)
    )
  }

  /**
   * Get mapping age in days
   */
  async getMappingAge(inputType: InputType): Promise<number | null> {
    try {
      const res = await fetch(`/api/map/${inputType}`)
      if (!res.ok) return null
      const data = await res.json()
      if (!data.value) return null
      const parsedData: StoredMapping = data.value
      const ageInMs = Date.now() - parsedData.timestamp
      return Math.floor(ageInMs / (1000 * 60 * 60 * 24))
    } catch (error) {
      console.error(`Failed to get mapping age for ${inputType}:`, error)
      return null
    }
  }
}

// Export singleton instance
export const mappingPersistence = MappingPersistence.getInstance() 