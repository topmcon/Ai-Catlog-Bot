# 🔗 Salesforce Integration Guide

Complete guide for integrating Catalog-BOT and Parts-BOT APIs with Salesforce.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Setup Requirements](#setup-requirements)
3. [Remote Site Settings](#remote-site-settings)
4. [Custom Objects](#custom-objects)
5. [Apex Classes](#apex-classes)
6. [Usage Examples](#usage-examples)
7. [Automation Examples](#automation-examples)

---

## 🎯 Overview

This integration allows Salesforce to:
- Send product/part information to enrichment APIs
- Receive comprehensive data back
- Store enriched data in Salesforce objects
- Automate enrichment via triggers/flows

**API Endpoints:**
- Product: `https://ai-catlog-bot.onrender.com/enrich`
- Parts: `https://ai-catlog-bot.onrender.com/enrich-part`

**Authentication:** API Key in header

---

## ⚙️ Setup Requirements

### 1. Remote Site Settings

**Setup → Security → Remote Site Settings → New Remote Site**

**Name:** CatalogBOT_API  
**Remote Site URL:** `https://ai-catlog-bot.onrender.com`  
**Description:** Catalog-BOT and Parts-BOT API  
**Active:** ✓ Checked

---

## 📦 Custom Objects

### Option 1: Use Standard Objects
Store enriched data in standard Product2, Asset, or custom fields.

### Option 2: Create Custom Objects

**Enriched_Product__c:**
```
API Name: Enriched_Product__c
Label: Enriched Product

Fields:
- Brand__c (Text, 255)
- Model_Number__c (Text, 255)
- Product_Name__c (Text, 255)
- UPC__c (Text, 50)
- Total_Capacity__c (Text, 100)
- Energy_Star__c (Checkbox)
- Warranty__c (Text Area Long)
- Features__c (Text Area Long)
- Raw_Data__c (Text Area Long, 131,072)
```

**Enriched_Part__c:**
```
API Name: Enriched_Part__c
Label: Enriched Part

Fields:
- Part_Number__c (Text, 255)
- Brand__c (Text, 255)
- Part_Name__c (Text, 255)
- Category__c (Text, 100)
- Appliance_Type__c (Text, 100)
- Compatible_Models__c (Text Area Long)
- Symptoms__c (Text Area Long)
- Installation_Difficulty__c (Picklist: Easy, Moderate, Advanced)
- Raw_Data__c (Text Area Long, 131,072)
```

---

## 💻 Apex Classes

### 1. Product Enrichment Service

**File:** `CatalogBotProductService.cls`

```apex
public class CatalogBotProductService {
    
    // API Configuration
    private static final String API_URL = 'https://ai-catlog-bot.onrender.com/enrich';
    private static final String API_KEY = 'catbot123'; // Store in Custom Metadata or Named Credentials
    
    /**
     * Enrich a single product
     */
    public static ProductEnrichmentResult enrichProduct(String brand, String modelNumber) {
        ProductEnrichmentResult result = new ProductEnrichmentResult();
        
        try {
            // Build request
            HttpRequest req = new HttpRequest();
            req.setEndpoint(API_URL);
            req.setMethod('POST');
            req.setHeader('Content-Type', 'application/json');
            req.setHeader('X-API-KEY', API_KEY);
            req.setTimeout(60000); // 60 second timeout
            
            // Request body
            Map<String, String> requestBody = new Map<String, String>{
                'brand' => brand,
                'model_number' => modelNumber
            };
            req.setBody(JSON.serialize(requestBody));
            
            // Send request
            Http http = new Http();
            HttpResponse res = http.send(req);
            
            // Parse response
            if (res.getStatusCode() == 200) {
                Map<String, Object> responseMap = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
                
                if ((Boolean) responseMap.get('success')) {
                    result.success = true;
                    result.data = (Map<String, Object>) responseMap.get('data');
                    result.message = 'Product enriched successfully';
                } else {
                    result.success = false;
                    result.error = (String) responseMap.get('error');
                }
            } else {
                result.success = false;
                result.error = 'HTTP Error: ' + res.getStatus();
            }
            
        } catch (Exception e) {
            result.success = false;
            result.error = e.getMessage();
        }
        
        return result;
    }
    
    /**
     * Enrich and create Salesforce record
     */
    public static Id enrichAndCreateProduct(String brand, String modelNumber) {
        ProductEnrichmentResult result = enrichProduct(brand, modelNumber);
        
        if (!result.success) {
            throw new CatalogBotException('Enrichment failed: ' + result.error);
        }
        
        // Create Enriched_Product__c record
        Enriched_Product__c product = new Enriched_Product__c();
        
        // Extract verified information
        Map<String, Object> verifiedInfo = (Map<String, Object>) result.data.get('verified_information');
        if (verifiedInfo != null) {
            product.Brand__c = (String) verifiedInfo.get('brand');
            product.Model_Number__c = (String) verifiedInfo.get('model_number');
            product.Product_Name__c = (String) verifiedInfo.get('product_name');
            product.UPC__c = (String) verifiedInfo.get('upc');
        }
        
        // Extract capacity
        Map<String, Object> capacity = (Map<String, Object>) result.data.get('capacity');
        if (capacity != null) {
            product.Total_Capacity__c = (String) capacity.get('total_capacity');
        }
        
        // Extract performance specs
        Map<String, Object> perfSpecs = (Map<String, Object>) result.data.get('performance_specs');
        if (perfSpecs != null) {
            product.Energy_Star__c = (Boolean) perfSpecs.get('energy_star_certified');
        }
        
        // Extract warranty
        Map<String, Object> warranty = (Map<String, Object>) result.data.get('warranty_info');
        if (warranty != null) {
            product.Warranty__c = (String) warranty.get('standard_warranty');
        }
        
        // Extract features
        Map<String, Object> features = (Map<String, Object>) result.data.get('features');
        if (features != null) {
            List<Object> keyFeatures = (List<Object>) features.get('key_features');
            if (keyFeatures != null && !keyFeatures.isEmpty()) {
                product.Features__c = String.join(keyFeatures, '\n');
            }
        }
        
        // Store raw JSON
        product.Raw_Data__c = JSON.serialize(result.data);
        
        insert product;
        return product.Id;
    }
    
    /**
     * Batch enrich multiple products
     */
    public static List<ProductEnrichmentResult> enrichProducts(List<ProductRequest> products) {
        List<ProductEnrichmentResult> results = new List<ProductEnrichmentResult>();
        
        for (ProductRequest req : products) {
            results.add(enrichProduct(req.brand, req.modelNumber));
        }
        
        return results;
    }
    
    // Inner classes
    public class ProductRequest {
        public String brand;
        public String modelNumber;
        
        public ProductRequest(String brand, String modelNumber) {
            this.brand = brand;
            this.modelNumber = modelNumber;
        }
    }
    
    public class ProductEnrichmentResult {
        public Boolean success;
        public Map<String, Object> data;
        public String error;
        public String message;
    }
    
    public class CatalogBotException extends Exception {}
}
```

### 2. Parts Enrichment Service

**File:** `CatalogBotPartsService.cls`

```apex
public class CatalogBotPartsService {
    
    // API Configuration
    private static final String API_URL = 'https://ai-catlog-bot.onrender.com/enrich-part';
    private static final String API_KEY = 'catbot123'; // Store in Custom Metadata or Named Credentials
    
    /**
     * Enrich a single part
     */
    public static PartEnrichmentResult enrichPart(String partNumber, String brand) {
        PartEnrichmentResult result = new PartEnrichmentResult();
        
        try {
            // Build request
            HttpRequest req = new HttpRequest();
            req.setEndpoint(API_URL);
            req.setMethod('POST');
            req.setHeader('Content-Type', 'application/json');
            req.setHeader('X-API-KEY', API_KEY);
            req.setTimeout(60000); // 60 second timeout
            
            // Request body
            Map<String, String> requestBody = new Map<String, String>{
                'part_number' => partNumber,
                'brand' => brand
            };
            req.setBody(JSON.serialize(requestBody));
            
            // Send request
            Http http = new Http();
            HttpResponse res = http.send(req);
            
            // Parse response
            if (res.getStatusCode() == 200) {
                Map<String, Object> responseMap = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
                
                if ((Boolean) responseMap.get('success')) {
                    result.success = true;
                    result.data = (Map<String, Object>) responseMap.get('data');
                    result.metrics = (Map<String, Object>) responseMap.get('metrics');
                    result.message = 'Part enriched successfully';
                } else {
                    result.success = false;
                    result.error = (String) responseMap.get('error');
                }
            } else {
                result.success = false;
                result.error = 'HTTP Error: ' + res.getStatus();
            }
            
        } catch (Exception e) {
            result.success = false;
            result.error = e.getMessage();
        }
        
        return result;
    }
    
    /**
     * Enrich and create Salesforce record
     */
    public static Id enrichAndCreatePart(String partNumber, String brand) {
        PartEnrichmentResult result = enrichPart(partNumber, brand);
        
        if (!result.success) {
            throw new CatalogBotException('Enrichment failed: ' + result.error);
        }
        
        // Create Enriched_Part__c record
        Enriched_Part__c part = new Enriched_Part__c();
        
        // Extract core identification
        Map<String, Object> coreId = (Map<String, Object>) result.data.get('core_identification');
        if (coreId != null) {
            part.Part_Number__c = (String) coreId.get('part_number');
            part.Brand__c = (String) coreId.get('brand');
            part.Part_Name__c = (String) coreId.get('part_name');
        }
        
        // Extract key details
        Map<String, Object> keyDetails = (Map<String, Object>) result.data.get('key_details');
        if (keyDetails != null) {
            part.Category__c = (String) keyDetails.get('category');
            part.Appliance_Type__c = (String) keyDetails.get('appliance_type');
        }
        
        // Extract compatibility
        Map<String, Object> compatibility = (Map<String, Object>) result.data.get('compatibility');
        if (compatibility != null) {
            List<Object> models = (List<Object>) compatibility.get('compatible_models');
            if (models != null && !models.isEmpty()) {
                part.Compatible_Models__c = String.join(models, '\n');
            }
        }
        
        // Extract symptoms
        Map<String, Object> symptoms = (Map<String, Object>) result.data.get('symptoms');
        if (symptoms != null) {
            List<Object> symptomList = (List<Object>) symptoms.get('symptoms');
            if (symptomList != null && !symptomList.isEmpty()) {
                part.Symptoms__c = String.join(symptomList, '\n');
            }
        }
        
        // Extract installation
        Map<String, Object> installation = (Map<String, Object>) result.data.get('installation');
        if (installation != null) {
            part.Installation_Difficulty__c = (String) installation.get('installation_difficulty');
        }
        
        // Store raw JSON
        part.Raw_Data__c = JSON.serialize(result.data);
        
        insert part;
        return part.Id;
    }
    
    /**
     * Get symptoms for troubleshooting
     */
    public static List<String> getPartSymptoms(String partNumber, String brand) {
        PartEnrichmentResult result = enrichPart(partNumber, brand);
        
        if (!result.success) {
            return new List<String>();
        }
        
        Map<String, Object> symptoms = (Map<String, Object>) result.data.get('symptoms');
        if (symptoms != null) {
            List<Object> symptomList = (List<Object>) symptoms.get('symptoms');
            if (symptomList != null) {
                List<String> stringSymptoms = new List<String>();
                for (Object symptom : symptomList) {
                    stringSymptoms.add((String) symptom);
                }
                return stringSymptoms;
            }
        }
        
        return new List<String>();
    }
    
    /**
     * Get compatible models
     */
    public static List<String> getCompatibleModels(String partNumber, String brand) {
        PartEnrichmentResult result = enrichPart(partNumber, brand);
        
        if (!result.success) {
            return new List<String>();
        }
        
        Map<String, Object> compatibility = (Map<String, Object>) result.data.get('compatibility');
        if (compatibility != null) {
            List<Object> models = (List<Object>) compatibility.get('compatible_models');
            if (models != null) {
                List<String> stringModels = new List<String>();
                for (Object model : models) {
                    stringModels.add((String) model);
                }
                return stringModels;
            }
        }
        
        return new List<String>();
    }
    
    // Inner classes
    public class PartEnrichmentResult {
        public Boolean success;
        public Map<String, Object> data;
        public Map<String, Object> metrics;
        public String error;
        public String message;
    }
    
    public class CatalogBotException extends Exception {}
}
```

---

## 🎯 Usage Examples

### Anonymous Apex (Developer Console)

**Test Product Enrichment:**
```apex
// Enrich and get data
CatalogBotProductService.ProductEnrichmentResult result = 
    CatalogBotProductService.enrichProduct('Samsung', 'RF28R7351SR');

if (result.success) {
    System.debug('Product Name: ' + result.data.get('verified_information'));
    System.debug('Features: ' + result.data.get('features'));
} else {
    System.debug('Error: ' + result.error);
}
```

**Create Salesforce Record:**
```apex
try {
    Id productId = CatalogBotProductService.enrichAndCreateProduct('Samsung', 'RF28R7351SR');
    System.debug('Created product record: ' + productId);
} catch (Exception e) {
    System.debug('Error: ' + e.getMessage());
}
```

**Test Parts Enrichment:**
```apex
// Enrich and get data
CatalogBotPartsService.PartEnrichmentResult result = 
    CatalogBotPartsService.enrichPart('WR17X11653', 'GE');

if (result.success) {
    System.debug('Part Name: ' + result.data.get('core_identification'));
    System.debug('Compatible Models: ' + result.data.get('compatibility'));
} else {
    System.debug('Error: ' + result.error);
}
```

**Get Part Symptoms:**
```apex
List<String> symptoms = CatalogBotPartsService.getPartSymptoms('WR17X11653', 'GE');
for (String symptom : symptoms) {
    System.debug('Symptom: ' + symptom);
}
```

---

## ⚡ Automation Examples

### 1. Trigger on Product Creation

**File:** `EnrichProductTrigger.trigger`

```apex
trigger EnrichProductTrigger on Product2 (after insert, after update) {
    
    List<Product2> productsToEnrich = new List<Product2>();
    
    for (Product2 product : Trigger.new) {
        // Check if enrichment needed
        if (product.Brand__c != null && 
            product.Model__c != null && 
            product.Enriched__c == false) {
            productsToEnrich.add(product);
        }
    }
    
    if (!productsToEnrich.isEmpty()) {
        // Call future method to enrich
        EnrichProductHelper.enrichProductsAsync(
            new Map<Id, Product2>(productsToEnrich).keySet()
        );
    }
}
```

**Helper Class:**
```apex
public class EnrichProductHelper {
    
    @future(callout=true)
    public static void enrichProductsAsync(Set<Id> productIds) {
        List<Product2> products = [
            SELECT Id, Brand__c, Model__c 
            FROM Product2 
            WHERE Id IN :productIds
        ];
        
        for (Product2 product : products) {
            try {
                // Enrich and create linked record
                Id enrichedId = CatalogBotProductService.enrichAndCreateProduct(
                    product.Brand__c, 
                    product.Model__c
                );
                
                // Update original product
                product.Enriched_Product__c = enrichedId;
                product.Enriched__c = true;
                
            } catch (Exception e) {
                System.debug('Error enriching product ' + product.Id + ': ' + e.getMessage());
            }
        }
        
        update products;
    }
}
```

### 2. Flow Integration

**Create Invocable Apex Method:**

```apex
public class CatalogBotFlowActions {
    
    @InvocableMethod(label='Enrich Product' description='Enrich product using Catalog-BOT API')
    public static List<FlowResult> enrichProductFlow(List<FlowRequest> requests) {
        List<FlowResult> results = new List<FlowResult>();
        
        for (FlowRequest request : requests) {
            FlowResult result = new FlowResult();
            
            try {
                Id enrichedId = CatalogBotProductService.enrichAndCreateProduct(
                    request.brand,
                    request.modelNumber
                );
                
                result.success = true;
                result.enrichedRecordId = enrichedId;
                result.message = 'Product enriched successfully';
                
            } catch (Exception e) {
                result.success = false;
                result.message = e.getMessage();
            }
            
            results.add(result);
        }
        
        return results;
    }
    
    public class FlowRequest {
        @InvocableVariable(required=true label='Brand')
        public String brand;
        
        @InvocableVariable(required=true label='Model Number')
        public String modelNumber;
    }
    
    public class FlowResult {
        @InvocableVariable
        public Boolean success;
        
        @InvocableVariable
        public Id enrichedRecordId;
        
        @InvocableVariable
        public String message;
    }
}
```

**Flow Setup:**
1. Create Record-Triggered Flow on Product2
2. Add Action: "Enrich Product"
3. Map Brand and Model fields
4. Store result in variable
5. Update original record with enriched data

### 3. Batch Processing

```apex
public class BatchEnrichProducts implements Database.Batchable<sObject>, Database.AllowsCallouts {
    
    public Database.QueryLocator start(Database.BatchableContext bc) {
        return Database.getQueryLocator([
            SELECT Id, Brand__c, Model__c 
            FROM Product2 
            WHERE Enriched__c = false 
            AND Brand__c != null 
            AND Model__c != null
            LIMIT 1000
        ]);
    }
    
    public void execute(Database.BatchableContext bc, List<Product2> products) {
        for (Product2 product : products) {
            try {
                Id enrichedId = CatalogBotProductService.enrichAndCreateProduct(
                    product.Brand__c,
                    product.Model__c
                );
                
                product.Enriched_Product__c = enrichedId;
                product.Enriched__c = true;
                
            } catch (Exception e) {
                System.debug('Error: ' + e.getMessage());
            }
        }
        
        update products;
    }
    
    public void finish(Database.BatchableContext bc) {
        System.debug('Batch enrichment complete');
    }
}

// Execute batch
Database.executeBatch(new BatchEnrichProducts(), 1); // Process 1 at a time due to API timeout
```

### 4. Lightning Web Component

**File:** `productEnricher.js`

```javascript
import { LightningElement, api, track } from 'lwc';
import enrichProduct from '@salesforce/apex/CatalogBotProductService.enrichProduct';

export default class ProductEnricher extends LightningElement {
    @api recordId;
    @track loading = false;
    @track result;
    @track error;
    
    brand = '';
    modelNumber = '';
    
    handleBrandChange(event) {
        this.brand = event.target.value;
    }
    
    handleModelChange(event) {
        this.modelNumber = event.target.value;
    }
    
    async handleEnrich() {
        this.loading = true;
        this.error = null;
        this.result = null;
        
        try {
            const response = await enrichProduct({
                brand: this.brand,
                modelNumber: this.modelNumber
            });
            
            if (response.success) {
                this.result = response.data;
            } else {
                this.error = response.error;
            }
        } catch (e) {
            this.error = e.body.message;
        } finally {
            this.loading = false;
        }
    }
}
```

---

## 🔒 Security Best Practices

### 1. Use Named Credentials

**Setup → Named Credentials → New**

```
Label: CatalogBOT_API
URL: https://ai-catlog-bot.onrender.com
Identity Type: Named Principal
Authentication Protocol: Custom

Custom Headers:
- X-API-KEY: catbot123
```

**Update Apex to use Named Credentials:**
```apex
req.setEndpoint('callout:CatalogBOT_API/enrich');
// Remove manual API key header
```

### 2. Use Custom Metadata for API Key

**Create Custom Metadata Type:** `CatalogBot_Setting__mdt`

Fields:
- API_Key__c (Text)
- API_URL__c (Text)

**Retrieve in Apex:**
```apex
CatalogBot_Setting__mdt setting = CatalogBot_Setting__mdt.getInstance('Default');
String apiKey = setting.API_Key__c;
```

### 3. Error Logging

```apex
public class CatalogBotLogger {
    public static void logError(String className, String methodName, String error) {
        CatalogBot_Error_Log__c log = new CatalogBot_Error_Log__c(
            Class_Name__c = className,
            Method_Name__c = methodName,
            Error_Message__c = error,
            Timestamp__c = DateTime.now()
        );
        insert log;
    }
}
```

---

## 📊 Performance Tips

1. **Use @future for triggers** - Avoid governor limits
2. **Batch size of 1** - Due to 60-second API timeout
3. **Cache results** - Store in custom objects, don't re-enrich
4. **Async processing** - Use Platform Events for large volumes
5. **Error handling** - Log failures, retry later

---

## 🧪 Test Classes

**Product Service Test:**
```apex
@isTest
public class CatalogBotProductServiceTest {
    
    @isTest
    static void testEnrichProduct() {
        // Set mock response
        Test.setMock(HttpCalloutMock.class, new CatalogBotMockSuccess());
        
        Test.startTest();
        CatalogBotProductService.ProductEnrichmentResult result = 
            CatalogBotProductService.enrichProduct('Samsung', 'RF28R7351SR');
        Test.stopTest();
        
        System.assert(result.success);
        System.assertNotEquals(null, result.data);
    }
}
```

**Mock Class:**
```apex
@isTest
global class CatalogBotMockSuccess implements HttpCalloutMock {
    global HTTPResponse respond(HTTPRequest req) {
        HttpResponse res = new HttpResponse();
        res.setStatusCode(200);
        res.setBody('{"success":true,"data":{"verified_information":{"brand":"Samsung"}}}');
        return res;
    }
}
```

---

## 📞 Support

**Common Issues:**

1. **"Unauthorized endpoint"** - Add Remote Site Setting
2. **Timeout errors** - Increase timeout to 60 seconds
3. **Governor limits** - Use @future or batch processing
4. **JSON parsing errors** - Check API response format

**Debugging:**
```apex
System.debug('Request: ' + req.getBody());
System.debug('Response: ' + res.getBody());
System.debug('Status Code: ' + res.getStatusCode());
```

---

**Integration Complete!** 🚀

Your Salesforce can now:
- ✅ Send product/part data to APIs
- ✅ Receive enriched data back
- ✅ Store in Salesforce objects
- ✅ Automate via triggers/flows
- ✅ Use in Lightning components
