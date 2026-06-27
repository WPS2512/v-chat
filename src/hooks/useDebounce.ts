import { useEffect, useRef } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = [
    value,
    (v: T) => { debouncedValueRef.current = v }
  ]
  const debouncedValueRef = useRef(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, delay])

  return debouncedValueRef.current
}
