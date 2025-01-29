import { useErrorBoundary as useReactErrorBoundary } from 'react-error-boundary'

export function useCustomErrorBoundary() {
  const { showBoundary } = useReactErrorBoundary()
  return { triggerError: showBoundary }
} 