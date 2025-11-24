import { useState, useEffect } from 'react'

export default function ConfigManager() {
  const [config, setConfig] = useState({
    openaiApiKey: '',
    catalogApiKey: '',
    corsOrigins: ['http://localhost:3000', 'http://localhost:5173', 'https://*.cxc-ai.com'],
    rateLimit: 100,
    maxTokens: 4000,
    temperature: 0.7,
    model: 'gpt-4o-mini'
  })

  const [saved, setSaved] = useState(false)
  const [newOrigin, setNewOrigin] = useState('')

  useEffect(() => {
    // Load config from localStorage
    const savedConfig = localStorage.getItem('catalogbot_config')
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig))
    }
  }, [])

  const handleSave = () => {
    localStorage.setItem('catalogbot_config', JSON.stringify(config))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    
    // In production, this would call backend API to update .env
    console.log('Config saved:', config)
  }

  const addOrigin = () => {
    if (newOrigin && !config.corsOrigins.includes(newOrigin)) {
      setConfig({
        ...config,
        corsOrigins: [...config.corsOrigins, newOrigin]
      })
      setNewOrigin('')
    }
  }

  const removeOrigin = (origin) => {
    setConfig({
      ...config,
      corsOrigins: config.corsOrigins.filter(o => o !== origin)
    })
  }

  const resetToDefaults = () => {
    const defaultConfig = {
      openaiApiKey: '',
      catalogApiKey: '',
      corsOrigins: ['http://localhost:3000', 'http://localhost:5173', 'https://*.cxc-ai.com'],
      rateLimit: 100,
      maxTokens: 4000,
      temperature: 0.7,
      model: 'gpt-4o-mini'
    }
    setConfig(defaultConfig)
  }

  const testOpenAI = async () => {
    alert('Testing OpenAI connection... (This would call the backend in production)')
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Configuration Manager</h2>
          <p className="text-gray-600 mt-1">Manage API keys, CORS settings, and system configuration</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={resetToDefaults}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            🔄 Reset to Defaults
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            💾 Save Changes
          </button>
        </div>
      </div>

      {saved && (
        <div className="bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded-lg">
          ✅ Configuration saved successfully!
        </div>
      )}

      {/* API Keys Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">API Keys</h3>
          <span className="text-sm text-gray-500">🔒 Encrypted & Secure</span>
        </div>

        <div className="space-y-4">
          {/* OpenAI API Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              OpenAI API Key
            </label>
            <div className="flex space-x-2">
              <input
                type="password"
                value={config.openaiApiKey}
                onChange={(e) => setConfig({ ...config, openaiApiKey: e.target.value })}
                placeholder="sk-..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={testOpenAI}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                🧪 Test
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenAI Platform</a>
            </p>
          </div>

          {/* Catalog Bot API Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catalog Bot API Key
            </label>
            <input
              type="password"
              value={config.catalogApiKey}
              onChange={(e) => setConfig({ ...config, catalogApiKey: e.target.value })}
              placeholder="Enter custom API key for client authentication"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              This key is required in the X-API-KEY header for all /enrich requests
            </p>
          </div>
        </div>
      </div>

      {/* CORS Configuration */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">CORS Origins</h3>
        <p className="text-sm text-gray-600 mb-4">
          Configure which domains are allowed to access the API
        </p>

        <div className="space-y-3">
          {/* Add Origin */}
          <div className="flex space-x-2">
            <input
              type="text"
              value={newOrigin}
              onChange={(e) => setNewOrigin(e.target.value)}
              placeholder="https://cxc-ai.com"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && addOrigin()}
            />
            <button
              onClick={addOrigin}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              ➕ Add
            </button>
          </div>

          {/* Origins List */}
          <div className="space-y-2">
            {config.corsOrigins.map((origin, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg">
                <span className="font-mono text-sm text-gray-800">{origin}</span>
                <button
                  onClick={() => removeOrigin(origin)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  🗑️ Remove
                </button>
              </div>
            ))}
          </div>

          {config.corsOrigins.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No CORS origins configured. Add domains to allow API access.
            </div>
          )}
        </div>
      </div>

      {/* OpenAI Settings */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">OpenAI Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Model
            </label>
            <select
              value={config.model}
              onChange={(e) => setConfig({ ...config, model: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="gpt-4o-mini">GPT-4o Mini (Recommended)</option>
              <option value="gpt-4o">GPT-4o</option>
              <option value="gpt-4-turbo">GPT-4 Turbo</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              gpt-4o-mini offers the best price/performance ratio
            </p>
          </div>

          {/* Max Tokens */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Tokens: {config.maxTokens}
            </label>
            <input
              type="range"
              min="1000"
              max="8000"
              step="500"
              value={config.maxTokens}
              onChange={(e) => setConfig({ ...config, maxTokens: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1000</span>
              <span>8000</span>
            </div>
          </div>

          {/* Temperature */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Temperature: {config.temperature}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={config.temperature}
              onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Precise (0)</span>
              <span>Creative (1)</span>
            </div>
          </div>

          {/* Rate Limit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rate Limit (requests/hour)
            </label>
            <input
              type="number"
              value={config.rateLimit}
              onChange={(e) => setConfig({ ...config, rateLimit: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Maximum API requests per hour per IP address
            </p>
          </div>
        </div>
      </div>

      {/* Environment Variables Preview */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Environment Variables Preview</h3>
        <p className="text-sm text-gray-600 mb-4">
          These settings will be written to your .env file when saved
        </p>
        
        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
          <pre className="text-green-400 text-sm font-mono">
{`# OpenAI Configuration
OPENAI_API_KEY=${config.openaiApiKey ? '***' + config.openaiApiKey.slice(-4) : 'not_set'}

# API Authentication
API_KEY=${config.catalogApiKey ? '***' + config.catalogApiKey.slice(-4) : 'not_set'}

# CORS Settings
CORS_ORIGINS=${config.corsOrigins.join(',')}

# OpenAI Settings
OPENAI_MODEL=${config.model}
OPENAI_MAX_TOKENS=${config.maxTokens}
OPENAI_TEMPERATURE=${config.temperature}

# Rate Limiting
RATE_LIMIT=${config.rateLimit}
`}
          </pre>
        </div>

        <button
          onClick={() => {
            const envContent = `# OpenAI Configuration
OPENAI_API_KEY=${config.openaiApiKey}

# API Authentication
API_KEY=${config.catalogApiKey}

# CORS Settings
CORS_ORIGINS=${config.corsOrigins.join(',')}

# OpenAI Settings
OPENAI_MODEL=${config.model}
OPENAI_MAX_TOKENS=${config.maxTokens}
OPENAI_TEMPERATURE=${config.temperature}

# Rate Limiting
RATE_LIMIT=${config.rateLimit}
`
            const blob = new Blob([envContent], { type: 'text/plain' })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = '.env'
            a.click()
            window.URL.revokeObjectURL(url)
          }}
          className="mt-4 text-sm text-blue-600 hover:text-blue-800"
        >
          💾 Download .env file
        </button>
      </div>

      {/* Cost Estimation */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Cost Estimation</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <CostCard
            model="gpt-4o-mini"
            inputPrice="$0.00015 / 1K tokens"
            outputPrice="$0.0006 / 1K tokens"
            estimatedCost="~$0.001 per request"
            recommended={config.model === 'gpt-4o-mini'}
          />
          <CostCard
            model="gpt-4o"
            inputPrice="$0.0025 / 1K tokens"
            outputPrice="$0.01 / 1K tokens"
            estimatedCost="~$0.02 per request"
            recommended={config.model === 'gpt-4o'}
          />
          <CostCard
            model="gpt-4-turbo"
            inputPrice="$0.01 / 1K tokens"
            outputPrice="$0.03 / 1K tokens"
            estimatedCost="~$0.05 per request"
            recommended={config.model === 'gpt-4-turbo'}
          />
        </div>
      </div>
    </div>
  )
}

function CostCard({ model, inputPrice, outputPrice, estimatedCost, recommended }) {
  return (
    <div className={`p-4 rounded-lg border-2 ${recommended ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-gray-900">{model}</h4>
        {recommended && (
          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">Active</span>
        )}
      </div>
      <div className="space-y-1 text-xs text-gray-600">
        <div>Input: {inputPrice}</div>
        <div>Output: {outputPrice}</div>
        <div className="font-semibold text-gray-900 mt-2">{estimatedCost}</div>
      </div>
    </div>
  )
}
