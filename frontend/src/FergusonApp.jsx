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
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {variants.map((variant, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
              <div className="flex gap-4">
                {/* Variant Image */}
                {variant.image_url && (
                  <div className="flex-shrink-0">
                    <img 
                      src={variant.image_url} 
                      alt={variant.name}
                      className="w-24 h-24 object-cover rounded"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  </div>
                )}
                
                <div className="flex-grow">
                  {/* Variant Header */}
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">{variant.name || variant.title}</h4>
                      {variant.sku && (
                        <p className="text-xs text-gray-500 font-mono">{variant.sku}</p>
                      )}
                    </div>
                    {variant.price && (
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">${variant.price.toFixed(2)}</p>
                        {variant.currency && variant.currency !== 'USD' && (
                          <p className="text-xs text-gray-500">{variant.currency}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Variant Info Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                    {variant.availability && (
                      <div>
                        <span className="text-gray-500">Status:</span>
                        <span className={`ml-1 font-medium ${variant.stock_status === 'in_stock' ? 'text-green-600' : 'text-red-600'}`}>
                          {variant.availability}
                        </span>
                      </div>
                    )}
                    {variant.attributes?.color && (
                      <div>
                        <span className="text-gray-500">Color:</span>
                        <span className="ml-1">{variant.attributes.color}</span>
                      </div>
                    )}
                    {variant.attributes?.inventory_quantity !== undefined && (
                      <div>
                        <span className="text-gray-500">Stock:</span>
                        <span className="ml-1 font-medium">{variant.attributes.inventory_quantity} units</span>
                      </div>
                    )}
                    {variant.attributes?.shipping_lead_time && (
                      <div>
                        <span className="text-gray-500">Lead Time:</span>
                        <span className="ml-1">{variant.attributes.shipping_lead_time}</span>
                      </div>
                    )}
                    {variant.attributes?.estimated_delivery && (
                      <div>
                        <span className="text-gray-500">Delivery:</span>
                        <span className="ml-1">{variant.attributes.estimated_delivery}</span>
                      </div>
                    )}
                  </div>

                  {/* Variant Badges */}
                  <div className="flex flex-wrap gap-1">
                    {variant.attributes?.is_quick_ship && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">⚡ Quick Ship</span>
                    )}
                    {variant.attributes?.has_free_shipping && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">📦 Free Shipping</span>
                    )}
                    {variant.attributes?.is_made_to_order && (
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">🛠️ Made to Order</span>
                    )}
                    {variant.attributes?.swatch_color && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded flex items-center">
                        <span 
                          className="w-3 h-3 rounded-full mr-1 border border-gray-300" 
                          style={{backgroundColor: `#${variant.attributes.swatch_color}`}}
                        ></span>
                        Color
                      </span>
                    )}
                  </div>

                  {/* Shipping Message */}
                  {variant.attributes?.shipping_message && (
                    <p className="text-xs text-gray-600 mt-2 italic">
                      {variant.attributes.shipping_message}
                    </p>
                  )}
                </div>
              </div>
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

  const renderFeatures = (features, featureGroups) => {
    // If we have feature_groups, use those for better organization
    if (featureGroups && featureGroups.length > 0) {
      return (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Features & Specifications</h3>
          <div className="space-y-4">
            {featureGroups.map((group, groupIdx) => (
              <div key={groupIdx} className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">{group.name}</h4>
                <ul className="space-y-1">
                  {group.features && group.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start text-sm">
                      <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">
                        {typeof feature === 'string' ? feature : `${feature.name}: ${feature.value}`}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )
    }

    // Fallback to simple features list
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
                  {/* Brand Logo */}
                  {productData.brand_logo?.url && (
                    <div className="mb-3">
                      <img 
                        src={productData.brand_logo.url} 
                        alt={productData.brand_logo.description || productData.brand}
                        className="h-12 object-contain"
                      />
                    </div>
                  )}
                  
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {productData.title || productData.name || 'Product Details'}
                  </h2>
                  
                  <div className="flex flex-wrap gap-4 mb-2">
                    {productData.brand && (
                      <div>
                        <span className="text-sm text-gray-600">Brand:</span>
                        {productData.brand_url ? (
                          <a 
                            href={productData.brand_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="ml-2 font-semibold text-blue-600 hover:text-blue-800"
                          >
                            {productData.brand}
                          </a>
                        ) : (
                          <span className="ml-2 font-semibold text-gray-900">{productData.brand}</span>
                        )}
                      </div>
                    )}
                    {productData.model_number && (
                      <div>
                        <span className="text-sm text-gray-600">Model:</span>
                        <span className="ml-2 font-mono text-gray-900">{productData.model_number}</span>
                      </div>
                    )}
                    {productData.id && (
                      <div>
                        <span className="text-sm text-gray-600">Product ID:</span>
                        <span className="ml-2 text-gray-900">{productData.id}</span>
                      </div>
                    )}
                  </div>

                  {/* Categories */}
                  {productData.categories && productData.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {productData.categories.map((cat, idx) => (
                        <a
                          key={idx}
                          href={cat.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded hover:bg-blue-100"
                        >
                          {cat.name}
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Status Badges */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {productData.is_discontinued && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                        ⚠️ DISCONTINUED
                      </span>
                    )}
                    {productData.has_free_installation && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                        🔧 Free Installation
                      </span>
                    )}
                    {productData.is_by_appointment_only && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">
                        📅 By Appointment Only
                      </span>
                    )}
                    {productData.has_accessories && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                        🔩 Accessories Available
                      </span>
                    )}
                    {productData.has_replacement_parts && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded">
                        🔧 Replacement Parts Available
                      </span>
                    )}
                  </div>
                  
                  {productData.url && (
                    <a 
                      href={productData.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 inline-flex items-center mt-3"
                    >
                      View on Ferguson
                      <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>

                {/* Pricing */}
                {(productData.price || productData.price_range || productData.original_price) && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-baseline gap-4 mb-2">
                      {productData.price ? (
                        <div>
                          <span className="text-3xl font-bold text-green-600">
                            ${productData.price.toFixed(2)}
                          </span>
                          {productData.currency && productData.currency !== 'USD' && (
                            <span className="text-gray-500 ml-2">{productData.currency}</span>
                          )}
                        </div>
                      ) : productData.price_range?.has_range && (
                        <div>
                          <span className="text-2xl font-bold text-green-600">
                            ${productData.price_range.min?.toFixed(2)} - ${productData.price_range.max?.toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-600 ml-2">Price Range</span>
                        </div>
                      )}
                      {productData.original_price && productData.original_price !== productData.price && (
                        <span className="text-lg text-gray-500 line-through">
                          ${productData.original_price.toFixed(2)}
                        </span>
                      )}
                    </div>
                    
                    {/* Shipping Info */}
                    <div className="flex flex-wrap gap-3 text-sm">
                      {productData.shipping_fee !== undefined && productData.shipping_fee !== null && (
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-gray-600 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                          </svg>
                          <span className="text-gray-700">
                            {productData.shipping_fee === 0 ? 'FREE Shipping' : `Shipping: $${productData.shipping_fee}`}
                          </span>
                        </div>
                      )}
                      {productData.configuration_type && (
                        <div className="text-gray-600">
                          <span className="font-medium">Configuration:</span> {productData.configuration_type}
                        </div>
                      )}
                    </div>
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

                {/* Product Information Grid */}
                <div className="grid grid-cols-2 gap-3 text-sm bg-gray-50 p-4 rounded-lg">
                  {productData.category && (
                    <div>
                      <span className="font-medium text-gray-600">Category:</span>
                      <span className="ml-2 text-gray-900">{productData.category}</span>
                    </div>
                  )}
                  {productData.product_type && (
                    <div>
                      <span className="font-medium text-gray-600">Product Type:</span>
                      <span className="ml-2 text-gray-900">{productData.product_type}</span>
                    </div>
                  )}
                  {productData.base_type && (
                    <div>
                      <span className="font-medium text-gray-600">Base Type:</span>
                      <span className="ml-2 text-gray-900">{productData.base_type}</span>
                    </div>
                  )}
                  {productData.application && (
                    <div>
                      <span className="font-medium text-gray-600">Application:</span>
                      <span className="ml-2 text-gray-900">{productData.application}</span>
                    </div>
                  )}
                  {productData.business_category && (
                    <div>
                      <span className="font-medium text-gray-600">Business Category:</span>
                      <span className="ml-2 text-gray-900">{productData.business_category}</span>
                    </div>
                  )}
                  {productData.upc && (
                    <div>
                      <span className="font-medium text-gray-600">UPC:</span>
                      <span className="ml-2 text-gray-900 font-mono text-xs">{productData.upc}</span>
                    </div>
                  )}
                  {productData.barcode && (
                    <div>
                      <span className="font-medium text-gray-600">Barcode:</span>
                      <span className="ml-2 text-gray-900 font-mono text-xs">{productData.barcode}</span>
                    </div>
                  )}
                  {productData.country_of_origin && (
                    <div>
                      <span className="font-medium text-gray-600">Origin:</span>
                      <span className="ml-2 text-gray-900">{productData.country_of_origin}</span>
                    </div>
                  )}
                  {productData.total_inventory_quantity !== undefined && (
                    <div>
                      <span className="font-medium text-gray-600">Total Stock:</span>
                      <span className="ml-2 text-green-700 font-semibold">{productData.total_inventory_quantity} units</span>
                    </div>
                  )}
                  {productData.variant_count !== undefined && (
                    <div>
                      <span className="font-medium text-gray-600">Variants:</span>
                      <span className="ml-2 text-gray-900">{productData.variant_count} available</span>
                    </div>
                  )}
                  {productData.in_stock_variant_count !== undefined && (
                    <div>
                      <span className="font-medium text-gray-600">In Stock:</span>
                      <span className="ml-2 text-green-700 font-semibold">{productData.in_stock_variant_count} variants</span>
                    </div>
                  )}
                  {productData.is_configurable !== undefined && (
                    <div>
                      <span className="font-medium text-gray-600">Configurable:</span>
                      <span className="ml-2 text-gray-900">{productData.is_configurable ? 'Yes' : 'No'}</span>
                    </div>
                  )}
                </div>

                {/* Ratings & Reviews */}
                {(productData.rating || productData.review_count || productData.questions_count) && (
                  <div className="flex gap-6 text-sm">
                    {productData.rating && (
                      <div>
                        <span className="font-medium text-gray-600">Rating:</span>
                        <span className="ml-2 text-yellow-600">★ {productData.rating}</span>
                        {productData.review_count && (
                          <span className="ml-1 text-gray-500">({productData.review_count} reviews)</span>
                        )}
                      </div>
                    )}
                    {productData.questions_count > 0 && (
                      <div>
                        <span className="font-medium text-gray-600">Q&A:</span>
                        <span className="ml-2 text-gray-900">{productData.questions_count} questions</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Collection Info */}
                {productData.collection && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-purple-900 mb-1">Collection</h3>
                    <p className="text-sm text-purple-800 font-medium">{productData.collection.name}</p>
                    {productData.collection.description && (
                      <p className="text-xs text-purple-700 mt-1">{productData.collection.description}</p>
                    )}
                  </div>
                )}

                {/* Certifications */}
                {productData.certifications && productData.certifications.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Certifications</h3>
                    <div className="flex flex-wrap gap-2">
                      {productData.certifications.map((cert, idx) => (
                        <span key={idx} className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Warranty */}
                {(productData.warranty || productData.manufacturer_warranty) && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-blue-900 mb-2">Warranty Information</h3>
                    {productData.warranty && (
                      <p className="text-sm text-blue-800 mb-1">{productData.warranty}</p>
                    )}
                    {productData.manufacturer_warranty && (
                      <p className="text-sm text-blue-800">Manufacturer: {productData.manufacturer_warranty}</p>
                    )}
                  </div>
                )}

                {/* Dimensions */}
                {productData.dimensions && Object.keys(productData.dimensions).length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Dimensions</h3>
                    <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-3 gap-3 text-sm">
                      {productData.dimensions.height && (
                        <div>
                          <span className="font-medium text-gray-600">Height:</span>
                          <span className="ml-2 text-gray-900">{productData.dimensions.height}</span>
                        </div>
                      )}
                      {productData.dimensions.width && (
                        <div>
                          <span className="font-medium text-gray-600">Width:</span>
                          <span className="ml-2 text-gray-900">{productData.dimensions.width}</span>
                        </div>
                      )}
                      {productData.dimensions.length && (
                        <div>
                          <span className="font-medium text-gray-600">Length:</span>
                          <span className="ml-2 text-gray-900">{productData.dimensions.length}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Images */}
                {renderImages(productData.images)}

                {/* Videos */}
                {productData.videos && productData.videos.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Product Videos ({productData.videos.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {productData.videos.map((video, idx) => (
                        <div key={idx} className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                          <video controls className="w-full h-full">
                            <source src={video} />
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resources (Manuals, Spec Sheets, Guides) */}
                {productData.resources && productData.resources.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      📄 Resources & Downloads ({productData.resources.length})
                    </h3>
                    <div className="space-y-2">
                      {productData.resources.map((resource, idx) => (
                        <a
                          key={idx}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
                        >
                          <div className="flex items-center">
                            <svg className="w-5 h-5 text-red-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{resource.name}</p>
                              {resource.id && (
                                <p className="text-xs text-gray-500">ID: {resource.id}</p>
                              )}
                            </div>
                          </div>
                          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Features */}
                {renderFeatures(productData.features, productData.feature_groups)}

                {/* Specifications */}
                {renderSpecifications(productData.specifications)}

                {/* Variants */}
                {renderVariants(productData.variants)}

                {/* Recommended Options */}
                {productData.recommended_options && productData.recommended_options.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      💡 Recommended Options ({productData.recommended_options.length})
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {productData.recommended_options.map((option, idx) => (
                        <div key={idx} className="border border-gray-200 rounded-lg p-3 bg-white hover:shadow-md transition-shadow">
                          {option.image_url && (
                            <img 
                              src={option.image_url} 
                              alt={option.label}
                              className="w-full h-32 object-cover rounded mb-2"
                              onError={(e) => e.target.style.display = 'none'}
                            />
                          )}
                          <p className="text-sm font-medium text-gray-900">{option.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Related Categories */}
                {productData.related_categories && productData.related_categories.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Related Categories
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {productData.related_categories.map((cat, idx) => (
                        <a
                          key={idx}
                          href={cat.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm rounded-lg transition-colors"
                        >
                          {cat.name}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Replacement Parts */}
                {productData.replacement_parts_url && (
                  <div className="mt-6">
                    <a
                      href={productData.replacement_parts_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-orange-50 border border-orange-200 text-orange-800 rounded-lg hover:bg-orange-100 transition-colors"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      View Replacement Parts
                    </a>
                  </div>
                )}

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
