import { PreferencesInput } from '../components/input/input-panels/preferences-page'

const PREFERENCES_STORAGE_KEY = 'route-planner-preferences'

export class PreferencesPersistence {
  private storage: Storage | null

  constructor(storage?: Storage) {
    this.storage = storage || (typeof window !== 'undefined' ? localStorage : null)
  }

  /**
   * Save preferences to localStorage
   */
  async savePreferences(preferences: PreferencesInput): Promise<void> {
    try {
      if (!this.storage) {
        console.warn('Storage not available (server-side rendering)')
        return
      }
      const serialized = JSON.stringify(preferences)
      this.storage.setItem(PREFERENCES_STORAGE_KEY, serialized)
    } catch (error) {
      console.error('Failed to save preferences:', error)
      throw error
    }
  }

  /**
   * Load preferences from localStorage
   */
  async loadPreferences(): Promise<PreferencesInput | null> {
    try {
      if (!this.storage) {
        console.warn('Storage not available (server-side rendering)')
        return null
      }
      const serialized = this.storage.getItem(PREFERENCES_STORAGE_KEY)
      if (!serialized) {
        return null
      }
      return JSON.parse(serialized) as PreferencesInput
    } catch (error) {
      console.error('Failed to load preferences:', error)
      return null
    }
  }

  /**
   * Clear preferences from localStorage
   */
  async clearPreferences(): Promise<void> {
    try {
      if (!this.storage) {
        console.warn('Storage not available (server-side rendering)')
        return
      }
      this.storage.removeItem(PREFERENCES_STORAGE_KEY)
    } catch (error) {
      console.error('Failed to clear preferences:', error)
      throw error
    }
  }

  /**
   * Check if preferences exist in localStorage
   */
  async hasPreferences(): Promise<boolean> {
    try {
      if (!this.storage) {
        console.warn('Storage not available (server-side rendering)')
        return false
      }
      return this.storage.getItem(PREFERENCES_STORAGE_KEY) !== null
    } catch (error) {
      console.error('Failed to check preferences existence:', error)
      return false
    }
  }

  /**
   * Get the age of saved preferences in days
   */
  async getPreferencesAge(): Promise<number | null> {
    try {
      if (!this.storage) {
        console.warn('Storage not available (server-side rendering)')
        return null
      }
      const serialized = this.storage.getItem(PREFERENCES_STORAGE_KEY)
      if (!serialized) {
        return null
      }

      // Try to get the timestamp from the stored data
      const data = JSON.parse(serialized)
      if (data._timestamp) {
        const savedTime = new Date(data._timestamp).getTime()
        const now = new Date().getTime()
        const diffInDays = Math.floor((now - savedTime) / (1000 * 60 * 60 * 24))
        return diffInDays
      }

      return null
    } catch (error) {
      console.error('Failed to get preferences age:', error)
      return null
    }
  }
}

// Create a singleton instance
export const preferencesPersistence = new PreferencesPersistence() 