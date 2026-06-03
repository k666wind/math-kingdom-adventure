import { useState, useEffect, useRef, useCallback } from 'react'

interface UseTimerReturn {
  timeRemaining: number
  percentRemaining: number
  isExpired: boolean
  reset: (newLimit: number) => void
  pause: () => void
  resume: () => void
}

export function useTimer(
  initialSeconds: number,
  onExpire?: () => void,
  bonusSeconds = 0,
): UseTimerReturn {
  const limit = initialSeconds + bonusSeconds
  const [timeRemaining, setTimeRemaining] = useState(limit)
  const [isPaused, setIsPaused] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const limitRef = useRef(limit)
  const onExpireRef = useRef(onExpire)
  onExpireRef.current = onExpire

  const clear = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
  }

  const start = useCallback((seconds: number) => {
    clear()
    setTimeRemaining(seconds)
    limitRef.current = seconds
    intervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clear()
          onExpireRef.current?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  useEffect(() => {
    start(limit)
    return clear
  }, [limit, start])

  const reset = useCallback((newLimit: number) => {
    setIsPaused(false)
    start(newLimit)
  }, [start])

  const pause = useCallback(() => {
    setIsPaused(true)
    clear()
  }, [])

  const resume = useCallback(() => {
    if (!isPaused) return
    setIsPaused(false)
    intervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clear()
          onExpireRef.current?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [isPaused])

  return {
    timeRemaining,
    percentRemaining: (timeRemaining / limitRef.current) * 100,
    isExpired: timeRemaining === 0,
    reset,
    pause,
    resume,
  }
}
