import GaugeChart from 'react-gauge-chart'

export default function GaugeDisplay({ percentage = 0, label = 'Low' }) {
  const colorByLabel = {
    Low: '#22c55e',
    Medium: '#f59e0b',
    High: '#ef4444',
  }

  return (
    <div className="card text-center">
      <h3 className="text-lg font-semibold text-gray-300 mb-4">Cognitive Load</h3>
      <GaugeChart
        id="cognitive-gauge"
        nrOfLevels={3}
        colors={['#22c55e', '#f59e0b', '#ef4444']}
        arcWidth={0.3}
        percent={percentage / 100}
        textColor="#e5e7eb"
        needleColor="#6366f1"
        needleBaseColor="#6366f1"
      />
      <div className="mt-4">
        <span
          className="text-2xl font-bold"
          style={{ color: colorByLabel[label] || '#e5e7eb' }}
        >
          {label}
        </span>
        <p className="text-gray-500 text-sm mt-1">{percentage.toFixed(1)}% load</p>
      </div>
    </div>
  )
}
