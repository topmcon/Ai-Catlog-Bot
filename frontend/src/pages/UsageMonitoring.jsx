import { useState, useEffect } from 'react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format, subDays } from 'date-fns'
import { API_URL, API_KEY } from '../config/api'

export default function UsageMonitoring() {
  const [stats, setStats] = useState({
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    totalCost: 0,
    averageResponseTime: 0,
    todayRequests: 0
  })

  const [portalStats, setPortalStats] = useState({
    catalog: null,
    parts: null,
    home_products: null
  })

  const [sourceStats, setSourceStats] = useState({
    ui_calls: 0,
    api_calls: 0
  })

  const [requestLogs, setRequestLogs] = useState([])
  const [timeRange, setTimeRange] = useState('7days')
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPortalMetrics()
    // Refresh every 30 seconds
    const interval = setInterval(loadPortalMetrics, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Load mock data for charts (will be replaced with real data later)
    loadMockData()
  }, [timeRange])

  const loadPortalMetrics = async () => {
    try {
      const response = await fetch(`${API_URL}/portal-metrics`, {
        headers: {
          'X-API-KEY': API_KEY
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setPortalStats(data.portals)
        setSourceStats({
          ui_calls: data.totals.ui_calls || 0,
          api_calls: data.totals.api_calls || 0
        })
        setRequestLogs(data.recent_logs || [])
        
        // Calculate average response time safely
        const avgResponseTime = data.totals.total_requests > 0
          ? ((data.portals.catalog.avg_response_time + 
             data.portals.parts.avg_response_time + 
             data.portals.home_products.avg_response_time) / 3).toFixed(1)
          : "0.0"
        
        setStats({
          totalRequests: data.totals.total_requests || 0,
          successfulRequests: data.totals.successful_requests || 0,
          failedRequests: data.totals.failed_requests || 0,
          totalCost: ((data.totals.total_requests || 0) * 0.001).toFixed(3),
          averageResponseTime: avgResponseTime,
          todayRequests: data.totals.total_requests || 0
        })
      }
      setLoading(false)
    } catch (error) {
      console.error('Failed to load portal metrics:', error)
      setLoading(false)
    }
  }

  const loadMockData = () => {
    // Generate mock chart data
    const days = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 1
    const data = []
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i)
      data.push({
        date: format(date, 'MM/dd'),
        requests: Math.floor(Math.random() * 50) + 30,
        cost: (Math.random() * 0.08 + 0.02).toFixed(3),
        avgTime: (Math.random() * 5 + 10).toFixed(1)
      })
    }
    
    setChartData(data)

    // Generate mock logs
    const logs = []
    for (let i = 0; i < 20; i++) {
      logs.push({
        id: i + 1,
        timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        brand: ['Fisher & Paykel', 'Miele', 'Bosch', 'Samsung', 'LG'][Math.floor(Math.random() * 5)],
        model: `MODEL-${Math.floor(Math.random() * 9000) + 1000}`,
        status: Math.random() > 0.1 ? 'success' : 'error',
        responseTime: (Math.random() * 20 + 5).toFixed(2),
        cost: (Math.random() * 0.002 + 0.0005).toFixed(4)
      })
    }
    
    setRequestLogs(logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)))
  }

  const statusDistribution = [
    { name: 'Success', value: stats.successfulRequests, color: '#10b981' },
    { name: 'Failed', value: stats.failedRequests, color: '#ef4444' }
  ]

  const exportToCSV = () => {
    if (requestLogs.length === 0) {
      alert('No data to export')
      return
    }
    
    const headers = ['Timestamp', 'Portal', 'Source', 'Brand', 'Model Number', 'Status', 'Response Time (s)']
    const rows = requestLogs.map(log => [
      log.timestamp,
      log.portal,
      log.source,
      log.brand || '',
      log.model_number || '',
      log.success ? 'success' : 'failed',
      log.response_time
    ])

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `catalog-bot-usage-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Usage Monitoring</h2>
          <p className="text-gray-600 mt-1">Track API usage, costs, and performance</p>
        </div>
        <button
          onClick={exportToCSV}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <span>📥</span>
          <span>Export CSV</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon="📊"
          label="Total Requests"
          value={loading ? "Loading..." : stats.totalRequests.toLocaleString()}
          change=""
          changeType="neutral"
        />
        <StatCard
          icon="💰"
          label="Est. Total Cost"
          value={loading ? "..." : `$${stats.totalCost}`}
          change=""
          changeType="neutral"
        />
        <StatCard
          icon="⚡"
          label="Avg Response Time"
          value={loading ? "..." : `${stats.averageResponseTime}s`}
          change=""
          changeType="positive"
        />
        <StatCard
          icon="✅"
          label="Success Rate"
          value={loading ? "..." : `${stats.totalRequests > 0 ? ((stats.successfulRequests / stats.totalRequests) * 100).toFixed(1) : 0}%`}
          change=""
          changeType="positive"
        />
      </div>

      {/* Portal Breakdown */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">📡 Portal Usage Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <PortalCard
            name="Product Catalog"
            icon="🔍"
            stats={portalStats.catalog}
            color="blue"
            loading={loading}
          />
          <PortalCard
            name="Parts Portal"
            icon="⚙️"
            stats={portalStats.parts}
            color="green"
            loading={loading}
          />
          <PortalCard
            name="Home Products"
            icon="🏠"
            stats={portalStats.home_products}
            color="purple"
            loading={loading}
          />
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Analytics</h3>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="24hours">Last 24 Hours</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
          </select>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Request Volume Chart */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Request Volume</h4>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Legend />
                <Line type="monotone" dataKey="requests" stroke="#3b82f6" strokeWidth={2} name="Requests" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Cost Chart */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Daily Cost ($)</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Legend />
                <Bar dataKey="cost" fill="#10b981" name="Cost" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Source Distribution (UI vs API) */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Call Source Distribution</h3>
          {loading ? (
            <div className="text-center text-gray-500 py-4">Loading...</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Portal UI', value: sourceStats.ui_calls, color: '#3b82f6' },
                    { name: 'Direct API', value: sourceStats.api_calls, color: '#8b5cf6' }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill="#3b82f6" />
                  <Cell fill="#8b5cf6" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">🖥️ Portal UI Calls:</span>
              <span className="font-semibold">{sourceStats.ui_calls}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">🔌 Direct API Calls:</span>
              <span className="font-semibold">{sourceStats.api_calls}</span>
            </div>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Cost Breakdown</h3>
          <div className="space-y-3">
            <CostRow label="API Calls" value={`$${(stats.totalCost * 0.95).toFixed(2)}`} percentage={95} />
            <CostRow label="Storage" value={`$${(stats.totalCost * 0.03).toFixed(2)}`} percentage={3} />
            <CostRow label="Other" value={`$${(stats.totalCost * 0.02).toFixed(2)}`} percentage={2} />
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span className="text-blue-600">${stats.totalCost.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Performance</h3>
          <div className="space-y-4">
            <MetricRow label="Min Response Time" value="4.2s" icon="🏃" />
            <MetricRow label="Max Response Time" value="28.7s" icon="🐌" />
            <MetricRow label="Avg Response Time" value={`${stats.averageResponseTime}s`} icon="⚡" />
            <MetricRow label="P95 Response Time" value="18.3s" icon="📊" />
          </div>
        </div>
      </div>

      {/* Request Logs Table */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Requests (Last 50)</h3>
        {loading ? (
          <div className="text-center text-gray-500 py-8">Loading request logs...</div>
        ) : requestLogs.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No requests yet. Start using the portals!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Timestamp</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Portal</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Source</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Brand</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Model</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Time (s)</th>
                </tr>
              </thead>
              <tbody>
                {requestLogs.slice().reverse().map((log, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {format(new Date(log.timestamp), 'MMM dd, HH:mm:ss')}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        log.portal === 'catalog' ? 'bg-blue-100 text-blue-800' :
                        log.portal === 'parts' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {log.portal === 'catalog' ? '🔍 Catalog' :
                         log.portal === 'parts' ? '⚙️ Parts' :
                         '🏠 Home Products'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        log.source === 'ui' 
                          ? 'bg-indigo-100 text-indigo-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {log.source === 'ui' ? '🖥️ Portal UI' : '🔌 Direct API'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                      {log.brand || <span className="text-gray-400">N/A</span>}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 font-mono">
                      {log.model_number || <span className="text-gray-400">N/A</span>}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        log.success
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {log.success ? '✓ Success' : '✗ Failed'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 font-mono">{log.response_time}s</td>
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

function StatCard({ icon, label, value, change, changeType }) {
  const changeColor = changeType === 'positive' ? 'text-green-600' : 
                      changeType === 'negative' ? 'text-red-600' : 'text-gray-600'

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-3xl">{icon}</span>
        <span className={`text-sm font-medium ${changeColor}`}>{change}</span>
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  )
}

function CostRow({ label, value, percentage }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-700">{label}</span>
        <span className="font-medium text-gray-900">{value}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

function MetricRow({ label, value, icon }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <span className="text-xl">{icon}</span>
        <span className="text-sm text-gray-700">{label}</span>
      </div>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  )
}

function PortalCard({ name, icon, stats, color, loading }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600'
  }

  if (loading || !stats) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <span className="text-3xl">{icon}</span>
          <h4 className="text-lg font-semibold text-gray-900">{name}</h4>
        </div>
        <div className="text-center text-gray-500 py-4">Loading...</div>
      </div>
    )
  }

  const successRate = stats.total_requests > 0 
    ? ((stats.successful_requests / stats.total_requests) * 100).toFixed(1) 
    : 0

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-lg p-6 text-white shadow-lg`}>
      <div className="flex items-center space-x-3 mb-4">
        <span className="text-3xl">{icon}</span>
        <h4 className="text-lg font-semibold">{name}</h4>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-white/80">Total Requests</span>
          <span className="text-2xl font-bold">{stats.total_requests.toLocaleString()}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-white/80">Success Rate</span>
          <span className="text-xl font-semibold">{successRate}%</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-white/80">Avg Response</span>
          <span className="text-xl font-semibold">{stats.avg_response_time.toFixed(2)}s</span>
        </div>
        
        <div className="mt-4 pt-3 border-t border-white/20">
          <div className="flex justify-between text-sm">
            <span className="text-white/80">🖥️ UI Calls:</span>
            <span className="font-medium">{stats.ui_calls}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-white/80">🔌 API Calls:</span>
            <span className="font-medium">{stats.api_calls}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-white/80">✅ Success:</span>
            <span className="font-medium">{stats.successful_requests}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-white/80">❌ Failed:</span>
            <span className="font-medium">{stats.failed_requests}</span>
          </div>
        </div>
        
        {stats.last_used && (
          <div className="mt-3 text-xs text-white/60">
            Last used: {format(new Date(stats.last_used), 'MMM dd, HH:mm:ss')}
          </div>
        )}
      </div>
    </div>
  )
}
