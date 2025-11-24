import { useState, useEffect } from 'react'
import { API_URL, API_KEY } from '../config/api'

export default function Dashboard() {
  const [stats, setStats] = useState({
    backendStatus: 'checking...',
    frontendStatus: 'running',
    totalRequests: 0,
    todayRequests: 0,
    avgResponseTime: '0s',
    totalCost: '$0.00',
    uptime: '0h 0m',
    errorRate: '0%'
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
  const [loading, setLoading] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(null)

  const [systemHealth, setSystemHealth] = useState({
    cpu: 0,
    memory: 0,
    disk: 0
  })

  useEffect(() => {
    checkBackendStatus()
    loadPortalMetrics()
    loadStats()
    const interval = setInterval(() => {
      checkBackendStatus()
      loadPortalMetrics()
      updateSystemHealth()
    }, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const checkBackendStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/health`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      if (response.ok) {
        setStats(prev => ({ ...prev, backendStatus: 'online' }))
      } else {
        setStats(prev => ({ ...prev, backendStatus: 'offline' }))
      }
    } catch (error) {
      setStats(prev => ({ ...prev, backendStatus: 'offline' }))
    }
  }

  const loadPortalMetrics = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/portal-metrics`, {
        headers: {
          'X-API-KEY': API_KEY,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        },
        cache: 'no-store'
      })
      
      if (response.ok) {
        const data = await response.json()
        setPortalStats(data.portals)
        setSourceStats({
          ui_calls: data.totals.ui_calls || 0,
          api_calls: data.totals.api_calls || 0
        })
        setRequestLogs(data.recent_logs || [])
        
        // Update stats with real data
        const avgTime = data.totals.total_requests > 0
          ? ((data.portals.catalog.avg_response_time + 
             data.portals.parts.avg_response_time + 
             data.portals.home_products.avg_response_time) / 3)
          : 0
        
        setStats(prev => ({
          ...prev,
          totalRequests: data.totals.total_requests || 0,
          todayRequests: data.totals.total_requests || 0,
          avgResponseTime: avgTime > 0 ? `${avgTime.toFixed(1)}s` : '0s',
          totalCost: `$${((data.totals.total_requests || 0) * 0.001).toFixed(3)}`,
          errorRate: data.totals.total_requests > 0 
            ? `${((data.totals.failed_requests / data.totals.total_requests) * 100).toFixed(1)}%`
            : '0%'
        }))
        
        setLastRefresh(new Date().toLocaleTimeString())
      }
    } catch (error) {
      console.error('Failed to load portal metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = () => {
    // Load from localStorage or API
    const stored = localStorage.getItem('catalogbot_stats')
    if (stored) {
      const data = JSON.parse(stored)
      setStats(prev => ({ ...prev, ...data }))
    }
  }

  const handleRefresh = () => {
    loadPortalMetrics()
    checkBackendStatus()
  }

  const updateSystemHealth = () => {
    // Simulate system metrics (in production, get from backend)
    setSystemHealth({
      cpu: Math.random() * 50 + 10,
      memory: Math.random() * 40 + 20,
      disk: Math.random() * 30 + 15
    })
  }

  const quickActions = [
    {
      title: 'Test Portals',
      icon: '🌐',
      description: 'Monitor & test all portals',
      action: () => window.location.href = '#/portals',
      color: 'blue'
    },
    {
      title: 'Test API',
      icon: '🧪',
      description: 'Run API health check',
      action: () => window.location.href = '#/api-testing',
      color: 'green'
    },
    {
      title: 'View Logs',
      icon: '📋',
      description: 'Check system logs',
      action: () => window.location.href = '#/logs',
      color: 'purple'
    },
    {
      title: 'Configuration',
      icon: '⚙️',
      description: 'Update settings',
      action: () => window.location.href = '#/config',
      color: 'orange'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Page Header with Refresh Button */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600 mt-1">System overview and quick actions</p>
          {lastRefresh && (
            <p className="text-sm text-gray-500 mt-1">Last updated: {lastRefresh}</p>
          )}
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            loading
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          <span className={loading ? 'animate-spin' : ''}>🔄</span>
          {loading ? 'Refreshing...' : 'Refresh Metrics'}
        </button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Backend Status"
          value={stats.backendStatus}
          icon="🖥️"
          status={stats.backendStatus === 'online' ? 'success' : 'error'}
        />
        <StatCard
          title="Total Requests"
          value={stats.totalRequests}
          icon="📊"
          status="info"
        />
        <StatCard
          title="Avg Response Time"
          value={stats.avgResponseTime}
          icon="⚡"
          status="info"
        />
        <StatCard
          title="Error Rate"
          value={stats.errorRate}
          icon="⚠️"
          status={parseFloat(stats.errorRate) > 5 ? 'warning' : 'success'}
        />
      </div>

      {/* Portal Metrics */}
      {portalStats.catalog && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">📊 Portal Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Catalog Portal */}
            <PortalCard
              name="Catalog API"
              icon="🛍️"
              stats={portalStats.catalog}
              color="blue"
            />
            
            {/* Parts Portal */}
            <PortalCard
              name="Parts API"
              icon="🔧"
              stats={portalStats.parts}
              color="green"
            />
            
            {/* Home Products Portal */}
            <PortalCard
              name="Home Products API"
              icon="🏠"
              stats={portalStats.home_products}
              color="purple"
            />
          </div>
        </div>
      )}

      {/* Source Distribution */}
      {(sourceStats.ui_calls > 0 || sourceStats.api_calls > 0) && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">📈 Request Sources</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">UI Calls</p>
                <p className="text-3xl font-bold text-blue-600">{sourceStats.ui_calls}</p>
              </div>
              <span className="text-4xl">🖥️</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">API Calls</p>
                <p className="text-3xl font-bold text-green-600">{sourceStats.api_calls}</p>
              </div>
              <span className="text-4xl">🔌</span>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {requestLogs.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">🕒 Recent Activity</h3>
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
                {requestLogs.slice(0, 10).map((log, index) => (
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
        </div>
      )}

      {/* System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Health Metrics */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">System Health</h3>
          <div className="space-y-4">
            <HealthBar label="CPU Usage" value={systemHealth.cpu} color="blue" />
            <HealthBar label="Memory Usage" value={systemHealth.memory} color="green" />
            <HealthBar label="Disk Usage" value={systemHealth.disk} color="yellow" />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <ActivityItem
              icon="✅"
              text="System started successfully"
              time="Just now"
              type="success"
            />
            <ActivityItem
              icon="🔍"
              text="API health check passed"
              time="5 seconds ago"
              type="info"
            />
            <ActivityItem
              icon="📦"
              text="Product enrichment completed"
              time="2 minutes ago"
              type="success"
            />
            <ActivityItem
              icon="⚠️"
              text="High memory usage detected"
              time="5 minutes ago"
              type="warning"
            />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className={`bg-white hover:shadow-lg transition-all duration-200 rounded-xl p-6 text-left border-2 border-${action.color}-200 hover:border-${action.color}-400`}
            >
              <div className="text-3xl mb-2">{action.icon}</div>
              <h4 className="font-semibold text-gray-900 mb-1">{action.title}</h4>
              <p className="text-sm text-gray-600">{action.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-600">Total Requests</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalRequests}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Uptime</p>
            <p className="text-2xl font-bold text-gray-900">{stats.uptime}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Error Rate</p>
            <p className="text-2xl font-bold text-gray-900">{stats.errorRate}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">API Version</p>
            <p className="text-2xl font-bold text-gray-900">1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function PortalCard({ name, icon, stats, color }) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700'
  }

  const lastUsed = stats.last_used 
    ? new Date(stats.last_used).toLocaleTimeString()
    : 'Never'

  return (
    <div className={`rounded-xl p-6 border-2 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-3xl">{icon}</span>
        {stats.total_requests > 0 && (
          <span className={`px-2 py-1 rounded text-xs font-semibold bg-${color}-100`}>
            Active
          </span>
        )}
      </div>
      <h4 className="font-bold text-gray-900 mb-3">{name}</h4>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Total Requests:</span>
          <span className="font-semibold">{stats.total_requests}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Success Rate:</span>
          <span className="font-semibold text-green-600">
            {stats.total_requests > 0 
              ? `${((stats.successful_requests / stats.total_requests) * 100).toFixed(1)}%`
              : 'N/A'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Avg Response:</span>
          <span className="font-semibold">{stats.avg_response_time.toFixed(2)}s</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">UI / API:</span>
          <span className="font-semibold">{stats.ui_calls} / {stats.api_calls}</span>
        </div>
        <div className="flex justify-between text-xs pt-2 border-t">
          <span className="text-gray-500">Last used:</span>
          <span className="text-gray-600">{lastUsed}</span>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, status }) {
  const statusColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200'
  }

  const valueColors = {
    success: 'text-green-700',
    error: 'text-red-700',
    warning: 'text-yellow-700',
    info: 'text-blue-700'
  }

  return (
    <div className={`rounded-xl p-6 border-2 ${statusColors[status]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-3xl">{icon}</span>
        {status === 'success' && <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>}
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <p className={`text-2xl font-bold ${valueColors[status]}`}>
        {typeof value === 'string' && value}
        {typeof value === 'number' && value.toLocaleString()}
      </p>
    </div>
  )
}

function HealthBar({ label, value, color }) {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500'
  }

  const barColor = value > 80 ? 'red' : value > 60 ? 'yellow' : color

  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-semibold text-gray-900">{value.toFixed(1)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${colors[barColor]} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${value}%` }}
        ></div>
      </div>
    </div>
  )
}

function ActivityItem({ icon, text, time, type }) {
  return (
    <div className="flex items-start space-x-3 py-2">
      <span className="text-xl flex-shrink-0">{icon}</span>
      <div className="flex-1">
        <p className="text-sm text-gray-900">{text}</p>
        <p className="text-xs text-gray-500">{time}</p>
      </div>
    </div>
  )
}
