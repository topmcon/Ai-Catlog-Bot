# MSRP Validation & Ferguson Prioritization Update
**Date:** November 24, 2025  
**Commit:** 2243cf0

---

## 🎯 Changes Overview

### 1. MSRP Two-Source Validation (All Portals)

**Applied To:**
- ✅ **Catalog Portal** (`/enrich` endpoint in `main.py`)
- ✅ **Parts Portal** (`/enrich-part` endpoint in `parts.py`)
- ✅ **Home Products Portal** (`/enrich-home-product` endpoint in `home_products.py`)

**Validation Rule:**
```
⚠️ CRITICAL MSRP VALIDATION RULE:
- MSRP is ONLY valid if at least 2 independent sources report the SAME price
- If only 1 source has a price, MSRP = null
- If sources show different prices, MSRP = null
- Price must match exactly between sources to be considered valid
```

**Example Scenarios:**

| Scenario | Source 1 | Source 2 | Result | Reason |
|----------|----------|----------|--------|--------|
| ✅ Valid | $249.99 | $249.99 | `$249.99` | 2 sources match |
| ❌ Invalid | $249.99 | - | `null` | Only 1 source |
| ❌ Invalid | $249.99 | $259.99 | `null` | Sources conflict |
| ✅ Valid | $199.00 | $199.00 | `$199.00` | 2+ sources match |

**Why This Matters:**
- Prevents single-source pricing errors
- Ensures price accuracy and reliability
- Protects against outdated or incorrect data
- Improves data quality for customers

---

### 2. Ferguson Prioritization (Home Products Only)

**Applied To:**
- ✅ **Home Products Portal** (`/enrich-home-product` endpoint in `home_products.py`)

**Prioritization Rule:**
```
🔵 PRIORITIZATION RULE - FERGUSON DATA FIRST:
- CHECK fergusonhome.com FIRST as a primary source
- Ferguson is our partner and carries many of our products
- Their data should be prioritized for specifications, pricing, and product details
- Use Ferguson data as the baseline when available, supplement with other sources
```

**Why Ferguson First?**
1. **Partnership:** Ferguson is a business partner
2. **Inventory Match:** They carry many of our products
3. **Data Quality:** Their specifications are typically accurate
4. **Pricing Reference:** Good baseline for MSRP validation

**Important Note:**
- Even Ferguson prices must still pass the 2-source validation
- Ferguson data is prioritized but not blindly accepted
- If Ferguson shows $199 but manufacturer shows $299, MSRP = null (conflicting sources)
- If Ferguson shows $199 and manufacturer shows $199, MSRP = $199 (validated)

---

## 📝 Implementation Details

### Catalog Portal (`main.py`)

**Location:** Line ~870 in `async def _generate_with_provider()`

**Added to AI System Prompt:**
```python
system_prompt = """You are an expert product research assistant...

⚠️ CRITICAL MSRP VALIDATION RULE:
- MSRP is ONLY valid if you find at least 2 independent sources with the SAME price
- If only 1 source has a price, or if sources show different prices, set MSRP to null
- Sources include: manufacturer website, authorized retailers, product spec sheets, etc.
- Price must match exactly between sources to be considered valid

You must return ONLY valid JSON..."""
```

### Parts Portal (`parts.py`)

**Location:** Line ~100 in `PARTS_ENRICHMENT_PROMPT`

**Added to AI Prompt:**
```python
PARTS_ENRICHMENT_PROMPT = """You are an appliance parts data enrichment specialist...

⚠️ CRITICAL MSRP VALIDATION RULE:
- MSRP/Price is ONLY valid if you find at least 2 independent sources with the SAME price
- If only 1 source has a price, or if sources show different prices, set price to null
- Sources include: OEM websites, authorized parts distributors, repair manuals, etc.
- Price must match exactly between sources to be considered valid

Part Number: {part_number}..."""
```

### Home Products Portal (`home_products.py`)

**Location:** Line ~262 in `HOME_PRODUCTS_ENRICHMENT_PROMPT`

**Added to AI Prompt:**
```python
HOME_PRODUCTS_ENRICHMENT_PROMPT = """You are a product data enrichment specialist...

🔵 PRIORITIZATION RULE - FERGUSON DATA FIRST:
- When researching products, CHECK fergusonhome.com FIRST as a primary source
- Ferguson is our partner and carries many of our products
- Their data should be prioritized for specifications, pricing, and product details
- Use Ferguson data as the baseline when available, supplement with other sources

⚠️ CRITICAL MSRP VALIDATION RULE:
- MSRP is ONLY valid if you find at least 2 independent sources with the SAME price
- If only 1 source has a price (including Ferguson), set msrp_price to null
- Sources include: manufacturer website, fergusonhome.com, authorized retailers, spec sheets
- Price must match exactly between sources to be considered valid
- Note in detailed_description if pricing could not be verified

INPUT DATA:..."""
```

---

## 🧪 Testing Recommendations

### Test Case 1: Valid MSRP (2 Matching Sources)
```bash
curl -X POST https://ai-catlog-bot.onrender.com/enrich \
  -H "X-API-KEY: test123" \
  -H "Content-Type: application/json" \
  -d '{"brand": "Delta", "model_number": "2559-DST"}'
```

**Expected:** MSRP populated if AI finds 2+ matching sources

---

### Test Case 2: No MSRP (Single Source)
```bash
curl -X POST https://ai-catlog-bot.onrender.com/enrich-home-product \
  -H "X-API-KEY: test123" \
  -H "Content-Type: application/json" \
  -d '{"model_number": "RARE-MODEL-123", "brand": "ObscureBrand"}'
```

**Expected:** `msrp_price: null` if only 1 source found

---

### Test Case 3: No MSRP (Conflicting Sources)
```bash
curl -X POST https://ai-catlog-bot.onrender.com/enrich-part \
  -H "X-API-KEY: test123" \
  -H "Content-Type: application/json" \
  -d '{"part_number": "RP50587", "brand": "Delta"}'
```

**Expected:** Price = null if sources show different amounts

---

### Test Case 4: Ferguson Prioritization
```bash
curl -X POST https://ai-catlog-bot.onrender.com/enrich-home-product \
  -H "X-API-KEY: test123" \
  -H "Content-Type: application/json" \
  -d '{"model_number": "7594SRS", "brand": "Moen"}'
```

**Expected:** 
- AI checks fergusonhome.com first
- Uses Ferguson specs as baseline
- Validates Ferguson price against other sources
- Returns enriched data with Ferguson-sourced details

---

## 📊 Impact Analysis

### Data Quality Impact
- **Before:** AI could return unverified single-source prices
- **After:** Only validated 2-source prices returned
- **Result:** Higher confidence in pricing data

### User Experience Impact
- **null prices:** Better than incorrect prices
- **Transparency:** Description notes when price couldn't be verified
- **Trust:** Users know prices are validated

### Ferguson Partnership Impact
- **Prioritization:** Shows commitment to partnership
- **Data Alignment:** Uses their data as primary reference
- **Inventory Sync:** Better matches with Ferguson catalog

---

## 🔄 Backwards Compatibility

**API Response Structure:** ✅ No changes
- Fields remain the same
- Only the validation logic changed
- Existing integrations work unchanged

**Frontend Compatibility:** ✅ No changes required
- UIs already handle null prices
- No UI updates needed

**Database/Storage:** ✅ No changes
- Same data structure
- More null values for unverified prices (expected)

---

## 📈 Next Steps

1. **Monitor MSRP Population Rate:**
   - Track how many products get validated prices
   - Identify products with frequent null prices
   - May indicate need for more data sources

2. **Ferguson Integration Testing:**
   - Test Home Products with known Ferguson inventory
   - Verify Ferguson data is being prioritized
   - Confirm price validation working with Ferguson as source

3. **User Feedback:**
   - Monitor customer inquiries about pricing
   - Track admin panel usage analytics
   - Adjust validation rules if too restrictive

4. **Future Enhancements:**
   - Consider showing "price range" when sources conflict
   - Add "last verified date" to MSRP field
   - Show source count (e.g., "verified by 3 sources")

---

## 🚀 Deployment

**Status:** ✅ Ready for Production

**Files Changed:**
- `main.py` (Catalog Portal)
- `parts.py` (Parts Portal)
- `home_products.py` (Home Products Portal)

**Deployment Steps:**
1. Commit already pushed to main branch
2. Backend will auto-deploy on Render (5-10 minutes)
3. No frontend changes needed
4. Test with API calls after deployment

**Rollback Plan:**
If issues arise, revert commit `2243cf0`:
```bash
git revert 2243cf0
git push
```

---

## 📞 Support

**Questions?**
- Review this document
- Check commit `2243cf0` for exact changes
- Test with sample products in each portal

**Issues?**
- Monitor Usage & Analytics tab in admin panel
- Check request logs for validation patterns
- Review AI response completeness scores

---

**Document Created:** November 24, 2025  
**Last Updated:** November 24, 2025  
**Version:** 1.0
