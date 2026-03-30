'use client'

import { useEffect, useState } from 'react'
import { supabase, type Report } from '@/lib/supabase'

export default function Dashboard() {
  const [reports, setReports] = useState<Report[]>([])
  const [selected, setSelected] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [triggering, setTriggering] = useState(false)
  const [triggerMessage, setTriggerMessage] = useState('')

  useEffect(() => {
    fetchReports()
  }, [])

  async function fetchReports() {
    setLoading(true)
    const { data } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) {
      setReports(data)
      setSelected(data[0] ?? null)
    }
    setLoading(false)
  }

  async function triggerReport() {
    setTriggering(true)
    setTriggerMessage('')
    const res = await fetch('/api/trigger', { method: 'POST' })
    if (res.ok) {
      setTriggerMessage('Report triggered! Check back in ~1 minute.')
    } else {
      setTriggerMessage('Failed to trigger. Check GitHub token.')
    }
    setTriggering(false)
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">PM Agent Dashboard</h1>
          <p className="text-sm text-gray-400">AI-powered sprint reports · JIRA → Claude → Pumble</p>
        </div>
        <button
          onClick={triggerReport}
          disabled={triggering}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          {triggering ? 'Triggering...' : 'Run Report Now'}
        </button>
      </header>

      {triggerMessage && (
        <div className="mx-6 mt-4 px-4 py-3 bg-blue-900/40 border border-blue-700 rounded-lg text-sm text-blue-200">
          {triggerMessage}
        </div>
      )}

      {/* Mobile swipe hint */}
      <p className="md:hidden text-center text-xs text-gray-600 py-1 bg-gray-950">
        ← swipe to read report →
      </p>

      <div className="flex md:h-[calc(100vh-73px)] overflow-x-auto md:overflow-x-visible snap-x snap-mandatory md:snap-none scroll-smooth" style={{WebkitOverflowScrolling: 'touch'}}>
        {/* Sidebar — report history */}
        <aside className="snap-start min-w-full md:min-w-0 md:w-64 border-r border-gray-800 overflow-y-auto flex-shrink-0 h-[calc(100vh-100px)] md:h-auto">
          <div className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
            Report History
          </div>
          {loading ? (
            <div className="px-4 py-3 text-sm text-gray-500">Loading...</div>
          ) : reports.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500">No reports yet.</div>
          ) : (
            reports.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelected(r)}
                className={`w-full text-left px-4 py-3 border-b border-gray-800/50 hover:bg-gray-800 transition-colors ${
                  selected?.id === r.id ? 'bg-gray-800 border-l-2 border-l-blue-500' : ''
                }`}
              >
                <div className="text-sm font-medium text-gray-200">
                  {r.jira_project || 'SCRUM'}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {formatDate(r.created_at)}
                </div>
              </button>
            ))
          )}
        </aside>

        {/* Main content */}
        <main className="snap-start min-w-full md:min-w-0 flex-1 overflow-y-auto overflow-x-auto p-4 md:p-6 h-[calc(100vh-100px)] md:h-auto">
          {!selected ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              No report selected.
            </div>
          ) : (
            <div className="max-w-3xl space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {selected.jira_project} · {formatDate(selected.created_at)}
                </h2>
              </div>

              {/* Final Report */}
              <section className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                  Status Report
                </h3>
                <pre className="whitespace-pre-wrap text-sm text-gray-200 font-sans leading-relaxed">
                  {selected.final_report}
                </pre>
              </section>

              {/* Sprint Summary */}
              <section className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                  Sprint Summary
                </h3>
                <pre className="whitespace-pre-wrap text-sm text-gray-300 font-sans leading-relaxed">
                  {selected.sprint_summary}
                </pre>
              </section>

              {/* Risk Assessment */}
              <section className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                  Risk Assessment
                </h3>
                <pre className="whitespace-pre-wrap text-sm text-gray-300 font-sans leading-relaxed">
                  {selected.risk_assessment}
                </pre>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
