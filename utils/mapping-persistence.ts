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
 * Currently uses localStorage, can be extended to use Vercel Edge Storage
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
   * Save mapping configuration to storage
   */
  async saveMapping(inputType: InputType, mapConfig: MapConfig): Promise<void> {
    try {
      const storageKey = this.getStorageKey(inputType)
      const storedData: StoredMapping = {
        mapConfig,
        timestamp: Date.now(),
        version: CURRENT_VERSION,
      }

      if (typeof window !== 'undefined') {
        // Browser environment - use localStorage
        localStorage.setItem(storageKey, JSON.stringify(storedData))
        console.log(`Saved ${inputType} mapping to localStorage`)
      } else {
        // Server environment - could use Vercel Edge Storage here
        console.log(`Server environment - would save ${inputType} mapping to Vercel Edge Storage`)
        // TODO: Implement Vercel Edge Storage persistence
        // await this.saveToVercelStorage(storageKey, storedData)
      }
    } catch (error) {
      console.error(`Failed to save ${inputType} mapping:`, error)
      throw error
    }
  }

  /**
   * Load mapping configuration from storage
   */
  async loadMapping(inputType: InputType): Promise<MapConfig | null> {
    try {
      const storageKey = this.getStorageKey(inputType)

      if (typeof window !== 'undefined') {
        // Browser environment - use localStorage
        const stored = localStorage.getItem(storageKey)
        if (!stored) {
          console.log(`No stored mapping found for ${inputType}`)
          return null
        }

        const parsedData: StoredMapping = JSON.parse(stored)
        
        // Validate the stored data
        if (!this.isValidStoredMapping(parsedData)) {
          console.warn(`Invalid stored mapping for ${inputType}, clearing...`)
          this.clearMapping(inputType)
          return null
        }

        console.log(`Loaded ${inputType} mapping from localStorage`)
        return parsedData.mapConfig
      } else {
        // Server environment - could use Vercel Edge Storage here
        console.log(`Server environment - would load ${inputType} mapping from Vercel Edge Storage`)
        // TODO: Implement Vercel Edge Storage loading
        // return await this.loadFromVercelStorage(storageKey)
        return null
      }
    } catch (error) {
      console.error(`Failed to load ${inputType} mapping:`, error)
      return null
    }
  }

  /**
   * Clear mapping configuration from storage
   */
  async clearMapping(inputType: InputType): Promise<void> {
    try {
      const storageKey = this.getStorageKey(inputType)

      if (typeof window !== 'undefined') {
        // Browser environment - use localStorage
        localStorage.removeItem(storageKey)
        console.log(`Cleared ${inputType} mapping from localStorage`)
      } else {
        // Server environment - could use Vercel Edge Storage here
        console.log(`Server environment - would clear ${inputType} mapping from Vercel Edge Storage`)
        // TODO: Implement Vercel Edge Storage clearing
        // await this.clearFromVercelStorage(storageKey)
      }
    } catch (error) {
      console.error(`Failed to clear ${inputType} mapping:`, error)
      throw error
    }
  }

  /**
   * Check if mapping exists in storage
   */
  async hasMapping(inputType: InputType): Promise<boolean> {
    try {
      const storageKey = this.getStorageKey(inputType)

      if (typeof window !== 'undefined') {
        // Browser environment - use localStorage
        return localStorage.getItem(storageKey) !== null
      } else {
        // Server environment - could use Vercel Edge Storage here
        console.log(`Server environment - would check ${inputType} mapping in Vercel Edge Storage`)
        // TODO: Implement Vercel Edge Storage check
        // return await this.hasInVercelStorage(storageKey)
        return false
      }
    } catch (error) {
      console.error(`Failed to check ${inputType} mapping existence:`, error)
      return false
    }
  }

  /**
   * Get storage key for input type
   */
  private getStorageKey(inputType: InputType): string {
    switch (inputType) {
      case 'job':
        return STORAGE_KEYS.JOB_MAPPING
      case 'vehicle':
        return STORAGE_KEYS.VEHICLE_MAPPING
      case 'shipment':
        return STORAGE_KEYS.SHIPMENT_MAPPING
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
      const storageKey = this.getStorageKey(inputType)

      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(storageKey)
        if (!stored) return null

        const parsedData: StoredMapping = JSON.parse(stored)
        const ageInMs = Date.now() - parsedData.timestamp
        return Math.floor(ageInMs / (1000 * 60 * 60 * 24)) // Convert to days
      }
      return null
    } catch (error) {
      console.error(`Failed to get mapping age for ${inputType}:`, error)
      return null
    }
  }

  // TODO: Future Vercel Edge Storage methods
  /*
  private async saveToVercelStorage(key: string, data: StoredMapping): Promise<void> {
    // Implementation for Vercel Edge Storage
  }

  private async loadFromVercelStorage(key: string): Promise<MapConfig | null> {
    // Implementation for Vercel Edge Storage
  }

  private async clearFromVercelStorage(key: string): Promise<void> {
    // Implementation for Vercel Edge Storage
  }

  private async hasInVercelStorage(key: string): Promise<boolean> {
    // Implementation for Vercel Edge Storage
  }
  */
}

// Export singleton instance
export const mappingPersistence = MappingPersistence.getInstance() 