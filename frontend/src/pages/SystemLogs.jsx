import { useState, useEffect, useRef } from 'react'

// Helper function to format dates without external library
const formatDate = (date, formatStr) => {
  const d = new Date(date)
  const pad = (n) => n.toString().padStart(2, '0')
  
  if (formatStr === 'HH:mm:ss') {
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  }
  if (formatStr === 'yyyy-MM-dd HH:mm:ss') {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  }
  if (formatStr === 'yyyy-MM-dd-HHmmss') {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
  }
  return d.toISOString()
}

export default function SystemLogs() {
  const [logs, setLogs] = useState([])
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [autoScroll, setAutoScroll] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const logsEndRef = useRef(null)

  useEffect(() => {
    // Initialize with some sample logs
    const initialLogs = [
      { id: 1, timestamp: new Date(), level: 'INFO', message: 'Backend server started on port 8000', source: 'main.py' },
      { id: 2, timestamp: new Date(Date.now() - 1000), level: 'INFO', message: 'OpenAI API key configured', source: 'main.py' },
      { id: 3, timestamp: new Date(Date.now() - 2000), level: 'INFO', message: 'CORS middleware enabled', source: 'main.py' },
      { id: 4, timestamp: new Date(Date.now() - 3000), level: 'SUCCESS', message: 'Health check endpoint responding', source: 'uvicorn' }
    ]
    setLogs(initialLogs)

    // Simulate real-time logs
    const interval = setInterval(() => {
      if (!isPaused) {
        addRandomLog()
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [isPaused])

  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs, autoScroll])

  const addRandomLog = () => {
    const messages = [
      { level: 'INFO', message: 'Processing enrichment request', source: 'main.py' },
      { level: 'SUCCESS', message: 'Product data enriched successfully', source: 'main.py' },
      { level: 'INFO', message: 'OpenAI API call completed', source: 'openai_client' },
      { level: 'WARNING', message: 'High response time detected (15.3s)', source: 'monitor' },
      { level: 'INFO', message: 'Cache hit for product lookup', source: 'cache' },
      { level: 'DEBUG', message: 'Validating request body', source: 'validator' },
      { level: 'INFO', message: 'CORS preflight request handled', source: 'middleware' }
    ]

    const randomMsg = messages[Math.floor(Math.random() * messages.length)]
    
    setLogs(prev => [...prev, {
      id: Date.now(),
      timestamp: new Date(),
      ...randomMsg
    }].slice(-100)) // Keep last 100 logs
  }

  const filteredLogs = logs.filter(log => {
    const matchesFilter = filter === 'all' || log.level === filter
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.source.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const clearLogs = () => {
    if (confirm('Clear all logs?')) {
      setLogs([])
    }
  }

  const downloadLogs = () => {
    const logText = logs.map(log => 
      `[${formatDate(log.timestamp, 'yyyy-MM-dd HH:mm:ss')}] ${log.level.padEnd(8)} ${log.source.padEnd(15)} ${log.message}`
    ).join('\n')

    const blob = new Blob([logText], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `catalogbot-logs-${formatDate(new Date(), 'yyyy-MM-dd-HHmmss')}.log`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getLevelColor = (level) => {
    switch (level) {
      case 'ERROR': return 'text-red-400'
      case 'WARNING': return 'text-yellow-400'
      case 'SUCCESS': return 'text-green-400'
      case 'DEBUG': return 'text-purple-400'
      case 'INFO':
      default: return 'text-blue-400'
    }
  }

  const getLevelBadgeColor = (level) => {
    switch (level) {
      case 'ERROR': return 'bg-red-100 text-red-800'
      case 'WARNING': return 'bg-yellow-100 text-yellow-800'
      case 'SUCCESS': return 'bg-green-100 text-green-800'
      case 'DEBUG': return 'bg-purple-100 text-purple-800'
      case 'INFO':
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  const levelCounts = {
    ERROR: logs.filter(l => l.level === 'ERROR').length,
    WARNING: logs.filter(l => l.level === 'WARNING').length,
    SUCCESS: logs.filter(l => l.level === 'SUCCESS').length,
    INFO: logs.filter(l => l.level === 'INFO').length,
    DEBUG: logs.filter(l => l.level === 'DEBUG').length
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">System Logs</h2>
          <p className="text-gray-600 mt-1">Real-time server logs and error tracking</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`${isPaused ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'} text-white px-4 py-2 rounded-lg transition-colors`}
          >
            {isPaused ? '▶️ Resume' : '⏸️ Pause'}
          </button>
          <button
            onClick={downloadLogs}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            💾 Download
          </button>
          <button
            onClick={clearLogs}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            🗑️ Clear
          </button>
        </div>
      </div>

      {/* Log Level Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <LogStatCard label="Errors" count={levelCounts.ERROR} color="red" icon="❌" />
        <LogStatCard label="Warnings" count={levelCounts.WARNING} color="yellow" icon="⚠️" />
        <LogStatCard label="Success" count={levelCounts.SUCCESS} color="green" icon="✅" />
        <LogStatCard label="Info" count={levelCounts.INFO} color="blue" icon="ℹ️" />
        <LogStatCard label="Debug" count={levelCounts.DEBUG} color="purple" icon="🔍" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search logs..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Levels</option>
            <option value="ERROR">Errors Only</option>
            <option value="WARNING">Warnings Only</option>
            <option value="SUCCESS">Success Only</option>
            <option value="INFO">Info Only</option>
            <option value="DEBUG">Debug Only</option>
          </select>
        </div>

        <div className="mt-3 flex items-center space-x-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-gray-700">Auto-scroll</span>
          </label>
          <span className="text-sm text-gray-500">
            Showing {filteredLogs.length} of {logs.length} logs
          </span>
        </div>
      </div>

      {/* Log Viewer */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Live Logs</h3>
        
        <div className="bg-gray-900 rounded-lg p-4 h-[500px] overflow-y-auto font-mono text-sm">
          {filteredLogs.length === 0 ? (
            <p className="text-gray-500">No logs to display</p>
          ) : (
            <div className="space-y-1">
              {filteredLogs.map((log) => (
                <div key={log.id} className="flex space-x-2 hover:bg-gray-800 px-2 py-1 rounded">
                  <span className="text-gray-500 flex-shrink-0">
                    {formatDate(log.timestamp, 'HH:mm:ss')}
                  </span>
                  <span className={`flex-shrink-0 w-20 ${getLevelColor(log.level)}`}>
                    {log.level}
                  </span>
                  <span className="text-gray-400 flex-shrink-0 w-32 truncate">
                    {log.source}
                  </span>
                  <span className="text-gray-300 flex-1">
                    {log.message}
                  </span>
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          )}
        </div>

        {isPaused && (
          <div className="mt-3 text-center text-yellow-600 text-sm">
            ⏸️ Log streaming paused
          </div>
        )}
      </div>

      {/* Log Details Table */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Detailed View</h3>
        
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">📋</span>
            <p className="text-gray-600">No logs match your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Timestamp</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Level</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Source</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Message</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.slice(-20).reverse().map((log) => (
                  <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-600 font-mono whitespace-nowrap">
                      {formatDate(log.timestamp, 'yyyy-MM-dd HH:mm:ss')}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelBadgeColor(log.level)}`}>
                        {log.level}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 font-mono">
                      {log.source}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {log.message}
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

function LogStatCard({ label, count, color, icon }) {
  const colorClasses = {
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    green: 'bg-green-100 text-green-800',
    blue: 'bg-blue-100 text-blue-800',
    purple: 'bg-purple-100 text-purple-800'
  }

  return (
    <div className={`${colorClasses[color]} rounded-xl p-4`}>
      <div className="flex items-center space-x-2 mb-2">
        <span className="text-2xl">{icon}</span>
        <div className="text-2xl font-bold">{count}</div>
      </div>
      <div className="text-sm font-medium">{label}</div>
    </div>
  )
}
