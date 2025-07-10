export type InputType = 'job' | 'vehicle' | 'shipment'

export interface RawData {
  header: string[]
  rows: string[][]
  attachedRows: string[][]
}

export interface MapConfig {
  dataMappings: DataMapping[]
  metaMappings: MetaMapping[]
}

export interface DataMapping {
  index: number
  value: string
  realKey?: string
}

export interface MetaMapping {
  index: number
  value: string
  realKey: string
}

export interface InputErrorInfo {
  rowIndex: number
  columnIndex: number
  message: string
}

export interface InputState {
  job: {
    rawData: RawData
    mapConfig: MapConfig
    selection: boolean[]
  }
  vehicle: {
    rawData: RawData
    mapConfig: MapConfig
    selection: boolean[]
  }
  shipment: {
    rawData: RawData
    mapConfig: MapConfig
    selection: boolean[]
  }
  errors: Record<InputType, InputErrorInfo[]>
  isInitialized: boolean
}

export interface InputCoreSlice {
  activeTab: InputType
  job: InputState['job']
  vehicle: InputState['vehicle']
  shipment: InputState['shipment']
  errors: InputState['errors']
  isInitialized: boolean
  setActiveTab: (tab: InputType) => void
  setRawData: (inputType: InputType, data: RawData) => void
  setMapConfig: (inputType: InputType, config: MapConfig) => void
  resetMapping: (inputType: InputType) => void
  appendAttachedRows: (inputType: InputType) => void
  copyAttributeColumn: (inputType: InputType, params: { columnIndex: number; rowIndex: number }) => void
  setErrors: (inputType: InputType, errors: InputErrorInfo[]) => void
  initialize: (params: { isFleetifyEnable: boolean; isTelematicEnable: boolean }) => Promise<void>
  setIsInitialized: (value: boolean) => void
  setRowSelected: (inputType: InputType, rowIndex: number, selected: boolean) => void
  setAllRowsSelected: (inputType: InputType, selected: boolean) => void
  clearSelection: (inputType: InputType) => void
} 