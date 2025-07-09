export enum InputPage {
  IMPORT = 'import',
  PREVIEW = 'preview',
}

export interface InputPhaseSlice {
  page: InputPage
  isTableEditable: boolean
  scrollTableToRight: boolean
  setPage: (page: InputPage) => void
  setIsTableEditable: (value: boolean) => void
  setScrollTableToRight: (value: boolean) => void
} 