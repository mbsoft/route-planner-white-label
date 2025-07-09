import { create } from 'zustand'
import { InputCoreSlice } from './input-core'
import { InputPhaseSlice } from './input-phase'
import { InputUISlice } from './input-ui'

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
    activeTab: 'job' as const,
    job: {
      rawData: { header: [], rows: [], attachedRows: [] },
      mapConfig: { dataMappings: [], metaMappings: [] },
    },
    vehicle: {
      rawData: { header: [], rows: [], attachedRows: [] },
      mapConfig: { dataMappings: [], metaMappings: [] },
    },
    shipment: {
      rawData: { header: [], rows: [], attachedRows: [] },
      mapConfig: { dataMappings: [], metaMappings: [] },
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
          },
        },
      })),
    setMapConfig: (inputType, config) =>
      set((state) => ({
        inputCore: {
          ...state.inputCore,
          [inputType]: {
            ...state.inputCore[inputType],
            mapConfig: config,
          },
        },
      })),
    resetMapping: (inputType) =>
      set((state) => ({
        inputCore: {
          ...state.inputCore,
          [inputType]: {
            ...state.inputCore[inputType],
            mapConfig: { dataMappings: [], metaMappings: [] },
          },
        },
      })),
    appendAttachedRows: (inputType) =>
      set((state) => {
        const currentData = state.inputCore[inputType].rawData
        const newAttachedRows = [...currentData.attachedRows, Array(currentData.header.length).fill('')]
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
  },
  inputPhase: {
    page: 'import' as const,
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