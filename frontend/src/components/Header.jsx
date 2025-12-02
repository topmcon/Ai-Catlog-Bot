export default function Header() {
  // Detect current page
  const currentPath = window.location.pathname
  const isHomePage = currentPath === '/' || currentPath.includes('index.html')
  const isPartsPage = currentPath.includes('parts.html')
  const isHomeProductsPage = currentPath.includes('home-products.html')
  const isFergusonPage = currentPath.includes('ferguson.html')
  const isAdminPage = currentPath.includes('admin.html')

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🤖</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Catalog-BOT</h1>
              <p className="text-xs text-gray-500">AI Product Enrichment Engine</p>
            </div>
          </div>
          
          {/* Portal Navigation */}
          <nav className="flex gap-2">
            <a 
              href="/"
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                isHomePage 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Catalog
            </a>
            <a 
              href="/parts.html"
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                isPartsPage 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Parts
            </a>
            <a 
              href="/home-products.html"
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                isHomeProductsPage 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Home Products
            </a>
            <a 
              href="/ferguson.html"
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                isFergusonPage 
                  ? 'bg-orange-100 text-orange-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              🔍 Ferguson
            </a>
            <a 
              href="/admin.html"
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                isAdminPage 
                  ? 'bg-gray-800 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Admin
            </a>
          </nav>
        </div>
      </div>
    </header>
  )
}
