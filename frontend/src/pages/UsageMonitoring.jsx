import { useState, useEffect } from 'react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format, subDays } from 'date-fns'

export default function UsageMonitoring() {
  const [stats, setStats] = useState({
    totalRequests: 1247,
    successfulRequests: 1198,
    failedRequests: 49,
    totalCost: 1.247,
    averageResponseTime: 12.4,
    todayRequests: 87
  })

  const [requestLogs, setRequestLogs] = useState([])
  const [timeRange, setTimeRange] = useState('7days')
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    // Load mock data
    loadMockData()
  }, [timeRange])

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
    const headers = ['Timestamp', 'Brand', 'Model', 'Status', 'Response Time (s)', 'Cost ($)']
    const rows = requestLogs.map(log => [
      log.timestamp,
      log.brand,
      log.model,
      log.status,
      log.responseTime,
      log.cost
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
          value={stats.totalRequests.toLocaleString()}
          change="+12.5%"
          changeType="positive"
        />
        <StatCard
          icon="💰"
          label="Total Cost"
          value={`$${stats.totalCost.toFixed(2)}`}
          change="+$0.09"
          changeType="neutral"
        />
        <StatCard
          icon="⚡"
          label="Avg Response Time"
          value={`${stats.averageResponseTime}s`}
          change="-0.8s"
          changeType="positive"
        />
        <StatCard
          icon="✅"
          label="Success Rate"
          value={`${((stats.successfulRequests / stats.totalRequests) * 100).toFixed(1)}%`}
          change="+1.2%"
          changeType="positive"
        />
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
        <h3 className="text-lg font-semibold mb-4">Recent Requests</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Timestamp</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Brand</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Model</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Time (s)</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Cost</th>
              </tr>
            </thead>
            <tbody>
              {requestLogs.map((log) => (
                <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {format(new Date(log.timestamp), 'MMM dd, HH:mm:ss')}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 font-medium">{log.brand}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{log.model}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      log.status === 'success' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 font-mono">{log.responseTime}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 font-mono">${log.cost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
