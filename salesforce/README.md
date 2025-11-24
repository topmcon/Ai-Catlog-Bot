# Salesforce Integration for Catalog-BOT

This directory contains Salesforce Apex code for integrating the Catalog-BOT API with Salesforce.

## Files

- `CatalogBotService.cls` - Main service class for API integration
- `CatalogBotServiceTest.cls` - Test class (85%+ code coverage)

## Installation Steps

### 1. Add Remote Site Setting

Before deploying the code, you must whitelist the API endpoint:

1. Go to **Setup** → **Remote Site Settings**
2. Click **New Remote Site**
3. Enter the following:
   - **Remote Site Name**: `CatalogBotAPI`
   - **Remote Site URL**: `https://api.cxc-ai.com`
   - **Active**: ✓ Checked
4. Click **Save**

### 2. Deploy Apex Classes

#### Option A: Using Salesforce UI
1. Go to **Setup** → **Apex Classes**
2. Click **New**
3. Copy the contents of `CatalogBotService.cls`
4. Click **Save**
5. Repeat for `CatalogBotServiceTest.cls`

#### Option B: Using VS Code + Salesforce Extension
1. Install Salesforce Extension Pack in VS Code
2. Authorize your org: `Ctrl+Shift+P` → "SFDX: Authorize an Org"
3. Right-click on each `.cls` file → "SFDX: Deploy This Source to Org"

### 3. Configure API Settings

Edit `CatalogBotService.cls` and update:

```apex
private static final String API_URL = 'https://api.cxc-ai.com/enrich';
private static final String API_KEY = 'your-actual-api-key';
```

### 4. Map Custom Fields

The service includes field mappings that need to match your Salesforce schema. Update the `updateProductRecord` method to uncomment and modify field API names:

```apex
// Example - adjust to your Product2 custom fields:
product.Brand__c = (String) verifiedInfo.get('brand');
product.Model_Number__c = (String) verifiedInfo.get('model_number');
product.Weight__c = (String) verifiedInfo.get('weight');
// ... etc
```

## Usage

### Option 1: Flow Integration (Recommended)

1. Go to **Setup** → **Flows** → **New Flow**
2. Choose **Record-Triggered Flow**
3. Configure trigger:
   - Object: `Product2`
   - Trigger: `A record is created or updated`
   - Entry Conditions: `Brand__c` and `Model_Number__c` are not null
4. Add **Action**: 
   - Action Type: `Apex Action`
   - Apex Class: `CatalogBotService`
   - Method: `enrichProductsFromFlow`
5. Map inputs:
   - `productId` → `{!$Record.Id}`
   - `brand` → `{!$Record.Brand__c}`
   - `modelNumber` → `{!$Record.Model_Number__c}`
6. **Save** and **Activate**

### Option 2: Apex Trigger

Create a trigger on Product2:

```apex
trigger ProductEnrichmentTrigger on Product2 (after insert, after update) {
    for (Product2 product : Trigger.new) {
        // Only enrich if Brand and Model Number are present
        if (product.Brand__c != null && product.Model_Number__c != null) {
            // Check if this is a new record or Brand/Model changed
            if (Trigger.isInsert || 
                product.Brand__c != Trigger.oldMap.get(product.Id).Brand__c ||
                product.Model_Number__c != Trigger.oldMap.get(product.Id).Model_Number__c) {
                
                CatalogBotService.enrichProduct(
                    product.Id,
                    product.Brand__c,
                    product.Model_Number__c
                );
            }
        }
    }
}
```

### Option 3: Manual/Button Click

Add a custom button to Product2:
1. **Setup** → **Object Manager** → **Product2** → **Buttons, Links, and Actions** → **New Button**
2. Choose **Detail Page Button**
3. Content Source: **Execute JavaScript**
4. Code:
```javascript
{!REQUIRESCRIPT("/soap/ajax/51.0/connection.js")}
{!REQUIRESCRIPT("/soap/ajax/51.0/apex.js")}

var result = sforce.apex.execute(
    "CatalogBotService",
    "enrichProduct",
    {
        productId: "{!Product2.Id}",
        brand: "{!Product2.Brand__c}",
        modelNumber: "{!Product2.Model_Number__c}"
    }
);

alert("Product enrichment started!");
```
5. Add button to Product2 page layout

## Testing

Run the test class to verify installation:

1. **Setup** → **Apex Test Execution**
2. Select **CatalogBotServiceTest**
3. Click **Run**
4. Verify all tests pass with 85%+ coverage

Or use Developer Console:
1. **Developer Console** → **Test** → **New Run**
2. Select **CatalogBotServiceTest**
3. Click **Run**

## Troubleshooting

### "Unauthorized endpoint" error
- Verify Remote Site Setting is configured correctly
- Check the API URL matches exactly

### "Invalid API key" error
- Verify `API_KEY` in `CatalogBotService.cls` matches your `.env` file
- Check for trailing spaces or special characters

### Fields not updating
- Verify field API names in `updateProductRecord` match your org
- Check field-level security and permissions
- Review debug logs: **Setup** → **Debug Logs**

### Timeout errors
- Increase `TIMEOUT` constant (default 30 seconds)
- Check API performance and OpenAI response times
- Consider async processing for batch operations

## Debug Logs

To view API calls and responses:

1. **Setup** → **Debug Logs**
2. Click **New** to create a trace flag for your user
3. Set log levels:
   - **Apex Code**: DEBUG
   - **Callout**: DEBUG
4. Trigger product enrichment
5. View logs to see HTTP request/response details

## Custom Error Logging (Optional)

For production monitoring, create a custom object `Error_Log__c`:

Fields:
- `Product__c` (Lookup to Product2)
- `Error_Message__c` (Long Text Area, 32000)
- `Error_Date__c` (Date/Time)
- `Source__c` (Text, 255)

Then uncomment the error logging code in `CatalogBotService.logError()`.

## Best Practices

1. **Bulk Operations**: The current implementation uses `@future` which is limited to 50 callouts per transaction. For bulk enrichment, consider:
   - Queueable Apex with chaining
   - Batch Apex for large datasets

2. **Rate Limiting**: Add custom logic to prevent API abuse:
```apex
// Check if product was enriched recently
if (product.Last_Enrichment_Date__c != null && 
    product.Last_Enrichment_Date__c > System.now().addHours(-24)) {
    return; // Skip if enriched in last 24 hours
}
```

3. **Retry Logic**: For production, implement retry logic for failed callouts

4. **Monitoring**: Set up Process Builder or Flow to notify admins when enrichment fails

## Support

For issues with the Salesforce integration:
- Check debug logs for detailed error messages
- Verify Remote Site Settings and API credentials
- Review field mappings match your org's schema
- Test with the included test class

For API issues, see the main README.md
