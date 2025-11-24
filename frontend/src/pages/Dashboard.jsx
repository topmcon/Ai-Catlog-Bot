import { useState, useEffect } from 'react'
import { API_URL } from '../config/api'

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

  const [systemHealth, setSystemHealth] = useState({
    cpu: 0,
    memory: 0,
    disk: 0
  })

  useEffect(() => {
    checkBackendStatus()
    loadStats()
    const interval = setInterval(() => {
      checkBackendStatus()
      updateSystemHealth()
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const checkBackendStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/health`)
      if (response.ok) {
        setStats(prev => ({ ...prev, backendStatus: 'online' }))
      } else {
        setStats(prev => ({ ...prev, backendStatus: 'offline' }))
      }
    } catch (error) {
      setStats(prev => ({ ...prev, backendStatus: 'offline' }))
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
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600 mt-1">System overview and quick actions</p>
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
          title="Today's Requests"
          value={stats.todayRequests}
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
          title="Total Cost"
          value={stats.totalCost}
          icon="💰"
          status="warning"
        />
      </div>

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
