import { useState } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import { API_URL, API_KEY } from './config/api'

// Ferguson/Build.com Product Lookup Portal
function FergusonApp() {
  const [productData, setProductData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [modelNumber, setModelNumber] = useState('')

  const handleLookup = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setProductData(null)

    console.log('Looking up Ferguson product:', modelNumber)

    try {
      const response = await fetch(`${API_URL}/lookup-ferguson`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': API_KEY,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify({
          model_number: modelNumber.trim()
        }),
        cache: 'no-store'
      })

      const data = await response.json()
      console.log('Ferguson API response:', data)

      if (data.success) {
        setProductData(data.data)
      } else {
        setError(data.error || 'Failed to lookup product')
      }
    } catch (err) {
      console.error('Lookup error:', err)
      setError(`Error: ${err.message}. Make sure the backend is running.`)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setProductData(null)
    setError(null)
    setModelNumber('')
  }

  const renderVariants = (variants) => {
    if (!variants || variants.length === 0) return null

    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Available Variants ({variants.length})
        </h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {variants.map((variant, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="grid grid-cols-2 gap-3">
                {variant.name && (
                  <div>
                    <span className="text-xs font-medium text-gray-500">Variant</span>
                    <p className="text-sm text-gray-900">{variant.name}</p>
                  </div>
                )}
                {variant.sku && (
                  <div>
                    <span className="text-xs font-medium text-gray-500">SKU</span>
                    <p className="text-sm text-gray-900">{variant.sku}</p>
                  </div>
                )}
                {variant.price && (
                  <div>
                    <span className="text-xs font-medium text-gray-500">Price</span>
                    <p className="text-sm font-semibold text-green-600">${variant.price}</p>
                  </div>
                )}
                {variant.availability && (
                  <div>
                    <span className="text-xs font-medium text-gray-500">Availability</span>
                    <p className="text-sm text-gray-900">{variant.availability}</p>
                  </div>
                )}
              </div>
              {variant.attributes && Object.keys(variant.attributes).length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <span className="text-xs font-medium text-gray-500">Attributes:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {Object.entries(variant.attributes).map(([key, value]) => (
                      <span key={key} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                        {key}: {value}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderImages = (images) => {
    if (!images || images.length === 0) return null

    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Product Images ({images.length})
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.slice(0, 6).map((img, idx) => (
            <div key={idx} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <img 
                src={img} 
                alt={`Product ${idx + 1}`}
                className="w-full h-full object-cover hover:scale-110 transition-transform"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23eee" width="100" height="100"/><text x="50" y="50" text-anchor="middle" fill="%23999">No Image</text></svg>'
                }}
              />
            </div>
          ))}
        </div>
        {images.length > 6 && (
          <p className="text-sm text-gray-500 mt-2">+ {images.length - 6} more images</p>
        )}
      </div>
    )
  }

  const renderSpecifications = (specs) => {
    if (!specs || Object.keys(specs).length === 0) return null

    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Specifications</h3>
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          {Object.entries(specs).map(([key, value]) => (
            <div key={key} className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-sm font-medium text-gray-600">{key}</span>
              <span className="text-sm text-gray-900">{typeof value === 'object' ? JSON.stringify(value) : value}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderFeatures = (features) => {
    if (!features || features.length === 0) return null

    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Features</h3>
        <ul className="space-y-2">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-start">
              <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 via-white to-blue-50">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <div className="space-y-6">
            <div className="card">
              <div className="flex items-center mb-4">
                <svg className="w-8 h-8 text-orange-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Ferguson Product Lookup</h2>
                  <p className="text-sm text-gray-600">Powered by Unwrangle • Build.com Data</p>
                </div>
              </div>
              
              <form onSubmit={handleLookup} className="space-y-4">
                <div>
                  <label htmlFor="modelNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Model Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="modelNumber"
                    required
                    value={modelNumber}
                    onChange={(e) => setModelNumber(e.target.value)}
                    placeholder="e.g., K-2362-8, MOEN 7594SRS, DELTA RP50587"
                    className="input"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter manufacturer's model number - no URL needed!
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loading || !modelNumber.trim()}
                    className="btn btn-primary flex-1"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Searching Ferguson...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                      className="btn btn-secondary"
                      disabled={loading}
                    >
                      Reset
                    </button>
                  )}
                </div>
              </form>
            </div>

            {error && (
              <div className="card bg-red-50 border-red-200">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-red-600 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-red-900 mb-1">Error</h3>
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {loading && (
              <div className="card">
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <svg className="animate-spin h-12 w-12 text-orange-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-lg font-semibold text-gray-900 mb-2">
                      Searching Ferguson catalog...
                    </p>
                    <p className="text-sm text-gray-600">
                      This may take 5-10 seconds
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Results */}
          <div>
            {productData ? (
              <div className="card space-y-6">
                {/* Product Header */}
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {productData.title || 'Product Details'}
                  </h2>
                  {productData.brand && (
                    <p className="text-lg text-gray-600">
                      Brand: <span className="font-semibold">{productData.brand}</span>
                    </p>
                  )}
                  {productData.model_number && (
                    <p className="text-sm text-gray-500">
                      Model: {productData.model_number}
                    </p>
                  )}
                  {productData.url && (
                    <a 
                      href={productData.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 inline-flex items-center mt-2"
                    >
                      View on Ferguson
                      <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>

                {/* Pricing */}
                {(productData.price || productData.original_price) && (
                  <div className="flex items-baseline gap-4">
                    {productData.price && (
                      <div>
                        <span className="text-3xl font-bold text-green-600">
                          ${productData.price}
                        </span>
                        {productData.currency && (
                          <span className="text-gray-500 ml-2">{productData.currency}</span>
                        )}
                      </div>
                    )}
                    {productData.original_price && productData.original_price !== productData.price && (
                      <span className="text-lg text-gray-500 line-through">
                        ${productData.original_price}
                      </span>
                    )}
                  </div>
                )}

                {/* Availability */}
                {productData.availability && (
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {productData.availability}
                  </div>
                )}

                {/* Description */}
                {productData.description && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {productData.description}
                    </p>
                  </div>
                )}

                {/* Category & Ratings */}
                <div className="flex gap-4 text-sm">
                  {productData.category && (
                    <div>
                      <span className="font-medium text-gray-600">Category:</span>
                      <span className="ml-2 text-gray-900">{productData.category}</span>
                    </div>
                  )}
                  {productData.rating && (
                    <div>
                      <span className="font-medium text-gray-600">Rating:</span>
                      <span className="ml-2 text-yellow-600">★ {productData.rating}</span>
                      {productData.review_count && (
                        <span className="ml-1 text-gray-500">({productData.review_count} reviews)</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Warranty */}
                {productData.warranty && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-blue-900 mb-1">Warranty Information</h3>
                    <p className="text-sm text-blue-800">{productData.warranty}</p>
                  </div>
                )}

                {/* Images */}
                {renderImages(productData.images)}

                {/* Features */}
                {renderFeatures(productData.features)}

                {/* Specifications */}
                {renderSpecifications(productData.specifications)}

                {/* Variants */}
                {renderVariants(productData.variants)}

                {/* Metadata */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <details className="text-xs text-gray-500">
                    <summary className="cursor-pointer hover:text-gray-700 font-medium">
                      Technical Details
                    </summary>
                    <pre className="mt-2 p-3 bg-gray-50 rounded overflow-auto text-xs">
                      {JSON.stringify(productData, null, 2)}
                    </pre>
                  </details>
                </div>
              </div>
            ) : !loading && (
              <div className="card h-full flex items-center justify-center">
                <div className="text-center text-gray-400 py-12">
                  <svg className="w-24 h-24 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="text-lg font-medium">No product data yet</p>
                  <p className="text-sm mt-2">Enter a model number to search Ferguson</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default FergusonApp
