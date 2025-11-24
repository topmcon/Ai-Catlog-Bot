import { useState, useEffect } from 'react'
import { API_URL, API_KEY } from '../config/api'

export default function ProductManager() {
  const [products, setProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPortal, setFilterPortal] = useState('all')
  const [selectedProducts, setSelectedProducts] = useState([])
  const [showUpload, setShowUpload] = useState(false)
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(null)

  useEffect(() => {
    loadProducts()
    const interval = setInterval(loadProducts, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/portal-metrics`, {
        headers: {
          'X-API-KEY': API_KEY,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        },
        cache: 'no-store'
      })

      if (response.ok) {
        const data = await response.json()
        // Convert recent_logs to product entries
        const productEntries = data.recent_logs.map((log, index) => ({
          id: `${log.timestamp}-${index}`,
          brand: log.brand || 'Unknown',
          model: log.model_number || 'Unknown',
          portal: log.portal || 'unknown',
          source: log.source || 'unknown',
          enrichedAt: log.timestamp,
          status: log.success ? 'success' : 'failed',
          cost: 0.001, // Estimated cost per request
          responseTime: log.response_time || 0
        }))
        
        setProducts(productEntries)
        setLastRefresh(new Date().toLocaleTimeString())
      }
      setLoading(false)
    } catch (error) {
      console.error('Failed to load products:', error)
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.model.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || product.status === filterStatus
    const matchesPortal = filterPortal === 'all' || product.portal === filterPortal
    return matchesSearch && matchesStatus && matchesPortal
  })

  const toggleSelectProduct = (id) => {
    setSelectedProducts(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  const selectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id))
    }
  }

  const deleteSelected = () => {
    if (confirm(`Delete ${selectedProducts.length} selected products?`)) {
      const updated = products.filter(p => !selectedProducts.includes(p.id))
      setProducts(updated)
      localStorage.setItem('catalogbot_products', JSON.stringify(updated))
      setSelectedProducts([])
    }
  }

  const reEnrichSelected = async () => {
    alert(`Re-enriching ${selectedProducts.length} products... (This would call the API in production)`)
  }

  const exportProducts = (exportFormat) => {
    const selectedData = products.filter(p => selectedProducts.includes(p.id))
    const data = selectedData.length > 0 ? selectedData : filteredProducts

    if (exportFormat === 'json') {
      const json = JSON.stringify(data, null, 2)
      downloadFile(json, 'products.json', 'application/json')
    } else if (exportFormat === 'csv') {
      const headers = ['Brand', 'Model', 'Portal', 'Source', 'Status', 'Enriched At', 'Response Time']
      const rows = data.map(p => [
        p.brand,
        p.model,
        p.portal,
        p.source,
        p.status,
        new Date(p.enrichedAt).toISOString(),
        p.responseTime
      ])
      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
      downloadFile(csv, 'products.csv', 'text/csv')
    }
  }

  const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const csv = event.target.result
          const lines = csv.split('\n')
          const headers = lines[0].split(',')
          
          const newProducts = []
          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',')
            if (values.length >= 2) {
              newProducts.push({
                id: Date.now() + i,
                brand: values[0].trim(),
                model: values[1].trim(),
                enrichedAt: new Date().toISOString(),
                status: 'pending',
                cost: 0,
                responseTime: 0
              })
            }
          }
          
          alert(`Loaded ${newProducts.length} products. Click "Start Batch Enrichment" to process them.`)
          setProducts([...products, ...newProducts])
          setShowUpload(false)
        } catch (error) {
          alert('Error parsing CSV file: ' + error.message)
        }
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Product Manager</h2>
          <p className="text-gray-600 mt-1">View all enriched products from all portals</p>
          {lastRefresh && (
            <p className="text-sm text-gray-500 mt-1">Last updated: {lastRefresh}</p>
          )}
        </div>
        <button
          onClick={loadProducts}
          disabled={loading}
          className={`px-4 py-2 rounded-lg font-medium ${
            loading
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {loading ? '⏳ Loading...' : '🔄 Refresh'}
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <StatCard icon="📦" label="Total Products" value={products.length} />
        <StatCard icon="✅" label="Successful" value={products.filter(p => p.status === 'success').length} />
        <StatCard icon="❌" label="Failed" value={products.filter(p => p.status === 'failed').length} />
        <StatCard icon="🛍️" label="Catalog" value={products.filter(p => p.portal === 'catalog').length} />
        <StatCard icon="🔧" label="Parts" value={products.filter(p => p.portal === 'parts').length} />
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            📤 Upload CSV
          </button>
          <button
            onClick={() => exportProducts('json')}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            💾 Export JSON
          </button>
          <button
            onClick={() => exportProducts('csv')}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            📊 Export CSV
          </button>
          {selectedProducts.length > 0 && (
            <>
              <button
                onClick={reEnrichSelected}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                🔄 Re-enrich ({selectedProducts.length})
              </button>
              <button
                onClick={deleteSelected}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                🗑️ Delete ({selectedProducts.length})
              </button>
            </>
          )}
        </div>

        {/* Upload CSV Form */}
        {showUpload && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Upload CSV File</h4>
            <p className="text-sm text-gray-600 mb-3">
              CSV should have columns: Brand, Model (additional columns optional)
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-white focus:outline-none"
            />
            <div className="mt-3">
              <a
                href="data:text/csv;charset=utf-8,Brand,Model%0AFisher %26 Paykel,OS24NDB1%0AMiele,H6880BP"
                download="sample-products.csv"
                className="text-sm text-blue-600 hover:underline"
              >
                📥 Download sample CSV template
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by brand or model..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterPortal}
            onChange={(e) => setFilterPortal(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Portals</option>
            <option value="catalog">🛍️ Catalog</option>
            <option value="parts">🔧 Parts</option>
            <option value="home_products">🏠 Home Products</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            Products ({filteredProducts.length})
          </h3>
          <button
            onClick={selectAll}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {selectedProducts.length === filteredProducts.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">📦</span>
            <p className="text-gray-600">No products found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === filteredProducts.length}
                      onChange={selectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Brand</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Model</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Portal</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Source</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Enriched At</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Response Time</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => toggleSelectProduct(product.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 font-medium">{product.brand}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{product.model}</td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        product.portal === 'catalog' ? 'bg-blue-100 text-blue-700' :
                        product.portal === 'parts' ? 'bg-green-100 text-green-700' :
                        product.portal === 'home_products' ? 'bg-purple-100 text-purple-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {product.portal}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {product.source === 'ui' ? '🖥️ UI' : '🔌 API'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.status === 'success' ? 'bg-green-100 text-green-800' :
                        product.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {product.status === 'success' ? '✅ Success' : '❌ Failed'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(product.enrichedAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 font-mono">
                      {product.responseTime > 0 ? `${product.responseTime}s` : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => alert('View product details (would open modal in production)')}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          👁️
                        </button>
                        <button
                          onClick={() => alert('Re-enrich this product')}
                          className="text-green-600 hover:text-green-800 text-sm"
                        >
                          🔄
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Delete this product?')) {
                              const updated = products.filter(p => p.id !== product.id)
                              setProducts(updated)
                              localStorage.setItem('catalogbot_products', JSON.stringify(updated))
                            }
                          }}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          🗑️
                        </button>
                      </div>
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

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center space-x-3 mb-2">
        <span className="text-3xl">{icon}</span>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
      </div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  )
}
