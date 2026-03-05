import { useEffect, useRef, useCallback } from 'react'

export default function useTracker(onData) {
  const state = useRef({
    keyCount: 0,
    backspaceCount: 0,
    keySpeeds: [],
    lastKeyTime: 0,
    mousePositions: [],
    lastMousePos: null,
    tabSwitchCount: 0,
  })

  const intervalRef = useRef(null)

  const collectAndSend = useCallback(() => {
    const s = state.current
    const elapsed = 5 // 5-second window

    // Typing speed (keys per second)
    const typingSpeed = s.keyCount / elapsed

    // Speed variance
    const speeds = s.keySpeeds
    let speedVariance = 0
    if (speeds.length > 1) {
      const mean = speeds.reduce((a, b) => a + b, 0) / speeds.length
      speedVariance = speeds.reduce((a, b) => a + (b - mean) ** 2, 0) / speeds.length
    }

    // Backspace frequency
    const backspaceRate = s.keyCount > 0 ? s.backspaceCount / s.keyCount : 0

    // Mouse distance
    let mouseDistance = 0
    let mouseJitter = 0
    const positions = s.mousePositions
    if (positions.length > 1) {
      let directionChanges = 0
      let prevDx = 0
      let prevDy = 0

      for (let i = 1; i < positions.length; i++) {
        const dx = positions[i].x - positions[i - 1].x
        const dy = positions[i].y - positions[i - 1].y
        mouseDistance += Math.sqrt(dx * dx + dy * dy)

        if (i > 1) {
          if ((dx > 0 && prevDx < 0) || (dx < 0 && prevDx > 0)) directionChanges++
          if ((dy > 0 && prevDy < 0) || (dy < 0 && prevDy > 0)) directionChanges++
        }
        prevDx = dx
        prevDy = dy
      }
      mouseJitter = directionChanges
    }

    const data = {
      typing_speed: parseFloat(typingSpeed.toFixed(3)),
      speed_variance: parseFloat(speedVariance.toFixed(3)),
      backspace_rate: parseFloat(backspaceRate.toFixed(3)),
      mouse_distance: parseFloat(mouseDistance.toFixed(2)),
      mouse_jitter: mouseJitter,
      tab_switch_count: s.tabSwitchCount,
    }

    onData(data)

    // Reset
    s.keyCount = 0
    s.backspaceCount = 0
    s.keySpeeds = []
    s.mousePositions = []
    s.tabSwitchCount = 0
  }, [onData])

  useEffect(() => {
    const s = state.current

    const handleKeyDown = (e) => {
      s.keyCount++
      if (e.key === 'Backspace') s.backspaceCount++

      const now = Date.now()
      if (s.lastKeyTime > 0) {
        const gap = (now - s.lastKeyTime) / 1000
        if (gap < 2) s.keySpeeds.push(1 / gap)
      }
      s.lastKeyTime = now
    }

    const handleMouseMove = (e) => {
      s.mousePositions.push({ x: e.clientX, y: e.clientY })
    }

    const handleVisibilityChange = () => {
      if (document.hidden) s.tabSwitchCount++
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    intervalRef.current = setInterval(collectAndSend, 5000)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [collectAndSend])
}
