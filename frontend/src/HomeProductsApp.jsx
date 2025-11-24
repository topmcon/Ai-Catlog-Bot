import { useState } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import { API_URL, API_KEY } from './config/api'

function HomeProductsApp() {
  const [productData, setProductData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('identity')
  const [formData, setFormData] = useState({
    modelNumber: '',
    brand: '',
    description: ''
  })

  const handleEnrich = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setProductData(null)

    try {
      const response = await fetch(`${API_URL}/enrich-home-product`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': API_KEY
        },
        body: JSON.stringify({
          model_number: formData.modelNumber,
          brand: formData.brand || null,
          description: formData.description || null
        })
      })

      const data = await response.json()

      if (data.success) {
        setProductData(data.data)
      } else {
        setError(data.error || 'Failed to enrich product data')
      }
    } catch (err) {
      setError(`Error: ${err.message}. Make sure the backend is running.`)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setProductData(null)
    setError(null)
    setFormData({ modelNumber: '', brand: '', description: '' })
    setActiveTab('identity')
  }

  const tabs = [
    { id: 'identity', label: 'Product Identity', icon: '🏷️' },
    { id: 'physical', label: 'Physical Specs', icon: '📏' },
    { id: 'technical', label: 'Technical Specs', icon: '⚙️' },
    { id: 'installation', label: 'Installation', icon: '🔧' },
    { id: 'compatibility', label: 'Compatibility', icon: '🔌' },
    { id: 'environmental', label: 'Environmental', icon: '🌍' },
    { id: 'certifications', label: 'Certifications', icon: '✅' },
    { id: 'ai', label: 'AI Insights', icon: '🤖' },
    { id: 'filtering', label: 'Filter Data', icon: '🔍' }
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Home Products Lookup</h2>
              <p className="text-sm text-gray-600 mb-6">Plumbing • Kitchen • Lighting • Bath • Fans • Hardware • HVAC</p>
              
              <form onSubmit={handleEnrich} className="space-y-4">
                <div>
                  <label htmlFor="modelNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Model Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="modelNumber"
                    required
                    value={formData.modelNumber}
                    onChange={(e) => setFormData({...formData, modelNumber: e.target.value})}
                    placeholder="e.g., 2559-DST, R11204-SD, 53031-SS"
                    className="input"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the manufacturer's model number (required)
                  </p>
                </div>

                <div>
                  <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-2">
                    Brand <span className="text-gray-400 text-xs">(optional)</span>
                  </label>
                  <input
                    type="text"
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => setFormData({...formData, brand: e.target.value})}
                    placeholder="e.g., Delta, Kohler, Moen, GE"
                    className="input"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Helps identify the product faster
                  </p>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description <span className="text-gray-400 text-xs">(optional)</span>
                  </label>
                  <input
                    type="text"
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="e.g., Kitchen Faucet, Ceiling Light, Shower Head"
                    className="input"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Brief product description to aid identification
                  </p>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex-1"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Researching...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Lookup Product
                      </>
                    )}
                  </button>
                  
                  {(productData || error) && (
                    <button
                      type="button"
                      onClick={handleReset}
                      className="btn-secondary"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Example Products:</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setFormData({ modelNumber: '2559-DST', brand: 'Delta', description: 'Kitchen Faucet' })}
                    className="text-left text-xs p-2 hover:bg-gray-100 rounded transition-colors"
                  >
                    <div className="font-medium">2559-DST</div>
                    <div className="text-gray-500">Delta Kitchen Faucet</div>
                  </button>
                  <button
                    onClick={() => setFormData({ modelNumber: 'K-596-CP', brand: 'Kohler', description: 'Simplice Faucet' })}
                    className="text-left text-xs p-2 hover:bg-gray-100 rounded transition-colors"
                  >
                    <div className="font-medium">K-596-CP</div>
                    <div className="text-gray-500">Kohler Faucet</div>
                  </button>
                  <button
                    onClick={() => setFormData({ modelNumber: '7594ESRS', brand: 'Moen', description: 'Arbor Faucet' })}
                    className="text-left text-xs p-2 hover:bg-gray-100 rounded transition-colors"
                  >
                    <div className="font-medium">7594ESRS</div>
                    <div className="text-gray-500">Moen Arbor Faucet</div>
                  </button>
                  <button
                    onClick={() => setFormData({ modelNumber: 'LX1500', brand: '', description: 'Ceiling Light' })}
                    className="text-left text-xs p-2 hover:bg-gray-100 rounded transition-colors"
                  >
                    <div className="font-medium">LX1500</div>
                    <div className="text-gray-500">Ceiling Light Fixture</div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            {error && (
              <div className="card border-l-4 border-red-500 bg-red-50">
                <div className="flex items-start">
                  <div className="text-red-400 text-2xl mr-3">⚠️</div>
                  <div>
                    <h3 className="text-red-800 font-semibold mb-1">Error</h3>
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {!productData && !error && !loading && (
              <div className="card text-center py-16 bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="text-6xl mb-4">🏠</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Home Products AI Enrichment
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Enter a model number to get comprehensive product data across 12 sections 
                  covering 100+ attributes for plumbing, kitchen, lighting, bath, and more.
                </p>
                <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 max-w-lg mx-auto">
                  <div>
                    <div className="text-2xl mb-1">🚰</div>
                    <div className="font-medium">Plumbing</div>
                  </div>
                  <div>
                    <div className="text-2xl mb-1">🍳</div>
                    <div className="font-medium">Kitchen</div>
                  </div>
                  <div>
                    <div className="text-2xl mb-1">💡</div>
                    <div className="font-medium">Lighting</div>
                  </div>
                  <div>
                    <div className="text-2xl mb-1">🛁</div>
                    <div className="font-medium">Bath</div>
                  </div>
                  <div>
                    <div className="text-2xl mb-1">🪛</div>
                    <div className="font-medium">Hardware</div>
                  </div>
                  <div>
                    <div className="text-2xl mb-1">❄️</div>
                    <div className="font-medium">HVAC</div>
                  </div>
                </div>
              </div>
            )}

            {productData && (
              <>
                {/* Success Message */}
                <div className="card border-l-4 border-green-500 bg-green-50">
                  <div className="flex items-start">
                    <div className="text-green-400 text-2xl mr-3">✅</div>
                    <div className="flex-1">
                      <h3 className="text-green-800 font-semibold mb-1">Product Enriched Successfully!</h3>
                      <div className="text-green-700 text-sm space-y-1">
                        <div>AI Provider: <span className="font-mono bg-white px-2 py-0.5 rounded">{productData.ai_provider}</span></div>
                        <div>Completeness: <span className="font-mono bg-white px-2 py-0.5 rounded">{productData.confidence_score?.toFixed(1)}%</span></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Title Card */}
                {productData.product_identity?.product_title && (
                  <div className="card bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    <h2 className="text-2xl font-bold mb-2">
                      {productData.product_identity.product_title}
                    </h2>
                    <div className="flex flex-wrap gap-3 text-sm">
                      {productData.product_identity.brand && (
                        <span className="bg-white/20 px-3 py-1 rounded-full">
                          {productData.product_identity.brand}
                        </span>
                      )}
                      {productData.product_identity.department && (
                        <span className="bg-white/20 px-3 py-1 rounded-full">
                          {productData.product_identity.department}
                        </span>
                      )}
                      {productData.product_identity.category && (
                        <span className="bg-white/20 px-3 py-1 rounded-full">
                          {productData.product_identity.category}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Tabs */}
                <div className="card">
                  <div className="flex space-x-2 overflow-x-auto pb-2 mb-4">
                    {tabs.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-colors ${
                          activeTab === tab.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {tab.icon} {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Tab Content */}
                  <div className="space-y-3">
                    {activeTab === 'identity' && productData.product_identity && (
                      <div className="space-y-2">
                        <h3 className="font-bold text-lg text-gray-800 mb-3">Product Identity</h3>
                        {Object.entries(productData.product_identity).map(([key, value]) => {
                          if (!value) return null
                          return (
                            <div key={key} className="flex border-b border-gray-100 pb-2">
                              <span className="text-gray-600 text-sm w-40 flex-shrink-0">
                                {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                              </span>
                              <span className="text-gray-900 text-sm font-medium">{value}</span>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {activeTab === 'physical' && (
                      <div className="space-y-4">
                        <h3 className="font-bold text-lg text-gray-800 mb-3">Physical Attributes</h3>
                        
                        {productData.dimensions && (
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-2">📏 Dimensions</h4>
                            {Object.entries(productData.dimensions).map(([key, value]) => {
                              if (!value) return null
                              return (
                                <div key={key} className="flex border-b border-gray-100 pb-2 mb-2">
                                  <span className="text-gray-600 text-sm w-40 flex-shrink-0">
                                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                                  </span>
                                  <span className="text-gray-900 text-sm font-medium">{value}</span>
                                </div>
                              )
                            })}
                          </div>
                        )}

                        {productData.material_construction && (
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-2">🔨 Material & Construction</h4>
                            {Object.entries(productData.material_construction).map(([key, value]) => {
                              if (!value) return null
                              const displayValue = Array.isArray(value) ? value.join(', ') : value
                              return (
                                <div key={key} className="flex border-b border-gray-100 pb-2 mb-2">
                                  <span className="text-gray-600 text-sm w-40 flex-shrink-0">
                                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                                  </span>
                                  <span className="text-gray-900 text-sm font-medium">{displayValue}</span>
                                </div>
                              )
                            })}
                          </div>
                        )}

                        {productData.finish_color && (
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-2">🎨 Finish & Color</h4>
                            {Object.entries(productData.finish_color).map(([key, value]) => {
                              if (!value) return null
                              const displayValue = Array.isArray(value) ? value.join(', ') : value
                              return (
                                <div key={key} className="flex border-b border-gray-100 pb-2 mb-2">
                                  <span className="text-gray-600 text-sm w-40 flex-shrink-0">
                                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                                  </span>
                                  <span className="text-gray-900 text-sm font-medium">{displayValue}</span>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'technical' && (
                      <div className="space-y-4">
                        <h3 className="font-bold text-lg text-gray-800 mb-3">Technical Specifications</h3>
                        
                        {productData.mechanical_plumbing && Object.values(productData.mechanical_plumbing).some(v => v) && (
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-2">🚰 Plumbing Specs</h4>
                            {Object.entries(productData.mechanical_plumbing).map(([key, value]) => {
                              if (!value) return null
                              return (
                                <div key={key} className="flex border-b border-gray-100 pb-2 mb-2">
                                  <span className="text-gray-600 text-sm w-40 flex-shrink-0">
                                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                                  </span>
                                  <span className="text-gray-900 text-sm font-medium">{value}</span>
                                </div>
                              )
                            })}
                          </div>
                        )}

                        {productData.electrical_specs && Object.values(productData.electrical_specs).some(v => v) && (
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-2">⚡ Electrical Specs</h4>
                            {Object.entries(productData.electrical_specs).map(([key, value]) => {
                              if (!value) return null
                              return (
                                <div key={key} className="flex border-b border-gray-100 pb-2 mb-2">
                                  <span className="text-gray-600 text-sm w-40 flex-shrink-0">
                                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                                  </span>
                                  <span className="text-gray-900 text-sm font-medium">{value}</span>
                                </div>
                              )
                            })}
                          </div>
                        )}

                        {productData.lighting_specs && Object.values(productData.lighting_specs).some(v => v) && (
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-2">💡 Lighting Specs</h4>
                            {Object.entries(productData.lighting_specs).map(([key, value]) => {
                              if (!value) return null
                              return (
                                <div key={key} className="flex border-b border-gray-100 pb-2 mb-2">
                                  <span className="text-gray-600 text-sm w-40 flex-shrink-0">
                                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                                  </span>
                                  <span className="text-gray-900 text-sm font-medium">{value}</span>
                                </div>
                              )
                            })}
                          </div>
                        )}

                        {productData.hvac_performance && Object.values(productData.hvac_performance).some(v => v) && (
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-2">❄️ HVAC Performance</h4>
                            {Object.entries(productData.hvac_performance).map(([key, value]) => {
                              if (!value) return null
                              return (
                                <div key={key} className="flex border-b border-gray-100 pb-2 mb-2">
                                  <span className="text-gray-600 text-sm w-40 flex-shrink-0">
                                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                                  </span>
                                  <span className="text-gray-900 text-sm font-medium">{value}</span>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'installation' && productData.installation && (
                      <div className="space-y-2">
                        <h3 className="font-bold text-lg text-gray-800 mb-3">Installation Requirements</h3>
                        {Object.entries(productData.installation).map(([key, value]) => {
                          if (!value) return null
                          const displayValue = Array.isArray(value) ? (
                            <ul className="list-disc list-inside space-y-1">
                              {value.map((item, idx) => (
                                <li key={idx} className="text-sm">{item}</li>
                              ))}
                            </ul>
                          ) : value
                          return (
                            <div key={key} className="border-b border-gray-100 pb-2 mb-2">
                              <div className="text-gray-600 text-sm font-medium mb-1">
                                {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                              </div>
                              <div className="text-gray-900 text-sm">{displayValue}</div>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {activeTab === 'compatibility' && productData.compatibility && (
                      <div className="space-y-2">
                        <h3 className="font-bold text-lg text-gray-800 mb-3">Compatibility & Requirements</h3>
                        {Object.entries(productData.compatibility).map(([key, value]) => {
                          if (!value) return null
                          const displayValue = Array.isArray(value) ? (
                            <ul className="list-disc list-inside space-y-1">
                              {value.map((item, idx) => (
                                <li key={idx} className="text-sm">{item}</li>
                              ))}
                            </ul>
                          ) : value
                          return (
                            <div key={key} className="border-b border-gray-100 pb-2 mb-2">
                              <div className="text-gray-600 text-sm font-medium mb-1">
                                {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                              </div>
                              <div className="text-gray-900 text-sm">{displayValue}</div>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {activeTab === 'environmental' && productData.environmental && (
                      <div className="space-y-2">
                        <h3 className="font-bold text-lg text-gray-800 mb-3">Environmental Ratings</h3>
                        {Object.entries(productData.environmental).map(([key, value]) => {
                          if (!value) return null
                          return (
                            <div key={key} className="flex border-b border-gray-100 pb-2">
                              <span className="text-gray-600 text-sm w-40 flex-shrink-0">
                                {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                              </span>
                              <span className="text-gray-900 text-sm font-medium">{value}</span>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {activeTab === 'certifications' && productData.certifications && (
                      <div className="space-y-2">
                        <h3 className="font-bold text-lg text-gray-800 mb-3">Certifications & Compliance</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {Object.entries(productData.certifications).map(([key, value]) => {
                            if (!value) return null
                            const isYes = value.toLowerCase() === 'yes' || value.toLowerCase() === 'true'
                            return (
                              <div key={key} className={`p-3 rounded-lg ${isYes ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                                <div className="flex items-center space-x-2">
                                  <span className="text-xl">{isYes ? '✅' : '📋'}</span>
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </div>
                                    <div className="text-xs text-gray-600">{value}</div>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {activeTab === 'ai' && productData.ai_enrichment && (
                      <div className="space-y-4">
                        <h3 className="font-bold text-lg text-gray-800 mb-3">AI-Generated Insights</h3>
                        
                        {productData.ai_enrichment.one_sentence_highlight && (
                          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
                            <div className="text-sm font-semibold text-purple-700 mb-1">✨ Highlight</div>
                            <div className="text-gray-800">{productData.ai_enrichment.one_sentence_highlight}</div>
                          </div>
                        )}

                        {productData.ai_enrichment.key_features && productData.ai_enrichment.key_features.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-2">🔑 Key Features</h4>
                            <ul className="space-y-2">
                              {productData.ai_enrichment.key_features.map((feature, idx) => (
                                <li key={idx} className="flex items-start">
                                  <span className="text-blue-500 mr-2">•</span>
                                  <span className="text-sm text-gray-700">{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {productData.ai_enrichment.detailed_description && (
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-2">📝 Description</h4>
                            <p className="text-sm text-gray-700 leading-relaxed">{productData.ai_enrichment.detailed_description}</p>
                          </div>
                        )}

                        {productData.ai_enrichment.why_this_product && (
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-2">💎 Why This Product?</h4>
                            <p className="text-sm text-gray-700 leading-relaxed">{productData.ai_enrichment.why_this_product}</p>
                          </div>
                        )}

                        {productData.ai_enrichment.installation_notes && (
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-2">🔧 Installation Notes</h4>
                            <p className="text-sm text-gray-700 leading-relaxed">{productData.ai_enrichment.installation_notes}</p>
                          </div>
                        )}

                        {productData.ai_enrichment.compatibility_notes && (
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-2">🔌 Compatibility Notes</h4>
                            <p className="text-sm text-gray-700 leading-relaxed">{productData.ai_enrichment.compatibility_notes}</p>
                          </div>
                        )}

                        {productData.ai_enrichment.seo_keywords && productData.ai_enrichment.seo_keywords.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-2">🏷️ SEO Keywords</h4>
                            <div className="flex flex-wrap gap-2">
                              {productData.ai_enrichment.seo_keywords.map((keyword, idx) => (
                                <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'filtering' && productData.filtering && (
                      <div className="space-y-2">
                        <h3 className="font-bold text-lg text-gray-800 mb-3">Filtering & Search Data</h3>
                        <div className="grid grid-cols-2 gap-3">
                          {Object.entries(productData.filtering).map(([key, value]) => {
                            if (!value) return null
                            const displayValue = Array.isArray(value) ? value.join(', ') : value
                            return (
                              <div key={key} className="bg-gray-50 p-3 rounded-lg">
                                <div className="text-xs text-gray-500 mb-1">
                                  {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </div>
                                <div className="text-sm text-gray-900 font-medium">{displayValue}</div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default HomeProductsApp
