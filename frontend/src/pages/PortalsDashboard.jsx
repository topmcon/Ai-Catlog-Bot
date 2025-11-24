import { useState, useEffect } from 'react'
import { API_URL, API_KEY } from '../config/api'

export default function PortalsDashboard() {
  const [activePortal, setActivePortal] = useState('product')
  const [portalStats, setPortalStats] = useState({
    product: { requests: 0, success: 0, failed: 0, avgTime: 0, lastTest: null },
    parts: { requests: 0, success: 0, failed: 0, avgTime: 0, lastTest: null },
    homeProducts: { requests: 0, success: 0, failed: 0, avgTime: 0, lastTest: null }
  })
  const [testing, setTesting] = useState(false)
  const [testResults, setTestResults] = useState(null)

  const portals = {
    product: {
      name: 'Product Enrichment',
      icon: '📦',
      url: 'https://ai-catlog-bot.vercel.app/',
      endpoint: '/enrich',
      description: 'Main product catalog enrichment portal',
      testData: {
        brand: 'Moen',
        model_number: '7594SRS'
      }
    },
    parts: {
      name: 'Parts Lookup',
      icon: '🔧',
      url: 'https://ai-catlog-bot.vercel.app/parts.html',
      endpoint: '/enrich-part',
      description: 'Parts enrichment and lookup system',
      testData: {
        part_number: 'RP50587',
        brand: 'Delta',
        description: 'Valve cartridge'
      }
    },
    homeProducts: {
      name: 'Home Products',
      icon: '🏠',
      url: 'https://ai-catlog-bot.vercel.app/home-products.html',
      endpoint: '/enrich-home-product',
      description: 'Home improvement products enrichment',
      testData: {
        model_number: '2559-DST',
        brand: 'Delta',
        description: 'Trinsic bathroom faucet'
      }
    }
  }

  useEffect(() => {
    loadPortalStats()
  }, [])

  const loadPortalStats = () => {
    const stored = localStorage.getItem('portal_stats')
    if (stored) {
      setPortalStats(JSON.parse(stored))
    }
  }

  const savePortalStats = (newStats) => {
    localStorage.setItem('portal_stats', JSON.stringify(newStats))
    setPortalStats(newStats)
  }

  const testPortal = async (portalKey) => {
    setTesting(true)
    setTestResults(null)
    const portal = portals[portalKey]
    const startTime = Date.now()

    try {
      const response = await fetch(`${API_URL}${portal.endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': API_KEY
        },
        body: JSON.stringify(portal.testData)
      })

      const endTime = Date.now()
      const responseTime = endTime - startTime
      const data = await response.json()

      const success = response.ok && data.success
      
      // Update stats
      const newStats = { ...portalStats }
      newStats[portalKey].requests++
      if (success) {
        newStats[portalKey].success++
      } else {
        newStats[portalKey].failed++
      }
      newStats[portalKey].avgTime = responseTime
      newStats[portalKey].lastTest = new Date().toISOString()
      savePortalStats(newStats)

      setTestResults({
        portal: portalKey,
        success,
        responseTime,
        status: response.status,
        data,
        error: success ? null : (data.error || 'Test failed')
      })
    } catch (error) {
      const endTime = Date.now()
      const responseTime = endTime - startTime

      const newStats = { ...portalStats }
      newStats[portalKey].requests++
      newStats[portalKey].failed++
      newStats[portalKey].lastTest = new Date().toISOString()
      savePortalStats(newStats)

      setTestResults({
        portal: portalKey,
        success: false,
        responseTime,
        status: 0,
        data: null,
        error: error.message
      })
    }

    setTesting(false)
  }

  const testAllPortals = async () => {
    for (const portalKey of Object.keys(portals)) {
      setActivePortal(portalKey)
      await testPortal(portalKey)
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  const resetStats = () => {
    if (confirm('Reset all portal statistics?')) {
      const emptyStats = {
        product: { requests: 0, success: 0, failed: 0, avgTime: 0, lastTest: null },
        parts: { requests: 0, success: 0, failed: 0, avgTime: 0, lastTest: null },
        homeProducts: { requests: 0, success: 0, failed: 0, avgTime: 0, lastTest: null }
      }
      savePortalStats(emptyStats)
      setTestResults(null)
    }
  }

  const currentPortal = portals[activePortal]
  const currentStats = portalStats[activePortal]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Portals Dashboard</h2>
          <p className="text-gray-600 mt-1">Monitor and test all frontend portals</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={testAllPortals}
            disabled={testing}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
          >
            🧪 Test All Portals
          </button>
          <button
            onClick={resetStats}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            🔄 Reset Stats
          </button>
        </div>
      </div>

      {/* Portal Tabs */}
      <div className="bg-white rounded-xl shadow-md">
        <div className="border-b border-gray-200">
          <div className="flex space-x-1 p-2">
            {Object.entries(portals).map(([key, portal]) => (
              <button
                key={key}
                onClick={() => setActivePortal(key)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                  activePortal === key
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="text-xl">{portal.icon}</span>
                <span>{portal.name}</span>
                {portalStats[key].requests > 0 && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                    {portalStats[key].requests}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Portal Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Portal Info */}
            <div className="lg:col-span-2 space-y-4">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-4xl">{currentPortal.icon}</span>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{currentPortal.name}</h3>
                    <p className="text-gray-600">{currentPortal.description}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Frontend URL:</span>
                  <a
                    href={currentPortal.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {currentPortal.url} ↗
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">API Endpoint:</span>
                  <span className="text-sm font-mono text-gray-900">POST {currentPortal.endpoint}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Last Tested:</span>
                  <span className="text-sm text-gray-600">
                    {currentStats.lastTest 
                      ? new Date(currentStats.lastTest).toLocaleString()
                      : 'Never'
                    }
                  </span>
                </div>
              </div>

              {/* Test Data */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Test Data</h4>
                <div className="bg-gray-900 rounded-lg p-4">
                  <pre className="text-green-400 text-sm font-mono">
                    {JSON.stringify(currentPortal.testData, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Test Button */}
              <button
                onClick={() => testPortal(activePortal)}
                disabled={testing}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 transition-colors"
              >
                {testing ? '⏳ Testing...' : '🚀 Run Test'}
              </button>
            </div>

            {/* Stats Cards */}
            <div className="space-y-4">
              <StatCard
                title="Total Requests"
                value={currentStats.requests}
                icon="📊"
                color="blue"
              />
              <StatCard
                title="Successful"
                value={currentStats.success}
                icon="✅"
                color="green"
              />
              <StatCard
                title="Failed"
                value={currentStats.failed}
                icon="❌"
                color="red"
              />
              <StatCard
                title="Avg Response"
                value={`${(currentStats.avgTime / 1000).toFixed(2)}s`}
                icon="⚡"
                color="yellow"
              />
              <StatCard
                title="Success Rate"
                value={currentStats.requests > 0 
                  ? `${((currentStats.success / currentStats.requests) * 100).toFixed(1)}%`
                  : 'N/A'
                }
                icon="📈"
                color="purple"
              />
            </div>
          </div>

          {/* Test Results */}
          {testResults && testResults.portal === activePortal && (
            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-3">Test Results</h4>
              <div className={`rounded-lg p-4 border-2 ${
                testResults.success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{testResults.success ? '✅' : '❌'}</span>
                    <div>
                      <h5 className={`font-semibold ${
                        testResults.success ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {testResults.success ? 'Test Passed!' : 'Test Failed'}
                      </h5>
                      <p className="text-sm text-gray-600">
                        Response Time: {testResults.responseTime}ms | Status: {testResults.status}
                      </p>
                    </div>
                  </div>
                </div>

                {testResults.error && (
                  <div className="bg-white rounded p-3 mb-3">
                    <p className="text-sm font-medium text-red-700">Error:</p>
                    <p className="text-sm text-red-600">{testResults.error}</p>
                  </div>
                )}

                {testResults.data && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Response Data:</p>
                    <div className="bg-gray-900 rounded p-3 max-h-64 overflow-y-auto">
                      <pre className="text-gray-300 text-xs font-mono">
                        {JSON.stringify(testResults.data, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* All Portals Overview */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">All Portals Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(portals).map(([key, portal]) => {
            const stats = portalStats[key]
            const successRate = stats.requests > 0 
              ? ((stats.success / stats.requests) * 100).toFixed(1)
              : 0

            return (
              <div
                key={key}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setActivePortal(key)}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <span className="text-3xl">{portal.icon}</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">{portal.name}</h4>
                    <p className="text-xs text-gray-600">{stats.requests} requests</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Success Rate:</span>
                    <span className={`font-semibold ${
                      successRate >= 90 ? 'text-green-600' :
                      successRate >= 70 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {successRate}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Avg Time:</span>
                    <span className="font-semibold text-gray-900">
                      {(stats.avgTime / 1000).toFixed(2)}s
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color }) {
  const colors = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700'
  }

  return (
    <div className={`rounded-lg p-4 border-2 ${colors[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}
