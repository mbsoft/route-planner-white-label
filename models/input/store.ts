import { create } from 'zustand'
import { InputCoreSlice, InputType } from './input-core'
import { InputPhaseSlice, InputPage } from './input-phase'
import { InputUISlice } from './input-ui'

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