import { create } from 'zustand'
import { InputCoreSlice, InputType } from './input-core'
import { InputPhaseSlice, InputPage } from './input-phase'
import { InputUISlice } from './input-ui'
import { mappingPersistence } from '../../utils/mapping-persistence'

// Get the default active tab based on USE_CASE environment variable
const getDefaultActiveTab = (): InputType => {
  const useCase = process.env.NEXT_PUBLIC_USE_CASE || 'jobs'
  return useCase === 'shipments' ? 'shipment' : 'job'
}

export interface RootState {
  inputCore: InputCoreSlice
  inputPhase: InputPhaseSlice
  inputUI: InputUISlice
}

export type Dispatch = {
  inputCore: InputCoreSlice
  inputPhase: InputPhaseSlice
  inputUI: InputUISlice
}

// Create the store using Zustand
export const useInputStore = create<RootState>((set, get) => ({
  inputCore: {
    activeTab: getDefaultActiveTab(),
    job: {
      rawData: { header: [], rows: [], attachedRows: [] },
      mapConfig: { dataMappings: [], metaMappings: [] },
      selection: [],
    },
    vehicle: {
      rawData: { header: [], rows: [], attachedRows: [] },
      mapConfig: { dataMappings: [], metaMappings: [] },
      selection: [],
    },
    shipment: {
      rawData: { header: [], rows: [], attachedRows: [] },
      mapConfig: { dataMappings: [], metaMappings: [] },
      selection: [],
    },
    errors: { job: [], vehicle: [], shipment: [] },
    isInitialized: false,
    setRawData: (inputType, data) =>
      set((state) => ({
        inputCore: {
          ...state.inputCore,
          [inputType]: {
            ...state.inputCore[inputType],
            rawData: data,
            selection: Array(data.rows.length).fill(true), // select all by default
          },
        },
      })),
    setRowSelected: (inputType: InputType, rowIndex: number, selected: boolean) =>
      set((state) => {
        const selection = [...(state.inputCore[inputType].selection || [])]
        selection[rowIndex] = selected
        return {
          inputCore: {
            ...state.inputCore,
            [inputType]: {
              ...state.inputCore[inputType],
              selection,
            },
          },
        }
      }),
    setAllRowsSelected: (inputType: InputType, selected: boolean) =>
      set((state) => {
        const rowCount = state.inputCore[inputType].rawData.rows.length
        return {
          inputCore: {
            ...state.inputCore,
            [inputType]: {
              ...state.inputCore[inputType],
              selection: Array(rowCount).fill(selected),
            },
          },
        }
      }),
    clearSelection: (inputType: InputType) =>
      set((state) => ({
        inputCore: {
          ...state.inputCore,
          [inputType]: {
            ...state.inputCore[inputType],
            selection: [],
          },
        },
      })),
    setMapConfig: (inputType, config) => {
      // Update the store immediately
      set((state) => ({
        inputCore: {
          ...state.inputCore,
          [inputType]: {
            ...state.inputCore[inputType],
            mapConfig: config,
          },
        },
      }))
      
      // Note: Mappings are now only saved when the user clicks "Save Mappings"
      // This prevents automatic saving on every mapping change
    },
    resetMapping: (inputType) => {
      // Update the store immediately
      set((state) => ({
        inputCore: {
          ...state.inputCore,
          [inputType]: {
            ...state.inputCore[inputType],
            mapConfig: { dataMappings: [], metaMappings: [] },
          },
        },
      }))
      
      // Clear the persisted mapping configuration asynchronously (non-blocking)
      mappingPersistence.clearMapping(inputType).catch((error) => {
        console.error(`Failed to clear persisted ${inputType} mapping:`, error)
      })
    },
    addAttachedColumn: (inputType) =>
      set((state) => {
        const currentData = state.inputCore[inputType].rawData
        // Add a new column to all existing attached rows
        const newAttachedRows = currentData.attachedRows.map((row: string[]) => 
          [...row, '']
        )
        // If there are no attached rows yet, create one with a single empty column
        if (newAttachedRows.length === 0 && currentData.rows.length > 0) {
          for (let i = 0; i < currentData.rows.length; i++) {
            newAttachedRows.push([''])
          }
        }
        return {
          inputCore: {
            ...state.inputCore,
            [inputType]: {
              ...state.inputCore[inputType],
              rawData: {
                ...currentData,
                attachedRows: newAttachedRows,
              },
            },
          },
        }
      }),
    deleteAttachedColumn: (inputType: InputType, columnIndex: number) =>
      set((state) => {
        const currentData = state.inputCore[inputType].rawData
        // Ensure columnIndex is valid
        if (columnIndex < 0 || currentData.attachedRows.length === 0) {
          return state
        }
        const newAttachedRows = currentData.attachedRows.map((row: string[]) => 
          row.filter((_: string, index: number) => index !== columnIndex)
        )
        return {
          inputCore: {
            ...state.inputCore,
            [inputType]: {
              ...state.inputCore[inputType],
              rawData: {
                ...currentData,
                attachedRows: newAttachedRows,
              },
            },
          },
        }
      }),
    copyAttributeColumn: (inputType, params) =>
      set((state) => {
        const currentData = state.inputCore[inputType].rawData
        const newAttachedRows = [...currentData.attachedRows]
        const sourceRow = currentData.rows[params.rowIndex] || []
        const sourceValue = sourceRow[params.columnIndex] || ''
        
        newAttachedRows.forEach((row, index) => {
          if (index < newAttachedRows.length) {
            newAttachedRows[index] = [...row]
            newAttachedRows[index][params.columnIndex] = sourceValue
          }
        })
        
        return {
          inputCore: {
            ...state.inputCore,
            [inputType]: {
              ...state.inputCore[inputType],
              rawData: {
                ...currentData,
                attachedRows: newAttachedRows,
              },
            },
          },
        }
      }),
    setErrors: (inputType, errors) =>
      set((state) => ({
        inputCore: {
          ...state.inputCore,
          errors: {
            ...state.inputCore.errors,
            [inputType]: errors,
          },
        },
      })),
    initialize: async (params) => {
      // Initialize logic here
      console.log('Initializing with params:', params)
      
      // Load persisted mappings for all input types
      try {
        const inputTypes: InputType[] = ['job', 'vehicle', 'shipment']
        
        for (const inputType of inputTypes) {
          const persistedMapping = await mappingPersistence.loadMapping(inputType)
          if (persistedMapping) {
            set((state) => ({
              inputCore: {
                ...state.inputCore,
                [inputType]: {
                  ...state.inputCore[inputType],
                  mapConfig: persistedMapping,
                },
              },
            }))
            console.log(`Loaded persisted mapping for ${inputType}`)
          }
        }
        
        // Mark as initialized after successful completion
        set((state) => ({
          inputCore: {
            ...state.inputCore,
            isInitialized: true,
          },
        }))
      } catch (error) {
        console.error('Failed to load persisted mappings:', error)
        // Still mark as initialized even if there's an error to prevent infinite retries
        set((state) => ({
          inputCore: {
            ...state.inputCore,
            isInitialized: true,
          },
        }))
      }
    },
    setIsInitialized: (value) =>
      set((state) => ({
        inputCore: {
          ...state.inputCore,
          isInitialized: value,
        },
      })),
    setActiveTab: (tab) =>
      set((state) => ({
        inputCore: {
          ...state.inputCore,
          activeTab: tab,
        },
      })),
    loadPersistedMapping: async (inputType) => {
      try {
        const persistedMapping = await mappingPersistence.loadMapping(inputType)
        if (persistedMapping) {
          set((state) => ({
            inputCore: {
              ...state.inputCore,
              [inputType]: {
                ...state.inputCore[inputType],
                mapConfig: persistedMapping,
              },
            },
          }))
          console.log(`Loaded persisted mapping for ${inputType}`)
        }
      } catch (error) {
        console.error(`Failed to load persisted mapping for ${inputType}:`, error)
      }
    },
  },
  inputPhase: {
    page: InputPage.IMPORT,
    isTableEditable: false,
    scrollTableToRight: false,
    setPage: (page) =>
      set((state) => ({
        inputPhase: {
          ...state.inputPhase,
          page,
        },
      })),
    setIsTableEditable: (value) =>
      set((state) => ({
        inputPhase: {
          ...state.inputPhase,
          isTableEditable: value,
        },
      })),
    setScrollTableToRight: (value) =>
      set((state) => ({
        inputPhase: {
          ...state.inputPhase,
          scrollTableToRight: value,
        },
      })),
  },
  inputUI: {
    loading: false,
    lockPhrase: false,
    setLoading: (value) =>
      set((state) => ({
        inputUI: {
          ...state.inputUI,
          loading: value,
        },
      })),
    setLockPhrase: (value) =>
      set((state) => ({
        inputUI: {
          ...state.inputUI,
          lockPhrase: value,
        },
      })),
  },
})) 