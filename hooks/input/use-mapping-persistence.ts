import { useCallback } from 'react'
import { InputType } from '../../models/input/input-core'
import { mappingPersistence } from '../../utils/mapping-persistence'
import { useInputStore } from '../../models/input/store'

/**
 * Hook for mapping persistence functionality
 */
export const useMappingPersistence = () => {
  const store = useInputStore()

  /**
   * Load persisted mapping for a specific input type
   */
  const loadMapping = useCallback(async (inputType: InputType) => {
    await store.inputCore.loadPersistedMapping(inputType)
  }, [store.inputCore])

  /**
   * Check if mapping exists for a specific input type
   */
  const hasMapping = useCallback(async (inputType: InputType) => {
    return await mappingPersistence.hasMapping(inputType)
  }, [])

  /**
   * Get mapping age in days for a specific input type
   */
  const getMappingAge = useCallback(async (inputType: InputType) => {
    return await mappingPersistence.getMappingAge(inputType)
  }, [])

  /**
   * Clear persisted mapping for a specific input type
   */
  const clearMapping = useCallback(async (inputType: InputType) => {
    await mappingPersistence.clearMapping(inputType)
    // Also reset the mapping in the store
    await store.inputCore.resetMapping(inputType)
  }, [store.inputCore])

  /**
   * Load all persisted mappings
   */
  const loadAllMappings = useCallback(async () => {
    const inputTypes: InputType[] = ['job', 'vehicle', 'shipment']
    
    for (const inputType of inputTypes) {
      await loadMapping(inputType)
    }
  }, [loadMapping])

  /**
   * Clear all persisted mappings
   */
  const clearAllMappings = useCallback(async () => {
    const inputTypes: InputType[] = ['job', 'vehicle', 'shipment']
    
    for (const inputType of inputTypes) {
      await clearMapping(inputType)
    }
  }, [clearMapping])

  return {
    loadMapping,
    hasMapping,
    getMappingAge,
    clearMapping,
    loadAllMappings,
    clearAllMappings,
  }
} 