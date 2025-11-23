export default function ProductDisplay({ data }) {
  const { 
    verified_information, 
    dimensions_and_weight,
    packaging_specs,
    product_classification,
    performance_specs,
    capacity,
    features, 
    product_description, 
    safety_compliance,
    warranty_info,
    accessories,
    installation_requirements,
    product_attributes 
  } = data

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="card bg-gradient-to-r from-primary-500 to-primary-700 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              {verified_information.product_title}
            </h2>
            <p className="text-primary-100 text-sm">
              {verified_information.brand} • {verified_information.model_number}
            </p>
            {verified_information.series_collection && (
              <p className="text-primary-200 text-xs mt-1">
                {verified_information.series_collection} Series
              </p>
            )}
          </div>
          <span className="badge bg-white/20 text-white backdrop-blur">
            ✓ AI Verified
          </span>
        </div>
      </div>

      {/* Quick Info Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {capacity?.total_capacity && (
          <QuickStat icon="📦" label="Capacity" value={capacity.total_capacity} />
        )}
        {performance_specs?.energy?.energy_star_rating && (
          <QuickStat icon="⚡" label="Energy Star" value="Certified" />
        )}
        {verified_information.finish_color && (
          <QuickStat icon="🎨" label="Finish" value={verified_information.finish_color} />
        )}
        {warranty_info?.manufacturer_warranty_parts && (
          <QuickStat icon="🛡️" label="Warranty" value={warranty_info.manufacturer_warranty_parts} />
        )}
      </div>

      {/* Product Description */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Product Description
        </h3>
        <p className="text-gray-700 leading-relaxed whitespace-pre-line">{product_description}</p>
      </div>

      {/* Verified Product Information */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Verified Product Information
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <SpecItem label="Brand" value={verified_information.brand} />
          <SpecItem label="Model Number" value={verified_information.model_number} />
          {verified_information.series_collection && (
            <SpecItem label="Series/Collection" value={verified_information.series_collection} />
          )}
          {verified_information.finish_color && (
            <SpecItem label="Finish/Color" value={verified_information.finish_color} />
          )}
          {verified_information.upc_gtin && (
            <SpecItem label="UPC/GTIN" value={verified_information.upc_gtin} />
          )}
          {verified_information.sku_internal && (
            <SpecItem label="SKU" value={verified_information.sku_internal} />
          )}
          {verified_information.mpn && (
            <SpecItem label="MPN" value={verified_information.mpn} />
          )}
          {verified_information.country_of_origin && (
            <SpecItem label="Country of Origin" value={verified_information.country_of_origin} />
          )}
          {verified_information.release_year && (
            <SpecItem label="Release Year" value={verified_information.release_year} />
          )}
        </div>
      </div>

      {/* Dimensions & Weight */}
      {dimensions_and_weight && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            Dimensions & Weight
          </h3>
          
          {/* Product Dimensions */}
          {dimensions_and_weight.product_dimensions && (
            <>
              <h4 className="text-sm font-semibold text-gray-600 mb-2 mt-4">Product Dimensions</h4>
              <div className="grid grid-cols-2 gap-4">
                {dimensions_and_weight.product_dimensions.height && (
                  <SpecItem label="Height" value={dimensions_and_weight.product_dimensions.height} />
                )}
                {dimensions_and_weight.product_dimensions.width && (
                  <SpecItem label="Width" value={dimensions_and_weight.product_dimensions.width} />
                )}
                {dimensions_and_weight.product_dimensions.depth && (
                  <SpecItem label="Depth" value={dimensions_and_weight.product_dimensions.depth} />
                )}
                {dimensions_and_weight.product_dimensions.depth_with_door_open && (
                  <SpecItem label="Depth (Door Open)" value={dimensions_and_weight.product_dimensions.depth_with_door_open} />
                )}
                {dimensions_and_weight.product_dimensions.cutout_height && (
                  <SpecItem label="Cutout Height" value={dimensions_and_weight.product_dimensions.cutout_height} />
                )}
                {dimensions_and_weight.product_dimensions.cutout_width && (
                  <SpecItem label="Cutout Width" value={dimensions_and_weight.product_dimensions.cutout_width} />
                )}
                {dimensions_and_weight.product_dimensions.cutout_depth && (
                  <SpecItem label="Cutout Depth" value={dimensions_and_weight.product_dimensions.cutout_depth} />
                )}
              </div>
            </>
          )}

          {/* Clearance Requirements */}
          {dimensions_and_weight.clearance_requirements && (
            <>
              <h4 className="text-sm font-semibold text-gray-600 mb-2 mt-4">Clearance Requirements</h4>
              <div className="grid grid-cols-2 gap-4">
                {dimensions_and_weight.clearance_requirements.top_clearance && (
                  <SpecItem label="Top Clearance" value={dimensions_and_weight.clearance_requirements.top_clearance} />
                )}
                {dimensions_and_weight.clearance_requirements.back_clearance && (
                  <SpecItem label="Back Clearance" value={dimensions_and_weight.clearance_requirements.back_clearance} />
                )}
                {dimensions_and_weight.clearance_requirements.side_clearance && (
                  <SpecItem label="Side Clearance" value={dimensions_and_weight.clearance_requirements.side_clearance} />
                )}
                {dimensions_and_weight.clearance_requirements.door_swing_clearance && (
                  <SpecItem label="Door Swing Clearance" value={dimensions_and_weight.clearance_requirements.door_swing_clearance} />
                )}
              </div>
            </>
          )}

          {/* Weight */}
          {dimensions_and_weight.weight && (
            <>
              <h4 className="text-sm font-semibold text-gray-600 mb-2 mt-4">Weight</h4>
              <div className="grid grid-cols-2 gap-4">
                {dimensions_and_weight.weight.product_weight && (
                  <SpecItem label="Product Weight" value={dimensions_and_weight.weight.product_weight} />
                )}
                {dimensions_and_weight.weight.shipping_weight && (
                  <SpecItem label="Shipping Weight" value={dimensions_and_weight.weight.shipping_weight} />
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Capacity */}
      {capacity && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            Capacity
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {capacity.total_capacity && (
              <SpecItem label="Total Capacity" value={capacity.total_capacity} highlight />
            )}
            {capacity.refrigerator_capacity && (
              <SpecItem label="Refrigerator Capacity" value={capacity.refrigerator_capacity} />
            )}
            {capacity.freezer_capacity && (
              <SpecItem label="Freezer Capacity" value={capacity.freezer_capacity} />
            )}
            {capacity.oven_capacity && (
              <SpecItem label="Oven Capacity" value={capacity.oven_capacity} />
            )}
            {capacity.washer_drum_capacity && (
              <SpecItem label="Washer Capacity" value={capacity.washer_drum_capacity} />
            )}
            {capacity.dryer_capacity && (
              <SpecItem label="Dryer Capacity" value={capacity.dryer_capacity} />
            )}
            {capacity.dishwasher_place_settings && (
              <SpecItem label="Dishwasher Settings" value={capacity.dishwasher_place_settings} />
            )}
          </div>
        </div>
      )}

      {/* Features */}
      {features && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Features
          </h3>
          
          {/* Core Features */}
          {features.core_features && features.core_features.length > 0 && (
            <>
              <h4 className="text-sm font-semibold text-gray-600 mb-2">Core Features ({features.core_features.length})</h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                {features.core_features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* Smart Features */}
          {features.smart_features && (
            <>
              <h4 className="text-sm font-semibold text-gray-600 mb-2 mt-4">Smart Features</h4>
              <div className="grid grid-cols-2 gap-4">
                {features.smart_features.wifi_enabled !== null && (
                  <AttributeBadge label="WiFi Enabled" value={features.smart_features.wifi_enabled} />
                )}
                {features.smart_features.remote_monitoring !== null && (
                  <AttributeBadge label="Remote Monitoring" value={features.smart_features.remote_monitoring} />
                )}
                {features.smart_features.app_compatibility && (
                  <SpecItem label="App Compatibility" value={features.smart_features.app_compatibility} />
                )}
                {features.smart_features.voice_control && (
                  <SpecItem label="Voice Control" value={features.smart_features.voice_control} />
                )}
              </div>
              {features.smart_features.notifications && features.smart_features.notifications.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-1">Notifications</p>
                  <div className="flex flex-wrap gap-1">
                    {features.smart_features.notifications.map((notif, idx) => (
                      <span key={idx} className="badge-info text-xs">{notif}</span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Convenience Features */}
          {features.convenience_features && (
            <>
              <h4 className="text-sm font-semibold text-gray-600 mb-2 mt-4">Convenience Features</h4>
              <div className="grid grid-cols-2 gap-4">
                {features.convenience_features.ice_maker_type && (
                  <SpecItem label="Ice Maker" value={features.convenience_features.ice_maker_type} />
                )}
                {features.convenience_features.water_dispenser !== null && (
                  <AttributeBadge label="Water Dispenser" value={features.convenience_features.water_dispenser} />
                )}
                {features.convenience_features.door_in_door !== null && (
                  <AttributeBadge label="Door-in-Door" value={features.convenience_features.door_in_door} />
                )}
                {features.convenience_features.interior_lighting_type && (
                  <SpecItem label="Interior Lighting" value={features.convenience_features.interior_lighting_type} />
                )}
                {features.convenience_features.shelving_type && (
                  <SpecItem label="Shelving Type" value={features.convenience_features.shelving_type} />
                )}
                {features.convenience_features.rack_basket_material && (
                  <SpecItem label="Rack Material" value={features.convenience_features.rack_basket_material} />
                )}
                {features.convenience_features.control_panel_type && (
                  <SpecItem label="Control Panel" value={features.convenience_features.control_panel_type} />
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Performance & Technical Specs */}
      {performance_specs && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Performance & Technical Specs
          </h3>
          
          {/* Electrical */}
          {performance_specs.electrical && (
            <>
              <h4 className="text-sm font-semibold text-gray-600 mb-2">Electrical</h4>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {performance_specs.electrical.voltage && (
                  <SpecItem label="Voltage" value={performance_specs.electrical.voltage} />
                )}
                {performance_specs.electrical.amperage && (
                  <SpecItem label="Amperage" value={performance_specs.electrical.amperage} />
                )}
                {performance_specs.electrical.hertz && (
                  <SpecItem label="Frequency" value={performance_specs.electrical.hertz} />
                )}
                {performance_specs.electrical.plug_type && (
                  <SpecItem label="Plug Type" value={performance_specs.electrical.plug_type} />
                )}
                {performance_specs.electrical.power_cord_included !== null && (
                  <AttributeBadge label="Power Cord Included" value={performance_specs.electrical.power_cord_included} />
                )}
              </div>
            </>
          )}

          {/* Water */}
          {performance_specs.water && (
            <>
              <h4 className="text-sm font-semibold text-gray-600 mb-2 mt-4">Water</h4>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {performance_specs.water.water_line_required !== null && (
                  <AttributeBadge label="Water Line Required" value={performance_specs.water.water_line_required} />
                )}
                {performance_specs.water.water_pressure_range && (
                  <SpecItem label="Water Pressure Range" value={performance_specs.water.water_pressure_range} />
                )}
                {performance_specs.water.water_usage_per_cycle && (
                  <SpecItem label="Water Usage/Cycle" value={performance_specs.water.water_usage_per_cycle} />
                )}
              </div>
            </>
          )}

          {/* Gas */}
          {performance_specs.gas && (performance_specs.gas.gas_type || performance_specs.gas.conversion_kit_included !== null) && (
            <>
              <h4 className="text-sm font-semibold text-gray-600 mb-2 mt-4">Gas</h4>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {performance_specs.gas.gas_type && (
                  <SpecItem label="Gas Type" value={performance_specs.gas.gas_type} />
                )}
                {performance_specs.gas.conversion_kit_included !== null && (
                  <AttributeBadge label="Conversion Kit Included" value={performance_specs.gas.conversion_kit_included} />
                )}
              </div>
            </>
          )}

          {/* Energy */}
          {performance_specs.energy && (
            <>
              <h4 className="text-sm font-semibold text-gray-600 mb-2 mt-4">Energy</h4>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {performance_specs.energy.kwh_per_year && (
                  <SpecItem label="Energy Usage/Year" value={performance_specs.energy.kwh_per_year} />
                )}
                {performance_specs.energy.energy_star_rating !== null && (
                  <AttributeBadge label="Energy Star Certified" value={performance_specs.energy.energy_star_rating} />
                )}
              </div>
            </>
          )}

          {/* Cooling/Heating */}
          {performance_specs.cooling_heating && (
            <>
              <h4 className="text-sm font-semibold text-gray-600 mb-2 mt-4">Cooling/Heating System</h4>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {performance_specs.cooling_heating.cooling_system_type && (
                  <SpecItem label="Cooling System" value={performance_specs.cooling_heating.cooling_system_type} />
                )}
                {performance_specs.cooling_heating.compressor_type && (
                  <SpecItem label="Compressor Type" value={performance_specs.cooling_heating.compressor_type} />
                )}
                {performance_specs.cooling_heating.defrost_type && (
                  <SpecItem label="Defrost Type" value={performance_specs.cooling_heating.defrost_type} />
                )}
                {performance_specs.cooling_heating.refrigerant_type && (
                  <SpecItem label="Refrigerant" value={performance_specs.cooling_heating.refrigerant_type} />
                )}
                {performance_specs.cooling_heating.temperature_range && (
                  <SpecItem label="Temperature Range" value={performance_specs.cooling_heating.temperature_range} />
                )}
              </div>
            </>
          )}

          {/* Noise Level */}
          {performance_specs.noise_level?.dba_rating && (
            <>
              <h4 className="text-sm font-semibold text-gray-600 mb-2 mt-4">Noise Level</h4>
              <div className="grid grid-cols-2 gap-4">
                <SpecItem label="Noise Rating" value={performance_specs.noise_level.dba_rating} />
              </div>
            </>
          )}
        </div>
      )}

      {/* Classification */}
      {product_classification && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Product Classification
          </h3>
          <div className="flex flex-wrap gap-2">
            {product_classification.department && (
              <span className="badge-info">{product_classification.department}</span>
            )}
            {product_classification.category && (
              <span className="badge-info">{product_classification.category}</span>
            )}
            {product_classification.product_family && (
              <span className="badge-info">{product_classification.product_family}</span>
            )}
            {product_classification.product_style && (
              <span className="badge-info">{product_classification.product_style}</span>
            )}
            {product_classification.configuration && (
              <span className="badge-info">{product_classification.configuration}</span>
            )}
          </div>
        </div>
      )}

      {/* Packaging Specifications */}
      {packaging_specs && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            Packaging Specifications
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {packaging_specs.box_height && (
              <SpecItem label="Box Height" value={packaging_specs.box_height} />
            )}
            {packaging_specs.box_width && (
              <SpecItem label="Box Width" value={packaging_specs.box_width} />
            )}
            {packaging_specs.box_depth && (
              <SpecItem label="Box Depth" value={packaging_specs.box_depth} />
            )}
            {packaging_specs.box_weight && (
              <SpecItem label="Box Weight" value={packaging_specs.box_weight} />
            )}
            {packaging_specs.palletized_weight && (
              <SpecItem label="Palletized Weight" value={packaging_specs.palletized_weight} />
            )}
            {packaging_specs.pallet_dimensions && (
              <SpecItem label="Pallet Dimensions" value={packaging_specs.pallet_dimensions} />
            )}
          </div>
        </div>
      )}

      {/* Safety & Compliance */}
      {safety_compliance && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Safety & Compliance
          </h3>
          <div className="space-y-2">
            {safety_compliance.ada_compliant !== null && (
              <CertBadge label="ADA Compliant" value={safety_compliance.ada_compliant} />
            )}
            {safety_compliance.prop_65_warning !== null && (
              <CertBadge label="California Prop 65" value={safety_compliance.prop_65_warning} />
            )}
            {safety_compliance.ul_csa_certified !== null && (
              <CertBadge label="UL/CSA Certified" value={safety_compliance.ul_csa_certified} />
            )}
            {safety_compliance.child_lock !== null && (
              <CertBadge label="Child Lock" value={safety_compliance.child_lock} />
            )}
            {safety_compliance.fire_safety_certifications && safety_compliance.fire_safety_certifications.length > 0 && (
              <div className="py-2 px-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 mb-1">Fire Safety Certifications</p>
                <div className="flex flex-wrap gap-1">
                  {safety_compliance.fire_safety_certifications.map((cert, idx) => (
                    <span key={idx} className="badge-success text-xs">{cert}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Warranty Information */}
      {warranty_info && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Warranty Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {warranty_info.manufacturer_warranty_parts && (
              <SpecItem label="Parts Warranty" value={warranty_info.manufacturer_warranty_parts} />
            )}
            {warranty_info.manufacturer_warranty_labor && (
              <SpecItem label="Labor Warranty" value={warranty_info.manufacturer_warranty_labor} />
            )}
            {warranty_info.compressor_warranty && (
              <SpecItem label="Compressor Warranty" value={warranty_info.compressor_warranty} />
            )}
            {warranty_info.drum_warranty && (
              <SpecItem label="Drum Warranty" value={warranty_info.drum_warranty} />
            )}
          </div>
          {warranty_info.extended_warranty_options && warranty_info.extended_warranty_options.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-2">Extended Warranty Options</p>
              <div className="flex flex-wrap gap-2">
                {warranty_info.extended_warranty_options.map((option, idx) => (
                  <span key={idx} className="badge bg-purple-100 text-purple-800">{option}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Accessories */}
      {accessories && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Accessories
          </h3>
          
          {accessories.included_accessories && accessories.included_accessories.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-600 mb-2">Included</h4>
              <ul className="space-y-1">
                {accessories.included_accessories.map((item, idx) => (
                  <li key={idx} className="flex items-start text-sm">
                    <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {accessories.optional_accessories && accessories.optional_accessories.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-600 mb-2">Optional (Sold Separately)</h4>
              <ul className="space-y-1">
                {accessories.optional_accessories.map((item, idx) => (
                  <li key={idx} className="flex items-start text-sm">
                    <svg className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Installation Requirements */}
      {installation_requirements && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Installation Requirements
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {installation_requirements.installation_type && (
              <SpecItem label="Installation Type" value={installation_requirements.installation_type} />
            )}
            {installation_requirements.venting_requirements && (
              <SpecItem label="Venting" value={installation_requirements.venting_requirements} />
            )}
            {installation_requirements.drain_requirement !== null && (
              <AttributeBadge label="Drain Required" value={installation_requirements.drain_requirement} />
            )}
            {installation_requirements.hardwire_vs_plug && (
              <SpecItem label="Connection Type" value={installation_requirements.hardwire_vs_plug} />
            )}
            {installation_requirements.leveling_legs_included !== null && (
              <AttributeBadge label="Leveling Legs Included" value={installation_requirements.leveling_legs_included} />
            )}
          </div>
        </div>
      )}

      {/* Product Attributes */}
      {product_attributes && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Product Attributes
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <AttributeBadge label="Built-In Appliance" value={product_attributes.built_in_appliance} />
            <AttributeBadge label="Luxury/Premium" value={product_attributes.luxury_premium_appliance} />
            <AttributeBadge label="Portable" value={product_attributes.portable} />
            <AttributeBadge label="Panel Ready" value={product_attributes.panel_ready} />
            <AttributeBadge label="Counter Depth" value={product_attributes.counter_depth} />
            <AttributeBadge label="Commercial Rated" value={product_attributes.commercial_rated} />
            <AttributeBadge label="Outdoor Rated" value={product_attributes.outdoor_rated} />
          </div>
        </div>
      )}

      {/* Verified By */}
      <div className="text-center text-sm text-gray-500 pb-4">
        Verified by {verified_information.verified_by}
      </div>
    </div>
  )
}

function QuickStat({ icon, label, value }) {
  return (
    <div className="card text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-semibold text-gray-900 text-sm mt-1">{value}</p>
    </div>
  )
}

function SpecItem({ label, value, highlight }) {
  return (
    <div className={`p-3 rounded-lg ${highlight ? 'bg-primary-50 border border-primary-200' : 'bg-gray-50'}`}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`font-semibold ${highlight ? 'text-primary-900' : 'text-gray-900'}`}>{value}</p>
    </div>
  )
}

function AttributeBadge({ label, value }) {
  if (value === null || value === undefined) {
    return (
      <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
        <span className="text-sm text-gray-500">{label}</span>
        <span className="text-xs text-gray-400">N/A</span>
      </div>
    )
  }
  
  return (
    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
      <span className="text-sm text-gray-700">{label}</span>
      {value ? (
        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      )}
    </div>
  )
}

function CertBadge({ label, value }) {
  if (value === null || value === undefined) return null
  
  return (
    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
      <span className="text-sm text-gray-700">{label}</span>
      {value ? (
        <span className="badge-success">
          <svg className="w-4 h-4 mr-1 inline" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Certified
        </span>
      ) : (
        <span className="badge bg-gray-100 text-gray-600">Not Certified</span>
      )}
    </div>
  )
}
