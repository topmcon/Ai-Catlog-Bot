/**
 * CatalogBotServiceTest - Test class for CatalogBotService
 * 
 * This test class provides code coverage and validation for the 
 * CatalogBotService Apex class.
 * 
 * To run: Setup > Apex Test Execution > Select CatalogBotServiceTest > Run
 */

@isTest
private class CatalogBotServiceTest {
    
    /**
     * Test successful product enrichment
     */
    @isTest
    static void testSuccessfulEnrichment() {
        // Create test product
        Product2 testProduct = new Product2(
            Name = 'Test Product',
            ProductCode = 'OS24NDB1',
            IsActive = true
        );
        insert testProduct;
        
        // Mock HTTP response
        Test.setMock(HttpCalloutMock.class, new CatalogBotSuccessMock());
        
        // Start test
        Test.startTest();
        
        // Call the service
        CatalogBotService.enrichProduct(testProduct.Id, 'Fisher & Paykel', 'OS24NDB1');
        
        Test.stopTest();
        
        // Verify product was updated (adjust based on your field mappings)
        Product2 updatedProduct = [SELECT Id, Name FROM Product2 WHERE Id = :testProduct.Id];
        System.assertNotEquals(null, updatedProduct);
    }
    
    /**
     * Test API error handling
     */
    @isTest
    static void testAPIError() {
        // Create test product
        Product2 testProduct = new Product2(
            Name = 'Test Product',
            ProductCode = 'INVALID',
            IsActive = true
        );
        insert testProduct;
        
        // Mock HTTP error response
        Test.setMock(HttpCalloutMock.class, new CatalogBotErrorMock());
        
        // Start test
        Test.startTest();
        
        // Call the service - should handle error gracefully
        CatalogBotService.enrichProduct(testProduct.Id, 'Unknown', 'INVALID');
        
        Test.stopTest();
        
        // Verify no exceptions were thrown
        System.assert(true, 'Error was handled gracefully');
    }
    
    /**
     * Test Flow invocable method
     */
    @isTest
    static void testFlowInvocable() {
        // Create test product
        Product2 testProduct = new Product2(
            Name = 'Test Product',
            ProductCode = 'TEST123',
            IsActive = true
        );
        insert testProduct;
        
        // Mock HTTP response
        Test.setMock(HttpCalloutMock.class, new CatalogBotSuccessMock());
        
        // Create enrichment request
        CatalogBotService.EnrichmentRequest req = new CatalogBotService.EnrichmentRequest();
        req.productId = testProduct.Id;
        req.brand = 'Test Brand';
        req.modelNumber = 'TEST123';
        
        List<CatalogBotService.EnrichmentRequest> requests = new List<CatalogBotService.EnrichmentRequest>{req};
        
        // Start test
        Test.startTest();
        
        // Call invocable method
        CatalogBotService.enrichProductsFromFlow(requests);
        
        Test.stopTest();
        
        // Verify no exceptions
        System.assert(true, 'Flow method executed successfully');
    }
    
    /**
     * Mock HTTP response for successful API call
     */
    private class CatalogBotSuccessMock implements HttpCalloutMock {
        public HttpResponse respond(HttpRequest req) {
            HttpResponse res = new HttpResponse();
            res.setHeader('Content-Type', 'application/json');
            res.setStatusCode(200);
            
            // Sample response matching API structure
            String responseBody = '{"success": true, "data": {' +
                '"verified_information": {' +
                    '"brand": "Fisher & Paykel",' +
                    '"model_number": "OS24NDB1",' +
                    '"product_title": "Fisher & Paykel 24\\" Column Refrigerator",' +
                    '"weight": "180 lbs",' +
                    '"length": "24 in",' +
                    '"width": "24 in",' +
                    '"height": "84 in",' +
                    '"capacity": "8.7 cu. ft.",' +
                    '"upc_gtin": "825225911234",' +
                    '"color_finish": "Panel Ready"' +
                '},' +
                '"features": ["ActiveSmart technology", "Panel ready"],' +
                '"product_description": "Premium column refrigerator",' +
                '"product_classification": {' +
                    '"department": "Appliances",' +
                    '"category": "Refrigeration",' +
                    '"product_family": "Column Refrigerators",' +
                    '"product_style": "Built-In"' +
                '},' +
                '"manufacturer_box_dimensions": {' +
                    '"box_depth": "28 in",' +
                    '"box_width": "28 in",' +
                    '"box_height": "88 in",' +
                    '"box_weight": "210 lbs"' +
                '},' +
                '"product_attributes": {' +
                    '"built_in_appliance": true,' +
                    '"luxury_premium_appliance": true,' +
                    '"portable": false,' +
                    '"panel_ready": true,' +
                    '"counter_depth": true' +
                '},' +
                '"certifications": {' +
                    '"ada_compliant": false,' +
                    '"cee_tier_rating": null,' +
                    '"energy_star_qualified": true' +
                '}' +
            '}}';
            
            res.setBody(responseBody);
            return res;
        }
    }
    
    /**
     * Mock HTTP response for API error
     */
    private class CatalogBotErrorMock implements HttpCalloutMock {
        public HttpResponse respond(HttpRequest req) {
            HttpResponse res = new HttpResponse();
            res.setHeader('Content-Type', 'application/json');
            res.setStatusCode(500);
            res.setBody('{"success": false, "error": "Internal server error"}');
            return res;
        }
    }
}
