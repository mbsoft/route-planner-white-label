export interface InputUISlice {
  loading: boolean
  lockPhrase: boolean
  setLoading: (value: boolean) => void
  setLockPhrase: (value: boolean) => void
} 