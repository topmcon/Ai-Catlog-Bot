/**
 * CatalogBotService - Salesforce Integration for Catalog-BOT API
 * 
 * This Apex class provides integration between Salesforce and the Catalog-BOT API
 * for automatic product enrichment using AI.
 * 
 * Installation Instructions:
 * 1. Copy this code to Salesforce: Setup > Apex Classes > New
 * 2. Add Remote Site Setting: Setup > Remote Site Settings > New
 *    - Remote Site Name: CatalogBotAPI
 *    - Remote Site URL: https://your-catalog-bot.onrender.com
 *    - Active: Checked
 * 3. Update API_URL and API_KEY constants below
 * 4. Create a Flow or Trigger to call enrichProduct method
 * 
 * Usage Example (from Flow):
 * Action: Apex Action > enrichProduct
 * Inputs: 
 *   - productId: {Product2.Id}
 *   - brand: {Product2.Brand__c}
 *   - modelNumber: {Product2.Model_Number__c}
 */

public class CatalogBotService {
    
    // Configuration - Update these values
    private static final String API_URL = 'https://catalog-bot.onrender.com/enrich';
    private static final String API_KEY = 'your-api-key-here';
    private static final Integer TIMEOUT = 30000; // 30 seconds
    
    /**
     * Enriches a product record by calling the Catalog-BOT API
     * @param productId The Salesforce Product2 record ID
     * @param brand The product brand name
     * @param modelNumber The product model number
     */
    @future(callout=true)
    public static void enrichProduct(Id productId, String brand, String modelNumber) {
        try {
            System.debug('Starting enrichment for Product: ' + productId + ', Brand: ' + brand + ', Model: ' + modelNumber);
            
            // Build HTTP request
            HttpRequest req = new HttpRequest();
            req.setEndpoint(API_URL);
            req.setMethod('POST');
            req.setHeader('Content-Type', 'application/json');
            req.setHeader('X-API-KEY', API_KEY);
            req.setTimeout(TIMEOUT);
            
            // Create request body
            Map<String, String> requestBody = new Map<String, String>{
                'brand' => brand,
                'model_number' => modelNumber
            };
            req.setBody(JSON.serialize(requestBody));
            
            // Send request
            Http http = new Http();
            HttpResponse res = http.send(req);
            
            System.debug('Response Status: ' + res.getStatusCode());
            System.debug('Response Body: ' + res.getBody());
            
            // Handle response
            if (res.getStatusCode() == 200) {
                Map<String, Object> response = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
                Boolean success = (Boolean) response.get('success');
                
                if (success) {
                    Map<String, Object> data = (Map<String, Object>) response.get('data');
                    updateProductRecord(productId, data);
                    System.debug('Product enrichment successful');
                } else {
                    String errorMsg = (String) response.get('error');
                    logError(productId, 'API returned error: ' + errorMsg);
                }
            } else {
                logError(productId, 'HTTP ' + res.getStatusCode() + ': ' + res.getBody());
            }
            
        } catch (Exception e) {
            logError(productId, 'Exception: ' + e.getMessage() + '\nStack Trace: ' + e.getStackTraceString());
        }
    }
    
    /**
     * Updates the Product2 record with enriched data from API
     * @param productId The Salesforce Product2 record ID
     * @param data The enriched product data from API
     */
    private static void updateProductRecord(Id productId, Map<String, Object> data) {
        try {
            // Parse verified information
            Map<String, Object> verifiedInfo = (Map<String, Object>) data.get('verified_information');
            
            // Parse features
            List<Object> featuresObj = (List<Object>) data.get('features');
            String featuresText = '';
            if (featuresObj != null && !featuresObj.isEmpty()) {
                for (Object feature : featuresObj) {
                    featuresText += '• ' + (String) feature + '\n';
                }
            }
            
            // Parse classification
            Map<String, Object> classification = (Map<String, Object>) data.get('product_classification');
            
            // Parse dimensions
            Map<String, Object> boxDimensions = (Map<String, Object>) data.get('manufacturer_box_dimensions');
            
            // Parse attributes
            Map<String, Object> attributes = (Map<String, Object>) data.get('product_attributes');
            
            // Parse certifications
            Map<String, Object> certifications = (Map<String, Object>) data.get('certifications');
            
            // Update Product2 record
            // NOTE: Adjust field API names to match your Salesforce schema
            Product2 product = new Product2(Id = productId);
            
            // Basic Information
            product.Name = (String) verifiedInfo.get('product_title');
            product.Description = (String) data.get('product_description');
            product.ProductCode = (String) verifiedInfo.get('model_number');
            
            // Custom Fields - Update these API names to match your org
            // Uncomment and modify as needed:
            /*
            product.Brand__c = (String) verifiedInfo.get('brand');
            product.Model_Number__c = (String) verifiedInfo.get('model_number');
            product.Weight__c = (String) verifiedInfo.get('weight');
            product.Length__c = (String) verifiedInfo.get('length');
            product.Width__c = (String) verifiedInfo.get('width');
            product.Height__c = (String) verifiedInfo.get('height');
            product.Capacity__c = (String) verifiedInfo.get('capacity');
            product.UPC__c = (String) verifiedInfo.get('upc_gtin');
            product.Color_Finish__c = (String) verifiedInfo.get('color_finish');
            product.Features__c = featuresText;
            product.Department__c = (String) classification.get('department');
            product.Category__c = (String) classification.get('category');
            product.Product_Family__c = (String) classification.get('product_family');
            product.Product_Style__c = (String) classification.get('product_style');
            product.Box_Depth__c = (String) boxDimensions.get('box_depth');
            product.Box_Width__c = (String) boxDimensions.get('box_width');
            product.Box_Height__c = (String) boxDimensions.get('box_height');
            product.Box_Weight__c = (String) boxDimensions.get('box_weight');
            product.Built_In_Appliance__c = (Boolean) attributes.get('built_in_appliance');
            product.Luxury_Premium_Appliance__c = (Boolean) attributes.get('luxury_premium_appliance');
            product.Portable__c = (Boolean) attributes.get('portable');
            product.Panel_Ready__c = (Boolean) attributes.get('panel_ready');
            product.Counter_Depth__c = (Boolean) attributes.get('counter_depth');
            product.ADA_Compliant__c = (Boolean) certifications.get('ada_compliant');
            product.CEE_Tier_Rating__c = (String) certifications.get('cee_tier_rating');
            product.Energy_Star_Qualified__c = (Boolean) certifications.get('energy_star_qualified');
            product.AI_Enriched__c = true;
            product.Last_Enrichment_Date__c = System.now();
            */
            
            update product;
            System.debug('Product record updated successfully');
            
        } catch (Exception e) {
            logError(productId, 'Failed to update product: ' + e.getMessage());
        }
    }
    
    /**
     * Logs errors for troubleshooting
     * @param productId The Product2 record ID
     * @param errorMessage The error message to log
     */
    private static void logError(Id productId, String errorMessage) {
        System.debug(LoggingLevel.ERROR, 'Error enriching product ' + productId + ': ' + errorMessage);
        
        // Optional: Create a custom Error Log object for tracking
        // Uncomment if you have a custom Error_Log__c object:
        /*
        Error_Log__c log = new Error_Log__c(
            Product__c = productId,
            Error_Message__c = errorMessage,
            Error_Date__c = System.now(),
            Source__c = 'CatalogBotService'
        );
        insert log;
        */
    }
    
    /**
     * Invocable method for Flow integration
     * @param requests List of enrichment requests from Flow
     */
    @InvocableMethod(label='Enrich Product with AI' description='Calls Catalog-BOT API to enrich product data')
    public static void enrichProductsFromFlow(List<EnrichmentRequest> requests) {
        for (EnrichmentRequest req : requests) {
            enrichProduct(req.productId, req.brand, req.modelNumber);
        }
    }
    
    /**
     * Wrapper class for Flow invocable method
     */
    public class EnrichmentRequest {
        @InvocableVariable(required=true label='Product ID')
        public Id productId;
        
        @InvocableVariable(required=true label='Brand')
        public String brand;
        
        @InvocableVariable(required=true label='Model Number')
        public String modelNumber;
    }
}
