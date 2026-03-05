import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

export default function LineChartCard({ title, labels, data, color = '#6366f1', fillColor = 'rgba(99,102,241,0.1)' }) {
  const chartData = {
    labels,
    datasets: [
      {
        label: title,
        data,
        borderColor: color,
        backgroundColor: fillColor,
        fill: true,
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 5,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      x: {
        ticks: { color: '#6b7280', maxTicksLimit: 8 },
        grid: { color: 'rgba(75,85,99,0.3)' },
      },
      y: {
        ticks: { color: '#6b7280' },
        grid: { color: 'rgba(75,85,99,0.3)' },
      },
    },
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-300 mb-4">{title}</h3>
      <div className="h-56">
        <Line data={chartData} options={options} />
      </div>
    </div>
  )
}
