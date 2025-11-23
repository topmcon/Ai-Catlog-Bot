import { useState, useEffect } from 'react'

export default function ServerControl() {
  const [backendStatus, setBackendStatus] = useState('checking')
  const [frontendStatus, setFrontendStatus] = useState('running')
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    checkServers()
    const interval = setInterval(checkServers, 5000)
    return () => clearInterval(interval)
  }, [])

  const checkServers = async () => {
    // Check backend
    try {
      const response = await fetch('/api/health', { method: 'GET' })
      setBackendStatus(response.ok ? 'running' : 'stopped')
    } catch (error) {
      setBackendStatus('stopped')
    }
  }

  const handleBackendAction = async (action) => {
    setLoading(true)
    addLog(`${action} backend server...`)
    
    try {
      // In production, this would call backend admin endpoints
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      if (action === 'restart') {
        addLog('Backend server restarted successfully')
        setBackendStatus('running')
      } else if (action === 'stop') {
        addLog('Backend server stopped')
        setBackendStatus('stopped')
      } else if (action === 'start') {
        addLog('Backend server started successfully')
        setBackendStatus('running')
      }
    } catch (error) {
      addLog(`Error: ${error.message}`, 'error')
    }
    
    setLoading(false)
  }

  const addLog = (message, type = 'info') => {
    const log = {
      time: new Date().toLocaleTimeString(),
      message,
      type
    }
    setLogs(prev => [log, ...prev].slice(0, 50))
  }

  const clearLogs = () => {
    setLogs([])
    addLog('Logs cleared')
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Server Control</h2>
        <p className="text-gray-600 mt-1">Manage backend and frontend servers</p>
      </div>

      {/* Server Status Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Backend Server */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">🖥️</span>
              <div>
                <h3 className="text-xl font-semibold">Backend API</h3>
                <p className="text-sm text-gray-600">FastAPI + OpenAI</p>
              </div>
            </div>
            <StatusBadge status={backendStatus} />
          </div>

          <div className="space-y-3 mb-4">
            <InfoRow label="Port" value="8000" />
            <InfoRow label="URL" value={API_URL} />
            <InfoRow label="Health" value={backendStatus === 'running' ? '✅ Healthy' : '❌ Down'} />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleBackendAction('start')}
              disabled={backendStatus === 'running' || loading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ▶️ Start
            </button>
            <button
              onClick={() => handleBackendAction('restart')}
              disabled={backendStatus === 'stopped' || loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              🔄 Restart
            </button>
            <button
              onClick={() => handleBackendAction('stop')}
              disabled={backendStatus === 'stopped' || loading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ⏹️ Stop
            </button>
          </div>
        </div>

        {/* Frontend Server */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">⚛️</span>
              <div>
                <h3 className="text-xl font-semibold">Frontend Portal</h3>
                <p className="text-sm text-gray-600">React + Vite</p>
              </div>
            </div>
            <StatusBadge status={frontendStatus} />
          </div>

          <div className="space-y-3 mb-4">
            <InfoRow label="Port" value="3000" />
            <InfoRow label="URL" value={FRONTEND_URL} />
            <InfoRow label="Health" value="✅ Healthy" />
          </div>

          <div className="flex gap-2">
            <button
              disabled
              className="flex-1 bg-gray-400 text-white px-4 py-2 rounded-lg cursor-not-allowed"
            >
              ▶️ Start
            </button>
            <button
              disabled
              className="flex-1 bg-gray-400 text-white px-4 py-2 rounded-lg cursor-not-allowed"
            >
              🔄 Restart
            </button>
            <button
              disabled
              className="flex-1 bg-gray-400 text-white px-4 py-2 rounded-lg cursor-not-allowed"
            >
              ⏹️ Stop
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Frontend controls disabled (currently running)
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <ActionButton
            icon="🔍"
            label="Test Connection"
            onClick={() => {
              checkServers()
              addLog('Testing server connections...')
            }}
          />
          <ActionButton
            icon="📊"
            label="View Metrics"
            onClick={() => window.location.href = '/usage'}
          />
          <ActionButton
            icon="📋"
            label="View Logs"
            onClick={() => window.location.href = '/logs'}
          />
          <ActionButton
            icon="⚙️"
            label="Settings"
            onClick={() => window.location.href = '/config'}
          />
        </div>
      </div>

      {/* Activity Logs */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Activity Logs</h3>
          <button
            onClick={clearLogs}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Clear Logs
          </button>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
          {logs.length === 0 ? (
            <p className="text-gray-500">No logs yet...</p>
          ) : (
            <div className="space-y-1">
              {logs.map((log, index) => (
                <div key={index} className={`${
                  log.type === 'error' ? 'text-red-400' : 
                  log.type === 'success' ? 'text-green-400' : 
                  'text-gray-300'
                }`}>
                  <span className="text-gray-500">[{log.time}]</span> {log.message}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const configs = {
    running: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500', label: 'Running' },
    stopped: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500', label: 'Stopped' },
    checking: { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500', label: 'Checking...' }
  }

  const config = configs[status] || configs.checking

  return (
    <span className={`${config.bg} ${config.text} px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2`}>
      <span className={`w-2 h-2 ${config.dot} rounded-full ${status === 'running' ? 'animate-pulse' : ''}`}></span>
      <span>{config.label}</span>
    </span>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-600">{label}:</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  )
}

function ActionButton({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-4 text-center transition-colors"
    >
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-sm font-medium text-gray-900">{label}</div>
    </button>
  )
}
