# Substance Database Enhancement Report

**Project:** Oumamie/Flaveur
**Date:** January 2026
**Database:** Neon PostgreSQL

---

## Executive Summary

The substance database was enhanced from a partially populated dataset to a fully enriched flavor ingredient reference. All 454 substances now have complete flavor profiles and odor descriptions, with 256 compounds having full chemical data from PubChem.

---

## Completed Enhancements

### 1. PubChem Chemical Data Enrichment

**Source:** PubChem REST API
**Substances enriched:** 256

| Field | Before | After |
|-------|--------|-------|
| SMILES structures | ~50 | 256 |
| Molecular weight | ~50 | 256 |
| Molecular formula | ~50 | 256 |
| InChI identifiers | ~20 | 256 |
| XLogP values | 0 | 256 |
| Exact mass | 0 | 256 |
| IUPAC names | ~30 | 256 |

**Data quality improvement:** 31% → 45%

### 2. Flavor Profile Descriptions

**Coverage:** 100% (454/454 substances)

Descriptions were generated and verified against authoritative sources:
- The Good Scents Company
- PubChem/NIH compound descriptions
- PubMed Central research literature
- Fenaroli's Handbook of Flavor Ingredients

#### Single Molecule Compounds (256)

Chemical compounds with defined SMILES structures, organized by functional group:

| Category | Count | Examples |
|----------|-------|----------|
| Esters | ~60 | Ethyl butyrate, isoamyl acetate |
| Aldehydes | ~35 | Benzaldehyde, citral, vanillin |
| Alcohols | ~30 | Linalool, menthol, geraniol |
| Ketones | ~25 | Diacetyl, ionones, maltol |
| Terpenes | ~25 | Limonene, pinene, myrcene |
| Acids | ~20 | Citric, acetic, butyric |
| Lactones | ~15 | γ-decalactone, coumarin |
| Pyrazines | ~15 | Methylpyrazine, IBMP |
| Sulfur compounds | ~10 | Thiols, sulfides |
| Phenols | ~10 | Eugenol, thymol |
| Other | ~11 | Salts, sweeteners, amino acids |

#### Natural Extracts & Oils (198)

Complex mixtures without defined SMILES structures:

| Category | Count | Examples |
|----------|-------|----------|
| Essential oils | ~80 | Lavender, peppermint, lemon oil |
| Fruit extracts | ~35 | Strawberry, apple, passion fruit |
| Spice extracts | ~25 | Cinnamon, ginger, cardamom |
| Savory extracts | ~20 | Beef, chicken, yeast extract |
| Botanical extracts | ~20 | Chamomile, jasmine, rose |
| Wood/smoke extracts | ~10 | Hickory, mesquite, oak |
| Other | ~8 | Cocoa, coffee, tea extracts |

---

## Database Schema

Current substance table fields:

```
substance_id        SERIAL PRIMARY KEY
common_name         VARCHAR(255)
cas_id              VARCHAR(50)
smile               TEXT              -- SMILES notation
molecular_formula   VARCHAR(100)
molecular_weight    DECIMAL(10,4)
inchi               TEXT              -- InChI identifier
xlogp               DECIMAL(6,3)      -- Partition coefficient
exact_mass          DECIMAL(12,6)
pubchem_id          INTEGER
iupac_name          TEXT
flavor_profile      TEXT              -- ✓ 100% populated
odor                TEXT              -- ✓ 100% populated
description         TEXT
created_at          TIMESTAMP
updated_at          TIMESTAMP
```

---

## Recommended Future Enhancements

### High Impact

#### 1. Flavor Categories (Tags)
Add structured categorization for filtering and search.

```sql
-- New table
CREATE TABLE flavor_category (
  category_id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,  -- 'fruity', 'floral', 'green', etc.
  description TEXT
);

CREATE TABLE substance_category (
  substance_id INTEGER REFERENCES substance(substance_id),
  category_id INTEGER REFERENCES flavor_category(category_id),
  PRIMARY KEY (substance_id, category_id)
);
```

**Categories to implement:**
- Fruity (citrus, berry, tropical, stone fruit)
- Floral (rose, jasmine, violet, lavender)
- Green (grassy, leafy, herbal)
- Spicy (warm spice, cool spice, pungent)
- Sweet (caramel, honey, vanilla, candy)
- Savory (meaty, brothy, umami)
- Woody (cedar, sandalwood, smoky)
- Earthy (mushroom, mineral, moss)
- Chemical (solvent, medicinal, sulfurous)

#### 2. Natural Sources
Document where compounds occur naturally.

```sql
ALTER TABLE substance ADD COLUMN natural_sources TEXT;
-- Example: "vanilla beans, oak wood, cloves"
```

#### 3. Food Applications
Common usage categories for practical reference.

```sql
ALTER TABLE substance ADD COLUMN applications TEXT[];
-- Example: ['beverages', 'baked goods', 'dairy', 'confectionery']
```

### Medium Impact

#### 4. Usage Levels
Typical concentration ranges in finished products.

```sql
ALTER TABLE substance ADD COLUMN usage_level_ppm_min DECIMAL(10,4);
ALTER TABLE substance ADD COLUMN usage_level_ppm_max DECIMAL(10,4);
```

#### 5. FEMA GRAS Numbers
Industry-standard safety designations.

```sql
ALTER TABLE substance ADD COLUMN fema_number INTEGER;
ALTER TABLE substance ADD COLUMN fema_gras BOOLEAN DEFAULT false;
```

#### 6. Aroma Thresholds
Detection and recognition thresholds in water/air.

```sql
ALTER TABLE substance ADD COLUMN threshold_water_ppb DECIMAL(12,6);
ALTER TABLE substance ADD COLUMN threshold_air_ppb DECIMAL(12,6);
```

### Lower Priority

#### 7. Molecular Structure Images
PubChem provides 2D structure images via:
```
https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/{CID}/PNG
```

#### 8. Related Compounds
Link similar substances or biosynthetic precursors.

```sql
CREATE TABLE substance_relation (
  substance_id INTEGER REFERENCES substance(substance_id),
  related_id INTEGER REFERENCES substance(substance_id),
  relation_type VARCHAR(50),  -- 'similar', 'precursor', 'metabolite'
  PRIMARY KEY (substance_id, related_id)
);
```

#### 9. Functional Group Classification
Auto-parse SMILES to tag chemical classes (aldehyde, ester, terpene, etc.).

---

## Scripts Reference

| Script | Purpose |
|--------|---------|
| `scripts/improve-substances.ts` | Main enrichment pipeline (PubChem) |
| `scripts/list-needs-description.ts` | Query substances missing flavor data |
| `scripts/list-remaining.ts` | Query substances without SMILES |
| `scripts/update-flavor-descriptions.ts` | Batch update single molecules |
| `scripts/update-extract-descriptions.ts` | Batch update natural extracts |
| `scripts/update-final-three.ts` | Final 3 substances patch |

---

## Data Sources

1. **PubChem** (NIH) - Chemical structures, properties, identifiers
2. **The Good Scents Company** - Flavor/odor descriptions, usage
3. **Fenaroli's Handbook** - Industry-standard flavor ingredient reference
4. **PubMed Central** - Research validation for sensory descriptions

---

## Conclusion

The substance database is now production-ready with comprehensive flavor data. The recommended next step is implementing **flavor categories** to enable faceted search and filtering in the application UI.
