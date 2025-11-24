import { useState, useEffect } from 'react'
import { API_URL, API_KEY } from '../config/api'

export default function UsageMonitoring() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [metrics, setMetrics] = useState(null)
  const [lastRefresh, setLastRefresh] = useState(null)

  useEffect(() => {
    loadMetrics()
    const interval = setInterval(loadMetrics, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const loadMetrics = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`${API_URL}/portal-metrics`, {
        headers: {
          'X-API-KEY': API_KEY,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        },
        cache: 'no-store'
      })

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`)
      }

      const data = await response.json()
      setMetrics(data)
      setLastRefresh(new Date().toLocaleTimeString())
      setLoading(false)
    } catch (err) {
      console.error('Failed to load metrics:', err)
      setError(err.message)
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    if (!metrics || !metrics.recent_logs || metrics.recent_logs.length === 0) {
      alert('No data to export')
      return
    }

    try {
      const headers = ['Timestamp', 'Portal', 'Source', 'Brand', 'Model', 'Status', 'Response Time']
      const rows = metrics.recent_logs.map(log => [
        log.timestamp,
        log.portal || '',
        log.source || '',
        log.brand || '',
        log.model_number || '',
        log.success ? 'Success' : 'Failed',
        log.response_time || '0'
      ])

      const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const now = new Date()
      const dateStr = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2,'0')}-${now.getDate().toString().padStart(2,'0')}`
      a.download = `usage-${dateStr}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      alert('Failed to export: ' + err.message)
    }
  }

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">⚙️</div>
          <p className="text-xl text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error && !metrics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Analytics</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadMetrics}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const totals = metrics?.totals || {}
  const portals = metrics?.portals || {}
  const logs = metrics?.recent_logs || []

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Usage & Analytics</h2>
          <p className="text-gray-600 mt-1">Track API usage, costs, and performance</p>
          {lastRefresh && (
            <p className="text-sm text-gray-500 mt-1">Last updated: {lastRefresh}</p>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadMetrics}
            disabled={loading}
            className={`px-4 py-2 rounded-lg font-medium ${
              loading
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {loading ? '⏳ Loading...' : '🔄 Refresh'}
          </button>
          <button
            onClick={exportToCSV}
            disabled={logs.length === 0}
            className={`px-4 py-2 rounded-lg font-medium ${
              logs.length === 0
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            📥 Export CSV
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          icon="📊"
          label="Total Requests"
          value={totals.total_requests || 0}
        />
        <StatCard
          icon="✅"
          label="Successful"
          value={totals.successful_requests || 0}
          color="green"
        />
        <StatCard
          icon="❌"
          label="Failed"
          value={totals.failed_requests || 0}
          color="red"
        />
        <StatCard
          icon="📈"
          label="Success Rate"
          value={totals.total_requests > 0 
            ? `${((totals.successful_requests / totals.total_requests) * 100).toFixed(1)}%`
            : '0%'}
          color="blue"
        />
      </div>

      {/* Request Sources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1">UI Calls</p>
              <p className="text-4xl font-bold">{totals.ui_calls || 0}</p>
            </div>
            <div className="text-5xl">🖥️</div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm mb-1">API Calls</p>
              <p className="text-4xl font-bold">{totals.api_calls || 0}</p>
            </div>
            <div className="text-5xl">🔌</div>
          </div>
        </div>
      </div>

      {/* Portal Breakdown */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">📡 Portal Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <PortalCard
            name="Catalog API"
            icon="🛍️"
            stats={portals.catalog}
            color="blue"
          />
          <PortalCard
            name="Parts API"
            icon="🔧"
            stats={portals.parts}
            color="green"
          />
          <PortalCard
            name="Home Products API"
            icon="🏠"
            stats={portals.home_products}
            color="purple"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">🕒 Recent Activity</h3>
        {logs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg">No activity yet</p>
            <p className="text-sm">API calls will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Portal</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Response</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.slice(0, 20).reverse().map((log, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        log.portal === 'catalog' ? 'bg-blue-100 text-blue-700' :
                        log.portal === 'parts' ? 'bg-green-100 text-green-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {log.portal}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {log.source === 'ui' ? '🖥️ UI' : '🔌 API'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {log.brand} {log.model_number}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {log.success ? (
                        <span className="text-green-600 font-medium">✅ Success</span>
                      ) : (
                        <span className="text-red-600 font-medium">❌ Failed</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {log.response_time}s
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color = 'gray' }) {
  const colors = {
    gray: 'bg-gray-50 border-gray-200',
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    red: 'bg-red-50 border-red-200'
  }

  const textColors = {
    gray: 'text-gray-900',
    blue: 'text-blue-700',
    green: 'text-green-700',
    red: 'text-red-700'
  }

  return (
    <div className={`${colors[color]} rounded-xl p-6 border-2`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-3xl">{icon}</span>
      </div>
      <p className={`text-3xl font-bold mb-1 ${textColors[color]}`}>{value}</p>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  )
}

function PortalCard({ name, icon, stats, color }) {
  if (!stats) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">{icon}</span>
          <h4 className="text-lg font-semibold">{name}</h4>
        </div>
        <p className="text-gray-500 text-center py-4">No data</p>
      </div>
    )
  }

  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600'
  }

  const successRate = stats.total_requests > 0
    ? ((stats.successful_requests / stats.total_requests) * 100).toFixed(1)
    : '0'

  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-lg p-6 text-white shadow-lg`}>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">{icon}</span>
        <h4 className="text-lg font-semibold">{name}</h4>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-white/80">Total Requests</span>
          <span className="text-xl font-bold">{stats.total_requests}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-white/80">Success Rate</span>
          <span className="text-xl font-bold">{successRate}%</span>
        </div>

        <div className="flex justify-between">
          <span className="text-white/80">Avg Response</span>
          <span className="text-xl font-bold">{stats.avg_response_time.toFixed(2)}s</span>
        </div>

        <div className="pt-3 border-t border-white/20">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-white/80">🖥️ UI Calls</span>
            <span className="font-medium">{stats.ui_calls}</span>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-white/80">🔌 API Calls</span>
            <span className="font-medium">{stats.api_calls}</span>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-white/80">✅ Success</span>
            <span className="font-medium">{stats.successful_requests}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/80">❌ Failed</span>
            <span className="font-medium">{stats.failed_requests}</span>
          </div>
        </div>

        {stats.last_used && (
          <div className="pt-2 text-xs text-white/60">
            Last used: {new Date(stats.last_used).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  )
}
