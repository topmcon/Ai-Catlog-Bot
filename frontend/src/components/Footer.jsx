export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-16">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Catalog-BOT</h3>
            <p className="text-sm text-gray-600">
              AI-powered product enrichment using OpenAI GPT-4o-mini. 
              Get comprehensive product data in seconds.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Features</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>✓ AI-powered research</li>
              <li>✓ Complete product specs</li>
              <li>✓ Features & certifications</li>
              <li>✓ ~$0.001 per enrichment</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://github.com/topmcon/Ai-Catlog-Bot" className="text-primary-600 hover:text-primary-700">
                  GitHub Repository
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-600 hover:text-primary-700">
                  API Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-600 hover:text-primary-700">
                  Salesforce Integration
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-6 text-center text-sm text-gray-500">
          <p>Built with FastAPI + React + OpenAI • © 2025 Catalog-BOT • MIT License</p>
        </div>
      </div>
    </footer>
  )
}
