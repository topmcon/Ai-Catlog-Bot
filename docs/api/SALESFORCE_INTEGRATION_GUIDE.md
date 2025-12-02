# Salesforce Integration Guide - Ferguson Product Lookup API

**Version:** 1.0  
**Date:** December 2, 2025  
**API Endpoint:** http://cxc-ai.com:8000

## Overview

This guide provides developers with everything needed to integrate Ferguson product lookup functionality into Salesforce. The API accepts model numbers and returns comprehensive product details including specifications, images, pricing, variants, and more.

---

## Quick Start

### 1. API Endpoint

```
POST http://cxc-ai.com:8000/lookup-ferguson
```

### 2. Authentication

Include this header in all requests:

```
X-API-Key: catbot123
```

### 3. Basic Request

```json
{
  "model_number": "K-2362-8"
}
```

### 4. Sample Response Structure

```json
{
  "success": true,
  "data": {
    "id": "product-id",
    "name": "Product Name",
    "model_number": "K-2362-8",
    "brand": "Kohler",
    "price": 366.75,
    "images": ["url1", "url2"],
    "variants": [...],
    "specifications": {...},
    // ... 50+ more fields
  },
  "metadata": {
    "source": "unwrangle_ferguson",
    "lookup_type": "model_number",
    "response_time": "2.11s"
  }
}
```

---

## Salesforce Integration Options

### Option 1: Apex HTTP Callout (Recommended)

This approach uses Salesforce Apex to call the Ferguson API directly from your org.

#### Step 1: Add Remote Site Setting

1. Navigate to **Setup** → **Security** → **Remote Site Settings**
2. Click **New Remote Site**
3. Configure:
   - **Remote Site Name:** `Ferguson_API`
   - **Remote Site URL:** `http://cxc-ai.com:8000`
   - **Active:** ✅ Checked
   - **Disable Protocol Security:** ✅ Checked (since using HTTP)

#### Step 2: Create Apex Class

```apex
public class FergusonProductService {
    
    private static final String API_ENDPOINT = 'http://cxc-ai.com:8000/lookup-ferguson';
    private static final String API_KEY = 'catbot123';
    
    /**
     * Lookup Ferguson product by model number
     * @param modelNumber - The model number to search for (e.g., "K-2362-8")
     * @return FergusonProduct - Product details or null if not found
     */
    public static FergusonProduct lookupProduct(String modelNumber) {
        
        if (String.isBlank(modelNumber)) {
            System.debug('Model number cannot be blank');
            return null;
        }
        
        try {
            // Create HTTP request
            HttpRequest req = new HttpRequest();
            req.setEndpoint(API_ENDPOINT);
            req.setMethod('POST');
            req.setHeader('Content-Type', 'application/json');
            req.setHeader('X-API-Key', API_KEY);
            req.setTimeout(30000); // 30 second timeout
            
            // Build request body
            Map<String, Object> requestBody = new Map<String, Object>{
                'model_number' => modelNumber.trim()
            };
            req.setBody(JSON.serialize(requestBody));
            
            // Send request
            Http http = new Http();
            HttpResponse res = http.send(req);
            
            // Check response status
            if (res.getStatusCode() == 200) {
                // Parse response
                Map<String, Object> responseMap = 
                    (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
                
                Boolean success = (Boolean) responseMap.get('success');
                
                if (success) {
                    Map<String, Object> data = 
                        (Map<String, Object>) responseMap.get('data');
                    return new FergusonProduct(data);
                } else {
                    System.debug('API returned success=false');
                    return null;
                }
            } else {
                System.debug('API Error: ' + res.getStatusCode() + ' - ' + res.getStatus());
                System.debug('Response: ' + res.getBody());
                return null;
            }
            
        } catch (Exception e) {
            System.debug('Exception in Ferguson lookup: ' + e.getMessage());
            System.debug('Stack trace: ' + e.getStackTraceString());
            return null;
        }
    }
    
    /**
     * Wrapper class for Ferguson product data
     */
    public class FergusonProduct {
        public String id;
        public String name;
        public String modelNumber;
        public String brand;
        public String brandUrl;
        public String brandLogo;
        public String url;
        
        // Pricing
        public Decimal price;
        public Decimal originalPrice;
        public String currency;
        public String priceRange;
        public Decimal shippingFee;
        
        // Media
        public List<String> images;
        public List<String> videos;
        
        // Categories
        public String category;
        public String baseCategory;
        public String businessCategory;
        public List<CategoryInfo> categories;
        public List<CategoryInfo> relatedCategories;
        
        // Product Information
        public String description;
        public String baseType;
        public String application;
        public Map<String, Object> specifications;
        public List<String> features;
        public List<FeatureGroup> featureGroups;
        
        // Resources (Manuals, PDFs)
        public List<ResourceInfo> resources;
        
        // Dimensions
        public String height;
        public String width;
        public String length;
        
        // Certifications & Compliance
        public List<String> certifications;
        public String upc;
        public String barcode;
        public String countryOfOrigin;
        
        // Warranties
        public String warranty;
        public String manufacturerWarranty;
        
        // Collection
        public CollectionInfo collection;
        
        // Variants
        public List<VariantInfo> variants;
        public Integer variantCount;
        public Integer inStockVariantCount;
        
        // Configuration
        public String configurationType;
        public Boolean isConfigurable;
        public List<RecommendedOption> recommendedOptions;
        
        // Status Flags
        public Boolean isDiscontinued;
        public Boolean hasFreeInstallation;
        public Boolean isByAppointmentOnly;
        public Boolean hasAccessories;
        public Boolean hasReplacementParts;
        public String replacementPartsUrl;
        
        // Inventory
        public Integer totalInventoryQuantity;
        public Boolean hasInStockVariants;
        public Boolean allVariantsInStock;
        
        public FergusonProduct(Map<String, Object> data) {
            this.id = (String) data.get('id');
            this.name = (String) data.get('name');
            this.modelNumber = (String) data.get('model_number');
            this.brand = (String) data.get('brand');
            this.brandUrl = (String) data.get('brand_url');
            this.brandLogo = (String) data.get('brand_logo');
            this.url = (String) data.get('url');
            
            // Pricing
            this.price = parseDecimal(data.get('price'));
            this.originalPrice = parseDecimal(data.get('original_price'));
            this.currency = (String) data.get('currency');
            this.priceRange = (String) data.get('price_range');
            this.shippingFee = parseDecimal(data.get('shipping_fee'));
            
            // Media
            this.images = parseStringList(data.get('images'));
            this.videos = parseStringList(data.get('videos'));
            
            // Categories
            this.category = (String) data.get('category');
            this.baseCategory = (String) data.get('base_category');
            this.businessCategory = (String) data.get('business_category');
            
            // Product Info
            this.description = (String) data.get('description');
            this.baseType = (String) data.get('base_type');
            this.application = (String) data.get('application');
            this.specifications = (Map<String, Object>) data.get('specifications');
            this.features = parseStringList(data.get('features'));
            
            // Dimensions
            this.height = (String) data.get('height');
            this.width = (String) data.get('width');
            this.length = (String) data.get('length');
            
            // Certifications
            this.certifications = parseStringList(data.get('certifications'));
            this.upc = (String) data.get('upc');
            this.barcode = (String) data.get('barcode');
            this.countryOfOrigin = (String) data.get('country_of_origin');
            
            // Warranties
            this.warranty = (String) data.get('warranty');
            this.manufacturerWarranty = (String) data.get('manufacturer_warranty');
            
            // Variants
            this.variantCount = parseInteger(data.get('variant_count'));
            this.inStockVariantCount = parseInteger(data.get('in_stock_variant_count'));
            
            // Configuration
            this.configurationType = (String) data.get('configuration_type');
            this.isConfigurable = (Boolean) data.get('is_configurable');
            
            // Status Flags
            this.isDiscontinued = (Boolean) data.get('is_discontinued');
            this.hasFreeInstallation = (Boolean) data.get('has_free_installation');
            this.isByAppointmentOnly = (Boolean) data.get('is_by_appointment_only');
            this.hasAccessories = (Boolean) data.get('has_accessories');
            this.hasReplacementParts = (Boolean) data.get('has_replacement_parts');
            this.replacementPartsUrl = (String) data.get('replacement_parts_url');
            
            // Inventory
            this.totalInventoryQuantity = parseInteger(data.get('total_inventory_quantity'));
            this.hasInStockVariants = (Boolean) data.get('has_in_stock_variants');
            this.allVariantsInStock = (Boolean) data.get('all_variants_in_stock');
        }
        
        // Helper methods
        private static Decimal parseDecimal(Object value) {
            if (value == null) return null;
            if (value instanceof Decimal) return (Decimal) value;
            if (value instanceof Integer) return Decimal.valueOf((Integer) value);
            if (value instanceof String) {
                try {
                    return Decimal.valueOf((String) value);
                } catch (Exception e) {
                    return null;
                }
            }
            return null;
        }
        
        private static Integer parseInteger(Object value) {
            if (value == null) return null;
            if (value instanceof Integer) return (Integer) value;
            if (value instanceof Decimal) return ((Decimal) value).intValue();
            if (value instanceof String) {
                try {
                    return Integer.valueOf((String) value);
                } catch (Exception e) {
                    return null;
                }
            }
            return null;
        }
        
        private static List<String> parseStringList(Object value) {
            if (value == null) return new List<String>();
            if (value instanceof List<Object>) {
                List<String> result = new List<String>();
                for (Object item : (List<Object>) value) {
                    if (item != null) {
                        result.add(String.valueOf(item));
                    }
                }
                return result;
            }
            return new List<String>();
        }
    }
    
    // Supporting classes for nested structures
    public class CategoryInfo {
        public String name;
        public String url;
    }
    
    public class FeatureGroup {
        public String name;
        public List<String> features;
    }
    
    public class ResourceInfo {
        public String name;
        public String url;
        public String id;
    }
    
    public class CollectionInfo {
        public String name;
        public String url;
        public String description;
    }
    
    public class VariantInfo {
        public String id;
        public String name;
        public String sku;
        public Decimal price;
        public String availability;
        public String imageUrl;
        public String color;
        public String swatchColor;
        public Boolean quickShip;
        public Boolean freeShipping;
        public Boolean madeToOrder;
    }
    
    public class RecommendedOption {
        public String label;
        public String imageUrl;
    }
}
```

#### Step 3: Usage Examples

```apex
// Example 1: Simple lookup
FergusonProductService.FergusonProduct product = 
    FergusonProductService.lookupProduct('K-2362-8');

if (product != null) {
    System.debug('Product Name: ' + product.name);
    System.debug('Brand: ' + product.brand);
    System.debug('Price: $' + product.price);
    System.debug('Image Count: ' + product.images.size());
}

// Example 2: Populate Salesforce Product record
Product2 sfProduct = new Product2();
sfProduct.Name = product.name;
sfProduct.ProductCode = product.modelNumber;
sfProduct.Description = product.description;
sfProduct.Family = product.category;
sfProduct.Ferguson_Brand__c = product.brand;
sfProduct.Ferguson_URL__c = product.url;
sfProduct.Image_URL__c = (product.images.size() > 0) ? product.images[0] : null;
insert sfProduct;

// Example 3: Create PricebookEntry
PricebookEntry pbe = new PricebookEntry();
pbe.Product2Id = sfProduct.Id;
pbe.Pricebook2Id = [SELECT Id FROM Pricebook2 WHERE IsStandard = true LIMIT 1].Id;
pbe.UnitPrice = product.price;
pbe.IsActive = !product.isDiscontinued;
insert pbe;
```

---

### Option 2: Lightning Web Component (LWC)

Create an interactive component for users to lookup products directly in Salesforce.

#### FergusonLookup.html
```html
<template>
    <lightning-card title="Ferguson Product Lookup" icon-name="custom:custom63">
        <div class="slds-p-around_medium">
            
            <!-- Input Section -->
            <lightning-input
                label="Model Number"
                value={modelNumber}
                onchange={handleModelChange}
                placeholder="Enter model number (e.g., K-2362-8)"
            ></lightning-input>
            
            <div class="slds-m-top_small">
                <lightning-button
                    variant="brand"
                    label="Lookup Product"
                    onclick={handleLookup}
                    disabled={isLoading}
                ></lightning-button>
            </div>
            
            <!-- Loading Spinner -->
            <template if:true={isLoading}>
                <div class="slds-m-top_medium">
                    <lightning-spinner alternative-text="Loading" size="small"></lightning-spinner>
                </div>
            </template>
            
            <!-- Error Message -->
            <template if:true={errorMessage}>
                <div class="slds-m-top_medium">
                    <div class="slds-notify slds-notify_alert slds-alert_error" role="alert">
                        <span class="slds-assistive-text">error</span>
                        <h2>{errorMessage}</h2>
                    </div>
                </div>
            </template>
            
            <!-- Product Details -->
            <template if:true={product}>
                <div class="slds-m-top_large">
                    
                    <!-- Product Header -->
                    <div class="slds-grid slds-gutters slds-m-bottom_medium">
                        <div class="slds-col slds-size_1-of-4">
                            <img src={product.brandLogo} alt={product.brand} 
                                 style="max-height: 60px;" if:true={product.brandLogo}/>
                        </div>
                        <div class="slds-col slds-size_3-of-4">
                            <h2 class="slds-text-heading_medium">{product.name}</h2>
                            <p class="slds-text-body_small">
                                <strong>Brand:</strong> {product.brand}<br/>
                                <strong>Model:</strong> {product.modelNumber}
                            </p>
                        </div>
                    </div>
                    
                    <!-- Product Image -->
                    <template if:true={product.primaryImage}>
                        <div class="slds-m-bottom_medium">
                            <img src={product.primaryImage} alt={product.name} 
                                 style="max-width: 100%; border-radius: 4px;"/>
                        </div>
                    </template>
                    
                    <!-- Pricing -->
                    <div class="slds-box slds-theme_shade slds-m-bottom_medium">
                        <h3 class="slds-text-heading_small slds-m-bottom_small">Pricing</h3>
                        <p class="slds-text-heading_large slds-text-color_success">
                            ${product.price}
                        </p>
                        <template if:true={product.priceRange}>
                            <p class="slds-text-body_small">Range: {product.priceRange}</p>
                        </template>
                    </div>
                    
                    <!-- Product Info -->
                    <div class="slds-box slds-m-bottom_medium">
                        <h3 class="slds-text-heading_small slds-m-bottom_small">Details</h3>
                        <dl class="slds-dl_horizontal">
                            <dt class="slds-dl_horizontal__label">Category:</dt>
                            <dd class="slds-dl_horizontal__detail">{product.category}</dd>
                            
                            <dt class="slds-dl_horizontal__label">UPC:</dt>
                            <dd class="slds-dl_horizontal__detail">{product.upc}</dd>
                            
                            <dt class="slds-dl_horizontal__label">Stock:</dt>
                            <dd class="slds-dl_horizontal__detail">{product.totalInventoryQuantity}</dd>
                            
                            <dt class="slds-dl_horizontal__label">Variants:</dt>
                            <dd class="slds-dl_horizontal__detail">{product.variantCount}</dd>
                        </dl>
                    </div>
                    
                    <!-- Description -->
                    <template if:true={product.description}>
                        <div class="slds-box slds-m-bottom_medium">
                            <h3 class="slds-text-heading_small slds-m-bottom_small">Description</h3>
                            <p>{product.description}</p>
                        </div>
                    </template>
                    
                    <!-- Actions -->
                    <div class="slds-m-top_medium">
                        <lightning-button
                            variant="brand"
                            label="Create Salesforce Product"
                            onclick={handleCreateProduct}
                        ></lightning-button>
                        
                        <lightning-button
                            variant="neutral"
                            label="View on Ferguson"
                            onclick={handleViewOnFerguson}
                            class="slds-m-left_small"
                        ></lightning-button>
                    </div>
                    
                </div>
            </template>
            
        </div>
    </lightning-card>
</template>
```

#### FergusonLookup.js
```javascript
import { LightningElement, track } from 'lwc';
import lookupProduct from '@salesforce/apex/FergusonProductService.lookupProduct';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class FergusonLookup extends LightningElement {
    @track modelNumber = '';
    @track product;
    @track isLoading = false;
    @track errorMessage;
    
    handleModelChange(event) {
        this.modelNumber = event.target.value;
        this.errorMessage = null;
    }
    
    handleLookup() {
        if (!this.modelNumber) {
            this.errorMessage = 'Please enter a model number';
            return;
        }
        
        this.isLoading = true;
        this.errorMessage = null;
        this.product = null;
        
        lookupProduct({ modelNumber: this.modelNumber })
            .then(result => {
                this.isLoading = false;
                if (result) {
                    this.product = {
                        ...result,
                        primaryImage: result.images && result.images.length > 0 
                            ? result.images[0] : null
                    };
                    this.showToast('Success', 'Product found!', 'success');
                } else {
                    this.errorMessage = 'Product not found. Please check the model number.';
                }
            })
            .catch(error => {
                this.isLoading = false;
                this.errorMessage = 'Error: ' + error.body.message;
                this.showToast('Error', error.body.message, 'error');
            });
    }
    
    handleCreateProduct() {
        // Navigate to create Product2 record with pre-filled data
        // Implementation depends on your Salesforce setup
        this.showToast('Info', 'Create product functionality - to be implemented', 'info');
    }
    
    handleViewOnFerguson() {
        if (this.product && this.product.url) {
            window.open(this.product.url, '_blank');
        }
    }
    
    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(evt);
    }
}
```

#### FergusonLookup.js-meta.xml
```xml
<?xml version="1.0" encoding="UTF-8"?>
<LightningComponentBundle xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>58.0</apiVersion>
    <isExposed>true</isExposed>
    <targets>
        <target>lightning__AppPage</target>
        <target>lightning__RecordPage</target>
        <target>lightning__HomePage</target>
    </targets>
</LightningComponentBundle>
```

---

### Option 3: Flow Integration

Use Salesforce Flow to lookup products without code.

#### Step 1: Create Invocable Apex Method

Add this method to `FergusonProductService.cls`:

```apex
@InvocableMethod(label='Lookup Ferguson Product' 
                 description='Looks up a Ferguson product by model number'
                 category='Ferguson')
public static List<FergusonProduct> lookupProductInvocable(List<LookupRequest> requests) {
    List<FergusonProduct> results = new List<FergusonProduct>();
    
    for (LookupRequest req : requests) {
        FergusonProduct product = lookupProduct(req.modelNumber);
        results.add(product);
    }
    
    return results;
}

public class LookupRequest {
    @InvocableVariable(label='Model Number' required=true)
    public String modelNumber;
}
```

#### Step 2: Create Flow

1. Setup → Flows → New Flow → Screen Flow
2. Add Screen element with input for Model Number
3. Add Action element: "Lookup Ferguson Product"
4. Add Screen element to display results
5. Add Create Records element to save to Salesforce

---

## Complete Field Reference

The API returns 50+ fields for each product:

### Basic Information
- `id` - Product identifier
- `name` - Product name
- `model_number` - Model/SKU number
- `url` - Product page URL
- `description` - Product description

### Brand & Manufacturer
- `brand` - Brand name (e.g., "Kohler")
- `brand_url` - Brand page URL
- `brand_logo` - Brand logo image URL

### Pricing
- `price` - Current price (decimal)
- `original_price` - Original/list price
- `currency` - Currency code (e.g., "USD")
- `price_range` - Price range string (e.g., "$366.75 - $548.06")
- `shipping_fee` - Shipping cost (null = free shipping)

### Media
- `images` - Array of product image URLs
- `videos` - Array of product video URLs

### Categories
- `category` - Primary category name
- `base_category` - Base category classification
- `business_category` - Business/trade category
- `categories` - Array of category objects `[{name, url}]`
- `related_categories` - Related category links

### Product Details
- `base_type` - Product base type
- `application` - Product application/use case
- `specifications` - Technical specifications object
- `features` - Array of feature strings
- `feature_groups` - Grouped features `[{name, features[]}]`

### Resources & Documentation
- `resources` - Downloadable resources `[{name, url, id}]`
  - Installation guides
  - User manuals
  - Specification sheets
  - Care & cleaning guides

### Physical Dimensions
- `height` - Product height with unit
- `width` - Product width with unit
- `length` - Product length/depth with unit

### Certifications & Compliance
- `certifications` - Array of certification names
- `upc` - Universal Product Code
- `barcode` - Barcode number
- `country_of_origin` - Manufacturing country

### Warranties
- `warranty` - Product warranty information
- `manufacturer_warranty` - Manufacturer warranty details

### Collection
- `collection` - Collection info object `{name, url, description}`

### Variants
- `variants` - Array of product variants
  - `id` - Variant ID
  - `name` - Variant name
  - `sku` - Variant SKU
  - `price` - Variant price
  - `original_price` - Original variant price
  - `availability` - Stock status
  - `image_url` - Variant image
  - `color` - Color name
  - `swatch_color` - Hex color code
  - `stock` - Stock quantity
  - `lead_time` - Lead time string
  - `delivery_message` - Delivery info
  - `shipping_message` - Shipping details
  - `quick_ship` - Quick ship flag
  - `free_shipping` - Free shipping flag
  - `made_to_order` - Made to order flag

### Variant Counts
- `variant_count` - Total number of variants
- `in_stock_variant_count` - In-stock variants count
- `has_in_stock_variants` - Boolean flag
- `all_variants_in_stock` - Boolean flag

### Configuration
- `configuration_type` - Configuration type (e.g., "Configurable")
- `is_configurable` - Boolean configurable flag
- `recommended_options` - Array `[{label, imageUrl}]`
- `attribute_ids` - Array of attribute IDs

### Status Flags
- `is_discontinued` - Product discontinued status
- `has_free_installation` - Free installation available
- `is_by_appointment_only` - Requires appointment
- `has_accessories` - Accessories available
- `has_replacement_parts` - Replacement parts available
- `replacement_parts_url` - Replacement parts page URL

### Inventory
- `total_inventory_quantity` - Total stock quantity

---

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": "Error message here",
  "details": "Additional error details"
}
```

### Common Error Codes

| Status Code | Meaning | Solution |
|-------------|---------|----------|
| 200 | Success | Product data returned |
| 400 | Bad Request | Check request format |
| 401 | Unauthorized | Check API key |
| 404 | Not Found | Model number not found |
| 500 | Server Error | Contact support |
| 503 | Service Unavailable | Retry after delay |

### Apex Error Handling Example

```apex
try {
    FergusonProductService.FergusonProduct product = 
        FergusonProductService.lookupProduct('INVALID-MODEL');
    
    if (product == null) {
        // Product not found - handle appropriately
        System.debug('Product not found for model number');
        // Maybe create a case, send notification, etc.
    }
    
} catch (CalloutException e) {
    // Network or API error
    System.debug('Callout error: ' + e.getMessage());
    // Log error, retry logic, etc.
    
} catch (Exception e) {
    // Other errors
    System.debug('Unexpected error: ' + e.getMessage());
}
```

---

## Testing

### Test Model Numbers

Use these model numbers for testing:

- **K-2362-8** - Kohler Cimarron Pedestal Sink (3 variants)
- **K-6626-0** - Kohler Whitehaven Sink
- **K-72218** - Kohler Shower System

### Test in Salesforce Developer Console

```apex
// Execute Anonymous Apex
FergusonProductService.FergusonProduct product = 
    FergusonProductService.lookupProduct('K-2362-8');

System.debug('=== FERGUSON PRODUCT LOOKUP TEST ===');
System.debug('Product Name: ' + product.name);
System.debug('Brand: ' + product.brand);
System.debug('Model: ' + product.modelNumber);
System.debug('Price: $' + product.price);
System.debug('Variants: ' + product.variantCount);
System.debug('Images: ' + product.images.size());
System.debug('In Stock: ' + product.totalInventoryQuantity);
System.debug('===================================');
```

### cURL Test (from terminal)

```bash
curl -X POST http://cxc-ai.com:8000/lookup-ferguson \
  -H "Content-Type: application/json" \
  -H "X-API-Key: catbot123" \
  -d '{"model_number": "K-2362-8"}'
```

---

## Performance Considerations

### Response Time
- Average: 2-3 seconds
- Set timeout to 30 seconds in Apex

### Rate Limiting
- No rate limits currently enforced
- Recommend caching results in Salesforce

### Caching Strategy

```apex
// Example: Cache product data in Custom Object
public class FergusonCache {
    
    public static FergusonProductService.FergusonProduct getProduct(String modelNumber) {
        
        // Check cache first
        List<Ferguson_Product_Cache__c> cached = [
            SELECT Data__c, Last_Updated__c 
            FROM Ferguson_Product_Cache__c 
            WHERE Model_Number__c = :modelNumber 
            AND Last_Updated__c > :Datetime.now().addHours(-24)
            LIMIT 1
        ];
        
        if (!cached.isEmpty()) {
            // Return cached data (less than 24 hours old)
            Map<String, Object> data = 
                (Map<String, Object>) JSON.deserializeUntyped(cached[0].Data__c);
            return new FergusonProductService.FergusonProduct(data);
        }
        
        // Cache miss - fetch from API
        FergusonProductService.FergusonProduct product = 
            FergusonProductService.lookupProduct(modelNumber);
        
        if (product != null) {
            // Save to cache
            upsert new Ferguson_Product_Cache__c(
                Model_Number__c = modelNumber,
                Data__c = JSON.serialize(product),
                Last_Updated__c = Datetime.now()
            ) Model_Number__c;
        }
        
        return product;
    }
}
```

---

## Security Best Practices

1. **API Key Protection**
   - Store API key in Named Credentials or Custom Metadata
   - Never hardcode in Lightning components
   - Rotate keys periodically

2. **Field-Level Security**
   - Apply FLS to custom fields
   - Use `with sharing` in Apex classes

3. **User Permissions**
   - Create Permission Set for Ferguson lookup access
   - Assign to appropriate users only

4. **Data Validation**
   - Validate model numbers before API calls
   - Sanitize user inputs
   - Handle null/empty responses gracefully

---

## Troubleshooting

### Issue: "Unauthorized endpoint"

**Solution:** Add remote site setting for http://cxc-ai.com:8000

### Issue: "Read timed out"

**Solution:** Increase timeout in HttpRequest:
```apex
req.setTimeout(60000); // 60 seconds
```

### Issue: "System.CalloutException: Unauthorized"

**Solution:** Verify X-API-Key header is set correctly:
```apex
req.setHeader('X-API-Key', 'catbot123');
```

### Issue: Product returns null but API works in Postman

**Solution:** Check for JSON parsing errors in debug logs. The response structure may have changed.

---

## Product Catalog Integration

### Custom Object Setup for Product Catalog

If you want to integrate Ferguson data into a custom **Product Catalog** object, follow these steps to add all Ferguson fields and create a lookup button.

#### Step 1: Create Ferguson Custom Fields

Navigate to **Setup** → **Object Manager** → **Product Catalog** → **Fields & Relationships** → **New**

Create the following custom fields:

| Field Label | API Name | Type | Length/Precision | Description |
|------------|----------|------|------------------|-------------|
| Ferguson Product ID | Ferguson_Product_ID__c | Text | 255 | Build.com/Ferguson ID of product |
| Ferguson Product Name | Ferguson_Product_Name__c | Text | 255 | Name of product listing |
| Ferguson Product URL | Ferguson_Product_URL__c | URL | 255 | URL of product listing |
| Ferguson Brand | Ferguson_Brand__c | Text | 255 | Brand name of product |
| Ferguson Brand URL | Ferguson_Brand_URL__c | URL | 255 | URL of brand page |
| Ferguson Brand Logo URL | Ferguson_Brand_Logo_URL__c | URL | 255 | URL of brand logo |
| Ferguson Model Number | Ferguson_Model_Number__c | Text | 255 | Model number of product |
| Ferguson Category | Ferguson_Category__c | Text | 255 | Primary category |
| Ferguson Base Category | Ferguson_Base_Category__c | Text | 255 | Base category classification |
| Ferguson Business Category | Ferguson_Business_Category__c | Text | 255 | Business category |
| Ferguson Price | Ferguson_Price__c | Currency | 16,2 | Current price |
| Ferguson Price Range Min | Ferguson_Price_Range_Min__c | Currency | 16,2 | Minimum price in range |
| Ferguson Price Range Max | Ferguson_Price_Range__c | Currency | 16,2 | Maximum price in range |
| Ferguson Has Price Range | Ferguson_Has_Price_Range__c | Checkbox | - | Indicates price range exists |
| Ferguson Original Price | Ferguson_Original_Price__c | Currency | 16,2 | Original/list price |
| Ferguson Shipping Fee | Ferguson_Shipping_Fee__c | Currency | 16,2 | Shipping cost |
| Ferguson Currency | Ferguson_Currency__c | Text | 10 | Currency code (USD) |
| Ferguson Image URL | Ferguson_Image_URL__c | URL | 255 | Primary product image |
| Ferguson Product Type | Ferguson_Product_Type__c | Text | 255 | Type of product |
| Ferguson Base Type | Ferguson_Base_Type__c | Text | 255 | Base type of product |
| Ferguson Application | Ferguson_Application__c | Text | 255 | Product application |
| Ferguson Description | Ferguson_Description__c | Long Text Area | 32768 | Product description |
| Ferguson UPC | Ferguson_UPC__c | Text | 50 | UPC code |
| Ferguson Barcode | Ferguson_Barcode__c | Text | 50 | Barcode |
| Ferguson Country of Origin | Ferguson_Country_Origin__c | Text | 100 | Manufacturing country |
| Ferguson Height | Ferguson_Height__c | Text | 50 | Height dimension |
| Ferguson Width | Ferguson_Width__c | Text | 50 | Width dimension |
| Ferguson Length | Ferguson_Length__c | Text | 50 | Length dimension |
| Ferguson Warranty | Ferguson_Warranty__c | Text | 255 | Warranty information |
| Ferguson Manufacturer Warranty | Ferguson_Manufacturer_Warranty__c | Text | 255 | Manufacturer warranty |
| Ferguson Review Count | Ferguson_Review_Count__c | Number | 18,0 | Number of reviews |
| Ferguson Rating | Ferguson_Rating__c | Number | 3,2 | Average rating |
| Ferguson Questions Count | Ferguson_Questions_Count__c | Number | 18,0 | Number of questions |
| Ferguson Variant Count | Ferguson_Variant_Count__c | Number | 18,0 | Total variants |
| Ferguson In Stock Variant Count | Ferguson_In_Stock_Variant_Count__c | Number | 18,0 | In-stock variants |
| Ferguson Total Inventory | Ferguson_Total_Inventory__c | Number | 18,0 | Total inventory quantity |
| Ferguson Configuration Type | Ferguson_Configuration_Type__c | Text | 100 | Configuration type |
| Ferguson Replacement Parts URL | Ferguson_Replacement_Parts_URL__c | URL | 255 | Replacement parts page |
| Ferguson Collection Name | Ferguson_Collection_Name__c | Text | 255 | Collection name |
| Ferguson Collection URL | Ferguson_Collection_URL__c | URL | 255 | Collection page URL |
| Ferguson Is Discontinued | Ferguson_Is_Discontinued__c | Checkbox | - | Product discontinued |
| Ferguson Has Free Installation | Ferguson_Has_Free_Installation__c | Checkbox | - | Free installation available |
| Ferguson Is Configurable | Ferguson_Is_Configurable__c | Checkbox | - | Has configurable options |
| Ferguson Has Accessories | Ferguson_Has_Accessories__c | Checkbox | - | Accessories available |
| Ferguson Has Replacement Parts | Ferguson_Has_Replacement_Parts__c | Checkbox | - | Replacement parts available |
| Ferguson Has Recommended Options | Ferguson_Has_Recommended_Options__c | Checkbox | - | Recommended options available |
| Ferguson Has Variant Groups | Ferguson_Has_Variant_Groups__c | Checkbox | - | Has variant groups |
| Ferguson Is By Appointment Only | Ferguson_Is_By_Appointment_Only__c | Checkbox | - | Appointment required |
| Ferguson Has In Stock Variants | Ferguson_Has_In_Stock_Variants__c | Checkbox | - | Has in-stock variants |
| Ferguson All Variants In Stock | Ferguson_All_Variants_In_Stock__c | Checkbox | - | All variants in stock |
| Ferguson Certifications | Ferguson_Certifications__c | Long Text Area | 32768 | Product certifications (JSON) |
| Ferguson Features | Ferguson_Features__c | Long Text Area | 32768 | Product features (JSON) |
| Ferguson Feature Groups | Ferguson_Feature_Groups__c | Long Text Area | 32768 | Feature groups (JSON) |
| Ferguson Specifications | Ferguson_Specifications__c | Long Text Area | 32768 | Specifications (JSON) |
| Ferguson Images | Ferguson_Images__c | Long Text Area | 32768 | Image URLs (JSON array) |
| Ferguson Videos | Ferguson_Videos__c | Long Text Area | 32768 | Video URLs (JSON array) |
| Ferguson Categories | Ferguson_Categories__c | Long Text Area | 32768 | Categories (JSON) |
| Ferguson Related Categories | Ferguson_Related_Categories__c | Long Text Area | 32768 | Related categories (JSON) |
| Ferguson Resources | Ferguson_Resources__c | Long Text Area | 32768 | Resources/documents (JSON) |
| Ferguson Variants | Ferguson_Variants__c | Long Text Area | 131072 | Product variants (JSON) |
| Ferguson Recommended Options | Ferguson_Recommended_Options__c | Long Text Area | 32768 | Recommended options (JSON) |
| Ferguson Attribute IDs | Ferguson_Attribute_IDs__c | Long Text Area | 32768 | Attribute IDs (JSON) |
| Ferguson Last Lookup Date | Ferguson_Last_Lookup_Date__c | Date/Time | - | Last API lookup timestamp |
| Ferguson Raw JSON Response | Ferguson_Raw_JSON__c | Long Text Area | 131072 | Complete API response |

#### Step 2: Create Ferguson Tab Section in Page Layout

1. **Object Manager** → **Product Catalog** → **Page Layouts**
2. Edit your active page layout
3. Drag a new **Section** component onto the layout
4. Configure section:
   - **Section Name**: `Ferguson Product Data`
   - **Layout**: 2-Column
   - **Tab-key Order**: Left-Right
5. Drag Ferguson fields into the section (organize by category)
6. **Save** the layout

#### Step 3: Create Custom Button for Ferguson Lookup

1. **Object Manager** → **Product Catalog** → **Buttons, Links, and Actions**
2. Click **New Button or Link**
3. Configure:
   - **Label**: `Lookup Ferguson Product`
   - **Name**: `Lookup_Ferguson_Product`
   - **Display Type**: Detail Page Button
   - **Behavior**: Execute JavaScript
   - **Content Source**: OnClick JavaScript

4. **JavaScript Code**:

```javascript
{!REQUIRESCRIPT("/soap/ajax/58.0/connection.js")}
{!REQUIRESCRIPT("/soap/ajax/58.0/apex.js")}

// Get the model number from the Product Catalog record
var modelNumber = '{!Product_Catalog__c.Model_Number_Verified__c}';
var recordId = '{!Product_Catalog__c.Id}';

if (!modelNumber || modelNumber === '') {
    alert('Please enter a Model Number before looking up Ferguson data.');
} else {
    if (confirm('Lookup Ferguson product data for model: ' + modelNumber + '?\n\nThis will populate all Ferguson fields with live data.')) {
        try {
            // Show loading message
            var loadingMsg = 'Fetching Ferguson data for ' + modelNumber + '...\n\nThis may take 5-10 seconds.';
            alert(loadingMsg);
            
            // Call Apex method (requires FergusonProductService to be deployed)
            var result = sforce.apex.execute(
                'FergusonProductService',
                'updateProductCatalog',
                {
                    recordId: recordId,
                    modelNumber: modelNumber
                }
            );
            
            if (result === 'success') {
                alert('Ferguson product data retrieved successfully!\n\nRefreshing page to show updated data...');
                location.reload();
            } else if (result === 'not_found') {
                alert('Product not found in Ferguson database.\n\nModel: ' + modelNumber + '\n\nPlease verify the model number is correct.');
            } else {
                alert('Error retrieving Ferguson data.\n\nPlease check debug logs for details.');
            }
        } catch (e) {
            alert('Error: ' + e.message + '\n\nPlease contact your Salesforce administrator.');
        }
    }
}
```

5. **Save** the button

#### Step 4: Add Button to Page Layout

1. Return to **Page Layouts** → Edit your layout
2. Click the **Buttons** section at the top
3. Drag **Lookup Ferguson Product** button into the **Custom Buttons** area (next to your other buttons)
4. **Save** the layout

#### Step 5: Deploy Apex Method for Product Catalog

Add this method to your `FergusonProductService` class:

```apex
/**
 * Update Product Catalog record with Ferguson data
 * @param recordId - ID of Product_Catalog__c record
 * @param modelNumber - Model number to lookup
 * @return String - 'success', 'not_found', or 'error'
 */
@RemoteAction
public static String updateProductCatalog(String recordId, String modelNumber) {
    try {
        FergusonProduct product = lookupProduct(modelNumber);
        
        if (product == null) {
            return 'not_found';
        }
        
        // Build the update record
        Product_Catalog__c pc = new Product_Catalog__c(Id = recordId);
        
        // Basic Information
        pc.Ferguson_Product_ID__c = product.id;
        pc.Ferguson_Product_Name__c = product.name;
        pc.Ferguson_Product_URL__c = product.url;
        pc.Ferguson_Brand__c = product.brand;
        pc.Ferguson_Brand_URL__c = product.brandUrl;
        pc.Ferguson_Brand_Logo_URL__c = product.brandLogo;
        pc.Ferguson_Model_Number__c = product.modelNumber;
        
        // Categories
        pc.Ferguson_Category__c = product.category;
        pc.Ferguson_Base_Category__c = product.baseCategory;
        pc.Ferguson_Business_Category__c = product.businessCategory;
        
        // Pricing
        pc.Ferguson_Price__c = product.price;
        pc.Ferguson_Original_Price__c = product.originalPrice;
        pc.Ferguson_Shipping_Fee__c = product.shippingFee;
        pc.Ferguson_Currency__c = product.currency;
        pc.Ferguson_Price_Range__c = product.priceRange;
        
        // Product Details
        pc.Ferguson_Product_Type__c = product.baseType;
        pc.Ferguson_Application__c = product.application;
        pc.Ferguson_Description__c = product.description;
        
        // Identifiers
        pc.Ferguson_UPC__c = product.upc;
        pc.Ferguson_Barcode__c = product.barcode;
        pc.Ferguson_Country_Origin__c = product.countryOfOrigin;
        
        // Dimensions
        pc.Ferguson_Height__c = product.height;
        pc.Ferguson_Width__c = product.width;
        pc.Ferguson_Length__c = product.length;
        
        // Warranties
        pc.Ferguson_Warranty__c = product.warranty;
        pc.Ferguson_Manufacturer_Warranty__c = product.manufacturerWarranty;
        
        // Variants & Inventory
        pc.Ferguson_Variant_Count__c = product.variantCount;
        pc.Ferguson_In_Stock_Variant_Count__c = product.inStockVariantCount;
        pc.Ferguson_Total_Inventory__c = product.totalInventoryQuantity;
        
        // Configuration
        pc.Ferguson_Configuration_Type__c = product.configurationType;
        pc.Ferguson_Replacement_Parts_URL__c = product.replacementPartsUrl;
        
        // Collection
        if (product.collection != null) {
            // Assuming collection is an object with name and url properties
            // You may need to adjust based on actual structure
        }
        
        // Status Flags
        pc.Ferguson_Is_Discontinued__c = product.isDiscontinued;
        pc.Ferguson_Has_Free_Installation__c = product.hasFreeInstallation;
        pc.Ferguson_Is_Configurable__c = product.isConfigurable;
        pc.Ferguson_Has_Accessories__c = product.hasAccessories;
        pc.Ferguson_Has_Replacement_Parts__c = product.hasReplacementParts;
        pc.Ferguson_Is_By_Appointment_Only__c = product.isByAppointmentOnly;
        pc.Ferguson_Has_In_Stock_Variants__c = product.hasInStockVariants;
        pc.Ferguson_All_Variants_In_Stock__c = product.allVariantsInStock;
        
        // Media & Complex Data (stored as JSON)
        if (product.images != null && !product.images.isEmpty()) {
            pc.Ferguson_Image_URL__c = product.images[0]; // Primary image
            pc.Ferguson_Images__c = JSON.serialize(product.images);
        }
        
        if (product.videos != null && !product.videos.isEmpty()) {
            pc.Ferguson_Videos__c = JSON.serialize(product.videos);
        }
        
        // Store complex objects as JSON
        if (product.features != null) {
            pc.Ferguson_Features__c = JSON.serialize(product.features);
        }
        
        if (product.specifications != null) {
            pc.Ferguson_Specifications__c = JSON.serializePretty(product.specifications);
        }
        
        if (product.certifications != null) {
            pc.Ferguson_Certifications__c = JSON.serialize(product.certifications);
        }
        
        if (product.variants != null) {
            pc.Ferguson_Variants__c = JSON.serialize(product.variants);
        }
        
        // Timestamp
        pc.Ferguson_Last_Lookup_Date__c = System.now();
        
        // Store complete raw response for reference
        pc.Ferguson_Raw_JSON__c = JSON.serializePretty(product);
        
        // Update the record
        update pc;
        
        return 'success';
        
    } catch (Exception e) {
        System.debug('Error updating Product Catalog: ' + e.getMessage());
        System.debug('Stack trace: ' + e.getStackTraceString());
        return 'error';
    }
}
```

#### Step 6: Test the Integration

1. Open a Product Catalog record
2. Ensure **Model Number (Verified)** field has a value (e.g., "K-2362-8")
3. Click the **Lookup Ferguson Product** button at the top
4. Confirm the lookup
5. Wait 5-10 seconds for API response
6. Page will refresh with all Ferguson data populated

---

## Support & Contact

- **API Endpoint:** http://cxc-ai.com:8000
- **Documentation:** See FERGUSON_API_GUIDE.md for full API reference
- **Test Portal:** http://cxc-ai.com/ferguson.html

---

## Appendix: Custom Metadata Type Setup

For enterprise deployments, store API configuration in Custom Metadata:

### Ferguson_API_Settings__mdt

| Field | Value |
|-------|-------|
| API_Endpoint__c | http://cxc-ai.com:8000/lookup-ferguson |
| API_Key__c | catbot123 |
| Timeout__c | 30000 |
| Cache_Duration_Hours__c | 24 |

### Usage in Apex

```apex
Ferguson_API_Settings__mdt settings = 
    Ferguson_API_Settings__mdt.getInstance('Default');

req.setEndpoint(settings.API_Endpoint__c);
req.setHeader('X-API-Key', settings.API_Key__c);
req.setTimeout(Integer.valueOf(settings.Timeout__c));
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Dec 2, 2025 | Initial release with 50+ fields support |

---

**Ready to integrate? Start with the Apex callout example above!**
