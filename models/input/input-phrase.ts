export enum InputOption {
  PREFERENCE = 'preference',
  ORDER = 'order',
  VEHICLE = 'vehicle',
  DEPOT = 'depot',
}

export enum InputPage {
  IMPORT = 'import',
  PREVIEW = 'preview',
}

export type InputType = 'job' | 'vehicle' | 'shipment' | 'depot'

export interface InputPhaseState {
  page: InputPage
  phase: InputOption
  isTableEditable: boolean
  enableDepot: boolean
  scrollTableToRight: boolean
}

export const initialInputPhaseState: InputPhaseState = {
  page: InputPage.IMPORT,
  phase: InputOption.PREFERENCE,
  enableDepot: false,
  isTableEditable: false,
  scrollTableToRight: false,
} 