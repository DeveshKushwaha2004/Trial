import { useState, useEffect, useCallback } from 'react'
import Navbar from '../components/Navbar'
import GaugeDisplay from '../components/GaugeDisplay'
import LineChartCard from '../components/LineChartCard'
import StatusCard from '../components/StatusCard'
import AlertBanner from '../components/AlertBanner'
import useWebSocket from '../hooks/useWebSocket'
import useTracker from '../hooks/useTracker'
import { dataAPI } from '../utils/api'

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [history, setHistory] = useState([])
  const [loadPercentage, setLoadPercentage] = useState(0)
  const [loadLabel, setLoadLabel] = useState('Low')
  const [showAlert, setShowAlert] = useState(false)

  const { prediction, connected, sendData } = useWebSocket()

  // Send tracked data via WebSocket
  const handleTrackerData = useCallback(
    (data) => {
      sendData(data)
    },
    [sendData]
  )

  useTracker(handleTrackerData)

  // Update on new prediction
  useEffect(() => {
    if (prediction) {
      setLoadPercentage(prediction.load_percentage)
      setLoadLabel(prediction.predicted_load)
    }
  }, [prediction])

  // Fetch history and summary
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [histRes, sumRes] = await Promise.all([
          dataAPI.getHistory(7),
          dataAPI.getSummary(),
        ])
        setHistory(histRes.data)
        setSummary(sumRes.data)

        if (sumRes.data.high_load_minutes >= 10) {
          setShowAlert(true)
        }

        // Set initial load from summary
        if (sumRes.data.load_percentage) {
          setLoadPercentage(sumRes.data.load_percentage)
          setLoadLabel(sumRes.data.latest_load)
        }
      } catch {
        // ignore fetch errors on mount
      }
    }
    fetchData()
    const interval = setInterval(fetchData, 30000) // refresh every 30s
    return () => clearInterval(interval)
  }, [])

  // Format timestamps for charts
  const formatTime = (ts) => {
    const d = new Date(ts)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const chartLabels = history.map((r) => formatTime(r.timestamp))
  const loadMap = { Low: 25, Medium: 50, High: 85 }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <AlertBanner show={showAlert} />

        {/* Connection Status */}
        <div className="flex items-center gap-2 mb-6">
          <div className={`w-2.5 h-2.5 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-400">
            {connected ? 'Real-time tracking active' : 'Connecting...'}
          </span>
        </div>

        {/* Top Row: Gauge + Status Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <div className="lg:col-span-1">
            <GaugeDisplay percentage={loadPercentage} label={loadLabel} />
          </div>
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <StatusCard
              title="Avg Typing Speed"
              value={summary?.avg_typing_speed?.toFixed(1) || '0'}
              subtitle="keys/sec"
              icon="⌨️"
              color="text-blue-400"
            />
            <StatusCard
              title="Avg Backspace Rate"
              value={summary?.avg_backspace_rate?.toFixed(2) || '0'}
              subtitle="ratio"
              icon="⌫"
              color="text-amber-400"
            />
            <StatusCard
              title="Avg Mouse Jitter"
              value={summary?.avg_mouse_jitter?.toFixed(1) || '0'}
              subtitle="direction changes"
              icon="🖱️"
              color="text-purple-400"
            />
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <LineChartCard
            title="Cognitive Load Trend"
            labels={chartLabels}
            data={history.map((r) => loadMap[r.predicted_load] || 0)}
            color="#6366f1"
            fillColor="rgba(99,102,241,0.15)"
          />
          <LineChartCard
            title="Typing Speed"
            labels={chartLabels}
            data={history.map((r) => r.typing_speed)}
            color="#3b82f6"
            fillColor="rgba(59,130,246,0.15)"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LineChartCard
            title="Backspace Frequency"
            labels={chartLabels}
            data={history.map((r) => r.backspace_rate)}
            color="#f59e0b"
            fillColor="rgba(245,158,11,0.15)"
          />
          <LineChartCard
            title="Mouse Jitter"
            labels={chartLabels}
            data={history.map((r) => r.mouse_jitter)}
            color="#a855f7"
            fillColor="rgba(168,85,247,0.15)"
          />
        </div>

        {/* Data Summary */}
        <div className="mt-6 card">
          <h3 className="text-lg font-semibold text-gray-300 mb-3">Weekly Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary-400">{summary?.total_records || 0}</p>
              <p className="text-sm text-gray-500">Data Points</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">{loadLabel}</p>
              <p className="text-sm text-gray-500">Current Status</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-400">{summary?.high_load_minutes?.toFixed(1) || 0}</p>
              <p className="text-sm text-gray-500">High Load (min)</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-400">{loadPercentage.toFixed(1)}%</p>
              <p className="text-sm text-gray-500">Load Level</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
