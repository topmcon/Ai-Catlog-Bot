import { useState } from 'react'

export default function ProductForm({ onEnrich, loading, onReset }) {
  const [brand, setBrand] = useState('')
  const [modelNumber, setModelNumber] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (brand.trim()) {
      onEnrich(brand.trim(), modelNumber.trim())
    }
  }

  const handleClear = () => {
    setBrand('')
    setModelNumber('')
    onReset()
  }

  // Example products for quick testing
  const examples = [
    { brand: 'Fisher & Paykel', model: 'OS24NDB1', name: 'Dishwasher' },
    { brand: 'Miele', model: 'H6880BP', name: 'Built-In Oven' },
    { brand: 'Bosch', model: 'SHPM88Z75N', name: 'Dishwasher' },
    { brand: 'Sub-Zero', model: 'BI-36UFD/S', name: 'Refrigerator' },
  ]

  const loadExample = (example) => {
    setBrand(example.brand)
    setModelNumber(example.model)
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">
        Search Product
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-2">
            Brand <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="brand"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="e.g., Fisher & Paykel, Miele, Bosch"
            className="input-field"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">
            Model Number <span className="text-gray-400 text-xs">(optional)</span>
          </label>
          <input
            type="text"
            id="model"
            value={modelNumber}
            onChange={(e) => setModelNumber(e.target.value)}
            placeholder="e.g., OS24NDB1, H6880BP"
            className="input-field"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">
            If model is not provided, AI will search for general brand information
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading || !brand.trim()}
            className="btn-primary flex-1"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enriching...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Enrich Product
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleClear}
            disabled={loading}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
          >
            Clear
          </button>
        </div>
      </form>

      {/* Example Products */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Try these examples:
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {examples.map((example, index) => (
            <button
              key={index}
              onClick={() => loadExample(example)}
              disabled={loading}
              className="text-left p-3 rounded-lg border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <p className="font-medium text-sm text-gray-900">{example.brand}</p>
              <p className="text-xs text-gray-500">{example.model}</p>
              <p className="text-xs text-primary-600 mt-1">{example.name}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
