export type UseCase = 'jobs' | 'shipments'

export function getUseCase(): UseCase {
  const useCase = process.env.NEXT_PUBLIC_USE_CASE || 'jobs'
  return useCase === 'shipments' ? 'shipments' : 'jobs'
}

export function useUseCase(): UseCase {
  // For client-side, we need to use NEXT_PUBLIC_ prefix
  if (typeof window !== 'undefined') {
    const useCase = process.env.NEXT_PUBLIC_USE_CASE || 'jobs'
    return useCase === 'shipments' ? 'shipments' : 'jobs'
  }
  
  // For server-side
  return getUseCase()
} 