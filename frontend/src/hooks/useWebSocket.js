import { useEffect, useRef, useState, useCallback } from 'react'
import { getToken } from '../utils/auth'

export default function useWebSocket() {
  const ws = useRef(null)
  const [prediction, setPrediction] = useState(null)
  const [connected, setConnected] = useState(false)

  const connect = useCallback(() => {
    const token = getToken()
    if (!token) return

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = import.meta.env.VITE_WS_URL || `${protocol}//${window.location.host}`
    const url = `${host}/ws/predict?token=${token}`

    ws.current = new WebSocket(url)

    ws.current.onopen = () => setConnected(true)
    ws.current.onclose = () => {
      setConnected(false)
      setTimeout(connect, 3000)
    }
    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        setPrediction(data)
      } catch {
        // ignore parse errors
      }
    }
  }, [])

  const sendData = useCallback((data) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data))
    }
  }, [])

  const disconnect = useCallback(() => {
    if (ws.current) {
      ws.current.onclose = null
      ws.current.close()
      setConnected(false)
    }
  }, [])

  useEffect(() => {
    connect()
    return disconnect
  }, [connect, disconnect])

  return { prediction, connected, sendData, disconnect }
}
