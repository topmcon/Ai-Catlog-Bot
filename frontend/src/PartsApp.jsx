import { useState } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import { API_URL, API_KEY } from './config/api'

function PartsApp() {
  const [partData, setPartData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    partNumber: '',
    brand: ''
  })

  const handleEnrich = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setPartData(null)

    try {
      const response = await fetch(`${API_URL}/enrich-part`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': API_KEY
        },
        body: JSON.stringify({
          part_number: formData.partNumber,
          brand: formData.brand
        })
      })

      const data = await response.json()

      if (data.success) {
        setPartData(data.data)
      } else {
        setError(data.error || 'Failed to enrich part data')
      }
    } catch (err) {
      setError(`Error: ${err.message}. Make sure the backend is running.`)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setPartData(null)
    setError(null)
    setFormData({ partNumber: '', brand: '' })
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Part Lookup</h2>
              
              <form onSubmit={handleEnrich} className="space-y-4">
                <div>
                  <label htmlFor="partNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Part Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="partNumber"
                    required
                    value={formData.partNumber}
                    onChange={(e) => setFormData({...formData, partNumber: e.target.value})}
                    placeholder="e.g., WR17X11653"
                    className="input"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the OEM part number (MPN)
                  </p>
                </div>

                <div>
                  <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-2">
                    Brand <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="brand"
                    required
                    value={formData.brand}
                    onChange={(e) => setFormData({...formData, brand: e.target.value})}
                    placeholder="e.g., GE, Whirlpool, LG"
                    className="input"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Brand or manufacturer name
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
                        Lookup Part
                      </>
                    )}
                  </button>
                  
                  {(partData || error) && (
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
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Example Parts:</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setFormData({ partNumber: 'WR17X11653', brand: 'GE' })}
                    className="text-left text-xs p-2 hover:bg-gray-100 rounded transition-colors"
                  >
                    <div className="font-medium">WR17X11653</div>
                    <div className="text-gray-500">GE Water Valve</div>
                  </button>
                  <button
                    onClick={() => setFormData({ partNumber: 'W10813429', brand: 'Whirlpool' })}
                    className="text-left text-xs p-2 hover:bg-gray-100 rounded transition-colors"
                  >
                    <div className="font-medium">W10813429</div>
                    <div className="text-gray-500">Whirlpool Filter</div>
                  </button>
                </div>
              </div>
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
                    <svg className="animate-spin h-12 w-12 text-primary-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-lg font-semibold text-gray-900 mb-2">
                      AI is researching part details...
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
            {partData ? (
              <PartDisplay data={partData} />
            ) : !loading && (
              <div className="card h-full flex items-center justify-center">
                <div className="text-center text-gray-400 py-12">
                  <svg className="w-24 h-24 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  <p className="text-lg font-medium">No part data yet</p>
                  <p className="text-sm mt-2">Enter a part number and brand to get started</p>
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

// Component to display part data
function PartDisplay({ data }) {
  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="card bg-gradient-to-r from-primary-500 to-primary-700 text-white">
        <h2 className="text-2xl font-bold mb-2">
          {data.product_title?.product_title || 'Part Details'}
        </h2>
        <p className="text-primary-100 text-sm">
          {data.core_identification?.part_number} - {data.core_identification?.brand}
        </p>
      </div>

      {/* All sections displayed vertically */}
      <CoreInfo data={data.core_identification} details={data.key_details} />
      <TechnicalInfo data={data.technical_specs} />
      <CompatibilityInfo data={data.compatibility} cross={data.cross_reference} />
      <SymptomsInfo data={data.symptoms} description={data.description} />
      <InstallationInfo data={data.installation} />
      <ShippingInfo data={data.shipping_info} availability={data.availability} />
    </div>
  )
}

function CoreInfo({ data, details }) {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <span className="mr-2">📦</span> Core Identification
      </h3>
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold text-gray-600 mb-2">Identification</h4>
          <div className="grid grid-cols-2 gap-4">
            <InfoRow label="Part Name" value={data?.part_name} />
            <InfoRow label="Part Number" value={data?.part_number} />
            <InfoRow label="Brand" value={data?.brand} />
            <InfoRow label="Manufacturer" value={data?.manufacturer} />
            <InfoRow label="UPC" value={data?.upc} />
            <InfoRow label="Condition" value={data?.condition} />
            <InfoRow label="Genuine OEM" value={data?.is_oem ? 'Yes' : 'No'} />
          </div>
          {data?.alternate_part_numbers && data.alternate_part_numbers.length > 0 && (
            <div className="mt-3">
              <InfoRow label="Alternate Numbers" value={data.alternate_part_numbers.join(', ')} />
            </div>
          )}
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-600 mb-2 mt-4">Key Details</h4>
          <div className="grid grid-cols-2 gap-4">
            <InfoRow label="Category" value={details?.category} />
            <InfoRow label="Appliance Type" value={details?.appliance_type} />
            <InfoRow label="Weight" value={details?.weight} />
            <InfoRow label="Dimensions" value={details?.product_dimensions} />
            <InfoRow label="Color" value={details?.color} />
            <InfoRow label="Material" value={details?.material} />
            <InfoRow label="Warranty" value={details?.warranty} />
          </div>
        </div>
      </div>
    </div>
  )
}

function TechnicalInfo({ data }) {
  if (!data?.electrical && !data?.mechanical && !data?.safety_compliance) return null
  
  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <span className="mr-2">⚙️</span> Technical Specifications
      </h3>
      <div className="space-y-4">
        {data?.electrical && (
          <div>
            <h4 className="text-sm font-semibold text-gray-600 mb-2">Electrical Specifications</h4>
            <div className="grid grid-cols-2 gap-4">
              <InfoRow label="Voltage" value={data.electrical.voltage} />
              <InfoRow label="Amperage" value={data.electrical.amperage} />
              <InfoRow label="Wattage" value={data.electrical.wattage} />
              <InfoRow label="Resistance" value={data.electrical.resistance} />
              <InfoRow label="Connector Type" value={data.electrical.connector_type} />
              <InfoRow label="Bulb Type" value={data.electrical.bulb_type} />
              <InfoRow label="Lumens" value={data.electrical.lumens} />
              <InfoRow label="Color Temperature" value={data.electrical.color_temperature} />
            </div>
          </div>
        )}

        {data?.mechanical && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-gray-600 mb-2">Mechanical Specifications</h4>
            <div className="grid grid-cols-2 gap-4">
              <InfoRow label="Size" value={data.mechanical.size} />
              <InfoRow label="Thread Size" value={data.mechanical.thread_size} />
              <InfoRow label="Flow Rate" value={data.mechanical.flow_rate} />
              <InfoRow label="PSI Rating" value={data.mechanical.psi_rating} />
              <InfoRow label="Temperature Range" value={data.mechanical.temperature_range} />
              <InfoRow label="Capacity" value={data.mechanical.capacity} />
            </div>
          </div>
        )}

        {data?.safety_compliance && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-gray-600 mb-2">Safety & Compliance</h4>
            <div className="grid grid-cols-2 gap-4">
              <InfoRow label="Prop 65 Warning" value={data.safety_compliance.prop65_warning} />
              {data.safety_compliance.certifications && data.safety_compliance.certifications.length > 0 && (
                <InfoRow label="Certifications" value={data.safety_compliance.certifications.join(', ')} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function CompatibilityInfo({ data, cross }) {
  if (!data && !cross) return null
  
  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <span className="mr-2">🔄</span> Compatibility & Cross Reference
      </h3>
      <div className="space-y-4">
        {data && (
          <div>
            <h4 className="text-sm font-semibold text-gray-600 mb-2">Compatible With</h4>
            <div className="grid grid-cols-2 gap-4">
              {data?.compatible_brands && data.compatible_brands.length > 0 && (
                <InfoRow label="Brands" value={data.compatible_brands.join(', ')} />
              )}
              {data?.compatible_appliance_types && data.compatible_appliance_types.length > 0 && (
                <InfoRow label="Appliance Types" value={data.compatible_appliance_types.join(', ')} />
              )}
            </div>
            {data?.compatible_models && data.compatible_models.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-700 mb-2">Compatible Models:</p>
                <div className="text-sm text-gray-900 max-h-40 overflow-y-auto bg-gray-50 p-3 rounded">
                  {data.compatible_models.map((model, idx) => (
                    <div key={idx} className="py-1">{model}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {cross && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-gray-600 mb-2">Cross Reference</h4>
            <div className="grid grid-cols-2 gap-4">
              {cross?.replaces_part_numbers && cross.replaces_part_numbers.length > 0 && (
                <InfoRow label="Replaces" value={cross.replaces_part_numbers.join(', ')} />
              )}
              {cross?.superseded_part_numbers && cross.superseded_part_numbers.length > 0 && (
                <InfoRow label="Superseded" value={cross.superseded_part_numbers.join(', ')} />
              )}
              {cross?.equivalent_parts && cross.equivalent_parts.length > 0 && (
                <InfoRow label="Equivalents" value={cross.equivalent_parts.join(', ')} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function SymptomsInfo({ data, description }) {
  if (!data?.symptoms && !description) return null
  
  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <span className="mr-2">🔧</span> Symptoms & Description
      </h3>
      <div className="space-y-4">
        {data?.symptoms && data.symptoms.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-600 mb-2">Symptoms This Part Fixes</h4>
            <ul className="space-y-2">
              {data.symptoms.map((symptom, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-sm text-gray-900">{symptom}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {description && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-gray-600 mb-2">Description</h4>
            {description?.short_description && (
              <p className="text-sm text-gray-900 mb-3">{description.short_description}</p>
            )}
            {description?.long_description && (
              <p className="text-sm text-gray-700">{description.long_description}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function InstallationInfo({ data }) {
  if (!data) return null
  
  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <span className="mr-2">🛠️</span> Installation
      </h3>
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold text-gray-600 mb-2">Installation Details</h4>
          <div className="grid grid-cols-2 gap-4">
            <InfoRow label="Difficulty" value={data?.installation_difficulty} />
            {data?.tools_required && data.tools_required.length > 0 && (
              <InfoRow label="Tools Required" value={data.tools_required.join(', ')} />
            )}
          </div>
          {data?.safety_notes && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
              <p className="text-sm font-medium text-yellow-800 mb-1">⚠️ Safety Notes:</p>
              <p className="text-sm text-yellow-700">{data.safety_notes}</p>
            </div>
          )}
        </div>

        {data?.installation_steps && data.installation_steps.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-gray-600 mb-2">Installation Steps</h4>
            <ol className="space-y-2">
              {data.installation_steps.map((step, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="font-bold text-primary-600 mr-3">{idx + 1}.</span>
                  <span className="text-sm text-gray-900">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        <div className="mt-4">
          <h4 className="text-sm font-semibold text-gray-600 mb-2">Resources</h4>
          <div className="space-y-2">
            {data?.documentation_url && (
              <a href={data.documentation_url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline text-sm block">
                📄 Installation Manual
              </a>
            )}
            {data?.video_url && (
              <a href={data.video_url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline text-sm block">
                🎥 Installation Video
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ShippingInfo({ data, availability }) {
  if (!data && !availability) return null
  
  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <span className="mr-2">📦</span> Shipping & Availability
      </h3>
      <div className="space-y-4">
        {availability && (
          <div>
            <h4 className="text-sm font-semibold text-gray-600 mb-2">Availability</h4>
            <div className="grid grid-cols-2 gap-4">
              <InfoRow label="Stock Status" value={availability.stock_status} />
              <InfoRow label="Restock ETA" value={availability.restock_eta} />
              <InfoRow label="Delivery ETA" value={availability.delivery_eta} />
            </div>
          </div>
        )}

        {data && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-gray-600 mb-2">Shipping Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <InfoRow label="Shipping Weight" value={data?.shipping_weight} />
              <InfoRow label="Shipping Dimensions" value={data?.shipping_dimensions} />
              <InfoRow label="Estimated Ship Date" value={data?.estimated_ship_date} />
            </div>
            {data?.handling_notes && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                <p className="text-sm font-medium text-blue-800 mb-1">📦 Handling Notes:</p>
                <p className="text-sm text-blue-700">{data.handling_notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Helper components
function InfoRow({ label, value }) {
  if (!value || value === 'null' || value === 'undefined') return null
  
  return (
    <div className="p-3 rounded-lg bg-gray-50">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="font-semibold text-gray-900">{value}</p>
    </div>
  )
}

export default PartsApp
