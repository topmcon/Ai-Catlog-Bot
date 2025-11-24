import { useState, useEffect } from 'react'
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import PortalsDashboard from './pages/PortalsDashboard'
import SystemStatus from './pages/SystemStatus'
import ServerControl from './pages/ServerControl'
import APITesting from './pages/APITesting'
import UsageMonitoring from './pages/UsageMonitoring'
import ConfigManager from './pages/ConfigManager'
import ProductManager from './pages/ProductManager'
import SystemLogs from './pages/SystemLogs'

function AdminApp() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 flex">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} />

        {/* Main Content */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
          {/* Top Bar */}
          <TopBar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

          {/* Page Content */}
          <main className="flex-1 p-6 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/portals" element={<PortalsDashboard />} />
            <Route path="/status" element={<SystemStatus />} />
            <Route path="/server" element={<ServerControl />} />
            <Route path="/api-testing" element={<APITesting />} />
            <Route path="/usage" element={<UsageMonitoring />} />
            <Route path="/config" element={<ConfigManager />} />
            <Route path="/products" element={<ProductManager />} />
            <Route path="/logs" element={<SystemLogs />} />
          </Routes>
          </main>
        </div>
      </div>
    </Router>
  )
}

function Sidebar({ isOpen }) {
  const location = useLocation()

  const menuItems = [
    { icon: '📊', label: 'Dashboard', path: '/' },
    { icon: '🌐', label: 'Portals', path: '/portals' },
    { icon: '🔍', label: 'System Status', path: '/status' },
    { icon: '🖥️', label: 'Server Control', path: '/server' },
    { icon: '🔧', label: 'API Testing', path: '/api-testing' },
    { icon: '📈', label: 'Usage & Analytics', path: '/usage' },
    { icon: '⚙️', label: 'Configuration', path: '/config' },
    { icon: '📦', label: 'Product Manager', path: '/products' },
    { icon: '📋', label: 'System Logs', path: '/logs' },
  ]

  return (
    <aside className={`fixed left-0 top-0 h-full bg-gray-900 text-white transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'} z-40`}>
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-gray-800">
        {isOpen ? (
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🤖</span>
            <span className="font-bold text-lg">Admin Panel</span>
          </div>
        ) : (
          <span className="text-2xl">🤖</span>
        )}
      </div>

      {/* Menu */}
      <nav className="mt-6">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 transition-colors ${
                isActive 
                  ? 'bg-primary-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {isOpen && <span className="ml-3">{item.label}</span>}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

function TopBar({ onToggleSidebar }) {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center space-x-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-xl font-semibold text-gray-900">Catalog-BOT Admin</h1>
      </div>

      <div className="flex items-center space-x-6">
        <div className="text-sm text-gray-600">
          {currentTime.toLocaleTimeString()}
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">System Online</span>
        </div>
        <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
          A
        </div>
      </div>
    </header>
  )
}

export default AdminApp
