import { useState } from 'react'

export default function AlertBanner({ show }) {
  const [dismissed, setDismissed] = useState(false)

  if (!show || dismissed) return null

  return (
    <div className="bg-red-900/40 border border-red-700 rounded-xl p-4 mb-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-2xl">⚠️</span>
        <div>
          <p className="font-semibold text-red-300">High Cognitive Load Detected</p>
          <p className="text-sm text-red-400">
            You seem mentally fatigued. Consider taking a short break.
          </p>
        </div>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-red-400 hover:text-red-300 text-xl px-2"
        aria-label="Dismiss alert"
      >
        ✕
      </button>
    </div>
  )
}
