import { useState } from 'react'
import { API_URL } from '../config/api'

export default function APITesting() {
  const [selectedEndpoint, setSelectedEndpoint] = useState('health')
  const [requestBody, setRequestBody] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [responseTime, setResponseTime] = useState(null)

  const endpoints = {
    root: {
      path: '/',
      method: 'GET',
      description: 'Welcome endpoint with API information',
      requiresAuth: false,
      example: null
    },
    health: {
      path: '/health',
      method: 'GET',
      description: 'Backend health check and OpenAI configuration status',
      requiresAuth: false,
      example: null
    },
    enrich: {
      path: '/enrich',
      method: 'POST',
      description: 'Enrich product data using AI',
      requiresAuth: true,
      example: {
        brand: "Fisher & Paykel",
        model: "OS24NDB1"
      }
    }
  }

  const testEndpoint = async () => {
    setLoading(true)
    setResponse(null)
    setResponseTime(null)

    const endpoint = endpoints[selectedEndpoint]
    const startTime = Date.now()

    try {
      const options = {
        method: endpoint.method,
        headers: {}
      }

      if (endpoint.requiresAuth) {
        options.headers['X-API-KEY'] = apiKey || 'test-api-key'
      }

      if (endpoint.method === 'POST' && requestBody) {
        options.headers['Content-Type'] = 'application/json'
        options.body = requestBody
      }

      const res = await fetch(`/api${endpoint.path}`, options)
      const endTime = Date.now()
      setResponseTime(endTime - startTime)

      const contentType = res.headers.get('content-type')
      let data

      if (contentType && contentType.includes('application/json')) {
        data = await res.json()
      } else {
        data = await res.text()
      }

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
        data
      })
    } catch (error) {
      const endTime = Date.now()
      setResponseTime(endTime - startTime)
      setResponse({
        status: 0,
        statusText: 'Network Error',
        headers: {},
        data: { error: error.message }
      })
    }

    setLoading(false)
  }

  const loadExample = () => {
    const example = endpoints[selectedEndpoint].example
    if (example) {
      setRequestBody(JSON.stringify(example, null, 2))
    }
  }

  const generateCurl = () => {
    const endpoint = endpoints[selectedEndpoint]
    let curl = `curl -X ${endpoint.method} ${API_URL}${endpoint.path}`

    if (endpoint.requiresAuth) {
      curl += ` \\\n  -H "X-API-KEY: ${apiKey || 'YOUR_API_KEY'}"`
    }

    if (endpoint.method === 'POST' && requestBody) {
      curl += ` \\\n  -H "Content-Type: application/json" \\\n  -d '${requestBody.replace(/\n\s*/g, '')}'`
    }

    return curl
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">API Testing</h2>
        <p className="text-gray-600 mt-1">Test API endpoints and verify connections</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Panel */}
        <div className="space-y-6">
          {/* Endpoint Selection */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Request Configuration</h3>
            
            <div className="space-y-4">
              {/* Endpoint Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Endpoint
                </label>
                <select
                  value={selectedEndpoint}
                  onChange={(e) => {
                    setSelectedEndpoint(e.target.value)
                    setRequestBody('')
                    setResponse(null)
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Object.entries(endpoints).map(([key, endpoint]) => (
                    <option key={key} value={key}>
                      {endpoint.method} {endpoint.path}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-600 mt-2">
                  {endpoints[selectedEndpoint].description}
                </p>
              </div>

              {/* API Key (if required) */}
              {endpoints[selectedEndpoint].requiresAuth && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your API key"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Request Body (for POST) */}
              {endpoints[selectedEndpoint].method === 'POST' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Request Body (JSON)
                    </label>
                    {endpoints[selectedEndpoint].example && (
                      <button
                        onClick={loadExample}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Load Example
                      </button>
                    )}
                  </div>
                  <textarea
                    value={requestBody}
                    onChange={(e) => setRequestBody(e.target.value)}
                    placeholder='{"brand": "Fisher & Paykel", "model": "OS24NDB1"}'
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  />
                </div>
              )}

              {/* Test Button */}
              <button
                onClick={testEndpoint}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? '⏳ Testing...' : '🚀 Send Request'}
              </button>
            </div>
          </div>

          {/* cURL Command */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">cURL Command</h3>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
                {generateCurl()}
              </pre>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(generateCurl())
                alert('cURL command copied to clipboard!')
              }}
              className="mt-3 text-sm text-blue-600 hover:text-blue-800"
            >
              📋 Copy to Clipboard
            </button>
          </div>
        </div>

        {/* Response Panel */}
        <div className="space-y-6">
          {/* Response Status */}
          {response && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Response</h3>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <StatusCode status={response.status} text={response.statusText} />
                </div>
                
                {responseTime && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Response Time:</span>
                    <span className={`font-mono text-sm ${
                      responseTime < 1000 ? 'text-green-600' : 
                      responseTime < 3000 ? 'text-yellow-600' : 
                      'text-red-600'
                    }`}>
                      {responseTime}ms
                    </span>
                  </div>
                )}
              </div>

              {/* Response Body */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Response Body
                </label>
                <div className="bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="text-gray-300 text-sm font-mono whitespace-pre-wrap">
                    {typeof response.data === 'string' 
                      ? response.data 
                      : JSON.stringify(response.data, null, 2)
                    }
                  </pre>
                </div>
              </div>
            </div>
          )}

          {!response && !loading && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">🧪</span>
                <p className="text-gray-600">
                  Configure your request and click "Send Request" to see the response
                </p>
              </div>
            </div>
          )}

          {loading && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">Testing endpoint...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Tests */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Tests</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <QuickTestButton
            icon="✅"
            label="Health Check"
            description="Test /health endpoint"
            onClick={() => {
              setSelectedEndpoint('health')
              setResponse(null)
              setTimeout(() => testEndpoint(), 100)
            }}
          />
          <QuickTestButton
            icon="🏠"
            label="Root Endpoint"
            description="Test / endpoint"
            onClick={() => {
              setSelectedEndpoint('root')
              setResponse(null)
              setTimeout(() => testEndpoint(), 100)
            }}
          />
          <QuickTestButton
            icon="🤖"
            label="Enrich Product"
            description="Test /enrich with example"
            onClick={() => {
              setSelectedEndpoint('enrich')
              setRequestBody(JSON.stringify(endpoints.enrich.example, null, 2))
              setResponse(null)
            }}
          />
        </div>
      </div>
    </div>
  )
}

function StatusCode({ status, text }) {
  let color = 'gray'
  if (status >= 200 && status < 300) color = 'green'
  else if (status >= 300 && status < 400) color = 'blue'
  else if (status >= 400 && status < 500) color = 'yellow'
  else if (status >= 500) color = 'red'

  return (
    <span className={`bg-${color}-100 text-${color}-800 px-3 py-1 rounded-full text-sm font-mono`}>
      {status} {text}
    </span>
  )
}

function QuickTestButton({ icon, label, description, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-4 text-left transition-colors"
    >
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-sm font-semibold text-gray-900 mb-1">{label}</div>
      <div className="text-xs text-gray-600">{description}</div>
    </button>
  )
}
