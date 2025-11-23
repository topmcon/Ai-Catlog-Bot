import { useState } from 'react'
import ProductForm from './components/ProductForm'
import ProductDisplay from './components/ProductDisplay'
import Header from './components/Header'
import Footer from './components/Footer'

function App() {
  const [productData, setProductData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleEnrich = async (brand, modelNumber) => {
    setLoading(true)
    setError(null)
    setProductData(null)

    try {
      // Use proxy in development, direct URL in production
      const apiUrl = import.meta.env.PROD 
        ? import.meta.env.VITE_API_URL || 'https://catalog-bot.onrender.com'
        : '/api'
      
      const response = await fetch(`${apiUrl}/enrich`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': import.meta.env.VITE_API_KEY || 'test123'
        },
        body: JSON.stringify({
          brand: brand,
          model_number: modelNumber || 'N/A'
        })
      })

      const data = await response.json()

      if (data.success) {
        setProductData(data.data)
      } else {
        setError(data.error || 'Failed to enrich product data')
      }
    } catch (err) {
      setError(`Error: ${err.message}. Make sure the backend is running on http://localhost:8000`)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setProductData(null)
    setError(null)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Catalog-BOT 🤖
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            AI-powered product enrichment. Enter a brand and model number to get comprehensive product details instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <div className="space-y-6">
            <ProductForm 
              onEnrich={handleEnrich} 
              loading={loading}
              onReset={handleReset}
            />
            
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
                    <svg className="animate-spin h-12 w-12 text-primary-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-lg font-semibold text-gray-900 mb-2">
                      AI is researching your product...
                    </p>
                    <p className="text-sm text-gray-600">
                      This usually takes 10-15 seconds
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Results */}
          <div>
            {productData ? (
              <ProductDisplay data={productData} />
            ) : !loading && (
              <div className="card h-full flex items-center justify-center">
                <div className="text-center text-gray-400 py-12">
                  <svg className="w-24 h-24 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-lg font-medium">No product data yet</p>
                  <p className="text-sm mt-2">Enter a brand and model to get started</p>
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

export default App
