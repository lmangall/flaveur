# Cosmetic Substances Seed Data

Seeded via `scripts/seed-cosmetic-substances.ts` — 140 cosmetic ingredients across 20 categories covering skincare, haircare, color cosmetics, sun care, and lip/stick products.

## Summary

| Category | Count | Domain |
|----------|-------|--------|
| Emulsifiers | 11 | cosmetic |
| Oils & Butters | 14 | cosmetic |
| Waxes & Structure | 6 | cosmetic |
| Humectants | 8 | cosmetic/both |
| Silicones | 4 | cosmetic |
| Thickeners | 5 | cosmetic/both |
| Preservatives | 6 | cosmetic/both |
| Surfactants | 6 | cosmetic |
| Actives | 10 | cosmetic |
| pH Adjusters | 4 | cosmetic/both |
| Chelating Agents | 2 | cosmetic |
| Solvents & Base | 3 | both |
| Colorants & Pigments | 12 | cosmetic |
| Powder Fillers & Binders | 10 | cosmetic |
| Lip & Stick Ingredients | 9 | cosmetic |
| Film Formers & Fixatives | 5 | cosmetic |
| UV Filters | 9 | cosmetic |
| Emollients & Esters | 6 | cosmetic |
| Oil-Phase Rheology Modifiers | 3 | cosmetic |
| Sensory Modifiers | 5 | cosmetic |
| **Total** | **138** | |

**New in v2:** 59 additional substances for color cosmetics, powder products, lip/stick formulations, sun care, and sensory optimization.

9 substances already existed in the DB (from flavor/fragrance data) and were updated with cosmetic fields + domain set to `both`.

---

## Emulsifiers (11)

| Common Name | INCI | CAS | HLB | Solubility | Notes |
|-------------|------|-----|-----|------------|-------|
| Polysorbate 20 | POLYSORBATE 20 | 9005-64-5 | 16.7 | soluble | O/W emulsifier, solubilizer for essential oils |
| Polysorbate 60 | POLYSORBATE 60 | 9005-67-8 | 14.9 | soluble | O/W emulsifier for creams and lotions |
| Polysorbate 80 | POLYSORBATE 80 | 9005-65-6 | 15.0 | soluble | Versatile O/W emulsifier, pairs with Span 80 |
| Sorbitan Oleate | SORBITAN OLEATE | 1338-43-8 | 4.3 | insoluble | W/O emulsifier (Span 80) |
| Sorbitan Stearate | SORBITAN STEARATE | 1338-41-6 | 4.7 | insoluble | W/O emulsifier (Span 60) |
| Glyceryl Stearate | GLYCERYL STEARATE | 31566-31-1 | 3.8 | insoluble | Mild W/O emulsifier + co-emulsifier |
| Glyceryl Stearate SE | GLYCERYL STEARATE SE | 11099-07-3 | 5.8 | insoluble | Self-emulsifying version |
| Cetearyl Alcohol + Ceteareth-20 | CETEARYL ALCOHOL (AND) CETEARETH-20 | — | 15.2 | insoluble | Complete emulsifying wax for O/W |
| Olivem 1000 | CETEARYL OLIVATE (AND) SORBITAN OLIVATE | — | 10.0 | insoluble | Olive-derived, liquid crystal structures |
| PEG-40 Hydrogenated Castor Oil | PEG-40 HYDROGENATED CASTOR OIL | 61788-85-0 | 15.0 | soluble | Solubilizer for fragrances/EOs |
| Lecithin | LECITHIN | 8002-43-5 | 7.0 | dispersible | Natural phospholipid, liposome former |

---

## Oils & Butters (14)

| Common Name | INCI | CAS | HLB Required | Notes |
|-------------|------|-----|-------------|-------|
| Sweet Almond Oil | PRUNUS AMYGDALUS DULCIS OIL | 8007-69-0 | 7.0 | Light carrier oil, all skin types |
| Jojoba Oil | SIMMONDSIA CHINENSIS SEED OIL | 61789-91-1 | 6.0 | Liquid wax ester mimicking sebum, non-comedogenic |
| Argan Oil | ARGANIA SPINOSA KERNEL OIL | 223747-87-1 | 7.0 | Rich in vitamin E, premium oil |
| Coconut Oil | COCOS NUCIFERA OIL | 8001-31-8 | 8.0 | Solid <25°C, lauric acid, can be comedogenic |
| Shea Butter | BUTYROSPERMUM PARKII BUTTER | 194043-92-0 | 8.0 | Rich butter, high unsaponifiables |
| Cocoa Butter | THEOBROMA CACAO SEED BUTTER | 8002-31-1 | 6.0 | Hard butter, melts ~34°C, structure agent |
| Avocado Oil | PERSEA GRATISSIMA OIL | 8024-32-6 | 7.0 | Rich in oleic acid + phytosterols |
| Rosehip Seed Oil | ROSA CANINA SEED OIL | 84603-93-0 | 7.0 | High linoleic acid, anti-aging |
| Castor Oil | RICINUS COMMUNIS SEED OIL | 8001-79-4 | 14.0 | Very viscous, ricinoleic acid |
| Sunflower Seed Oil | HELIANTHUS ANNUUS SEED OIL | 8001-21-6 | 7.0 | Light, affordable, high linoleic |
| Caprylic/Capric Triglyceride | CAPRYLIC/CAPRIC TRIGLYCERIDE | 65381-09-1 | 5.0 | Fractionated coconut, non-greasy |
| Squalane | SQUALANE | 111-01-3 | 5.0 | Skin-identical lipid, ultra-light |
| Isopropyl Myristate | ISOPROPYL MYRISTATE | 110-27-0 | 4.0 | Fast-absorbing synthetic ester |
| Mineral Oil | PARAFFINUM LIQUIDUM | 8012-95-1 | 10.5 | Excellent occlusive, inert |

---

## Waxes & Structure Agents (6)

| Common Name | INCI | CAS | HLB Required | Notes |
|-------------|------|-----|-------------|-------|
| Beeswax | CERA ALBA | 8012-89-3 | 9.0 | MP 62-65°C, structure + water resistance |
| Cetyl Alcohol | CETYL ALCOHOL | 36653-82-4 | 13.0 | Fatty alcohol thickener + co-emulsifier |
| Cetearyl Alcohol | CETEARYL ALCOHOL | 67762-27-0 | 13.0 | Blend of C16/C18 fatty alcohols |
| Stearic Acid | STEARIC ACID | 57-11-4 | 15.0 | Thickener, hardener, forms soap with alkali |
| Candelilla Wax | EUPHORBIA CERIFERA WAX | 8006-44-8 | 9.0 | Vegan, MP 68-73°C, glossy |
| Carnauba Wax | COPERNICIA CERIFERA WAX | 8015-86-9 | 9.0 | Hardest natural wax, MP 82-86°C |

---

## Humectants (8)

| Common Name | INCI | CAS | pH Range | Solubility | Notes |
|-------------|------|-----|----------|------------|-------|
| Glycerin | GLYCERIN | 56-81-5 | 4.0-8.0 | soluble | Most common humectant, 2-10% |
| Sodium Hyaluronate | SODIUM HYALURONATE | 9067-32-7 | 5.0-7.5 | soluble | Holds 1000x weight in water, 0.1-2% |
| Panthenol | PANTHENOL | 81-13-0 | 4.0-7.0 | soluble | Pro-vitamin B5, 1-5% |
| Propylene Glycol | PROPYLENE GLYCOL | 57-55-6 | 4.0-8.0 | soluble | Humectant + penetration enhancer |
| Butylene Glycol | BUTYLENE GLYCOL | 107-88-0 | 4.0-8.0 | soluble | Lighter than PG, less irritating |
| Urea | UREA | 57-13-6 | 4.0-7.0 | soluble | 5-10% moisturizing, 20-40% exfoliating |
| Sodium PCA | SODIUM PCA | 28874-51-3 | 4.5-6.5 | soluble | Part of skin's NMF, 2-5% |
| Aloe Vera Gel | ALOE BARBADENSIS LEAF JUICE | 85507-69-3 | 4.0-6.0 | soluble | Soothing, can replace part of water phase |

---

## Silicones (4)

| Common Name | INCI | CAS | Notes |
|-------------|------|-----|-------|
| Dimethicone | DIMETHICONE | 9006-65-9 | Most common silicone, non-greasy film |
| Cyclomethicone | CYCLOPENTASILOXANE | 541-02-6 | Volatile, evaporates leaving silky feel |
| Dimethicone Crosspolymer | DIMETHICONE/VINYL DIMETHICONE CROSSPOLYMER | 68083-19-2 | Elastomer gel, velvety primer feel |
| Cetyl Dimethicone | CETYL DIMETHICONE | 17955-88-3 | Waxy silicone W/O emulsifier, HLB 2.0 |

---

## Thickeners (5)

| Common Name | INCI | CAS | pH Range | Solubility | Notes |
|-------------|------|-----|----------|------------|-------|
| Carbomer 940 | CARBOMER | 9003-01-4 | 5.0-10.0 | dispersible | Must neutralize with NaOH/TEA, 0.1-0.5% |
| Xanthan Gum | XANTHAN GUM | 11138-66-2 | 3.0-12.0 | soluble | Natural, stable across wide pH, 0.1-1% |
| Hydroxyethylcellulose | HYDROXYETHYLCELLULOSE | 9004-62-0 | 2.0-12.0 | soluble | Nonionic, clear gels, 0.5-2% |
| Guar Gum | CYAMOPSIS TETRAGONOLOBA GUM | 9000-30-0 | 4.0-10.0 | soluble | Natural, hair conditioning, 0.1-1% |
| Sodium Polyacrylate | SODIUM POLYACRYLATE | 9003-04-7 | 5.0-8.0 | dispersible | Pre-neutralized, no pH adjust needed |

---

## Preservatives (6)

| Common Name | INCI | CAS | pH Range | Max % (EU) | Notes |
|-------------|------|-----|----------|-----------|-------|
| Phenoxyethanol | PHENOXYETHANOL | 122-99-6 | 3.0-10.0 | 1% | Broad-spectrum, gram-negative |
| Sodium Benzoate | SODIUM BENZOATE | 532-32-1 | 2.0-5.0 | 2.5% | Effective below pH 5 |
| Potassium Sorbate | POTASSIUM SORBATE | 24634-61-5 | 2.0-5.5 | 0.6% | Anti-yeast/mold, pair with Na benzoate |
| Benzisothiazolinone | BENZISOTHIAZOLINONE | 2634-33-5 | 3.0-9.0 | 0.01-0.05% | Booster, pairs with phenoxyethanol |
| DHA + Benzyl Alcohol | DEHYDROACETIC ACID (AND) BENZYL ALCOHOL | — | 3.0-6.5 | 0.5-1% | Popular in natural cosmetics |
| Tocopherol | TOCOPHEROL | 59-02-9 | — | 0.05-0.5% | Vitamin E antioxidant (not a preservative) |

---

## Surfactants (6)

| Common Name | INCI | CAS | Type | pH Range | Notes |
|-------------|------|-----|------|----------|-------|
| Sodium Laureth Sulfate | SODIUM LAURETH SULFATE | 9004-82-4 | Anionic | 5.0-8.0 | Strong foam, 5-15% in shampoos |
| Cocamidopropyl Betaine | COCAMIDOPROPYL BETAINE | 61789-40-0 | Amphoteric | 4.0-9.0 | Reduces irritation, boosts foam, 2-8% |
| Decyl Glucoside | DECYL GLUCOSIDE | 68515-73-1 | Nonionic | 4.0-9.0 | Mild APG, baby-safe |
| Coco Glucoside | COCO-GLUCOSIDE | 110615-47-9 | Nonionic | 4.0-9.0 | Very gentle APG, 4-15% |
| Sodium Cocoyl Isethionate | SODIUM COCOYL ISETHIONATE | 61789-32-0 | Anionic | 5.0-7.0 | Ultra-mild "baby dove" surfactant |
| Sodium Lauroyl Sarcosinate | SODIUM LAUROYL SARCOSINATE | 137-16-6 | Anionic | 5.0-8.0 | Amino acid-based, 2-10% |

---

## Actives (10)

| Common Name | INCI | CAS | pH Range | Solubility | Use % | Notes |
|-------------|------|-----|----------|------------|-------|-------|
| Niacinamide | NIACINAMIDE | 98-92-0 | 5.0-7.0 | soluble | 2-10% | Vitamin B3, pores + barrier |
| Ascorbic Acid | ASCORBIC ACID | 50-81-7 | 2.5-3.5 | soluble | 5-20% | Pure Vitamin C, very unstable |
| Retinol | RETINOL | 68-26-8 | 5.0-6.5 | insoluble | 0.1-1% | Vitamin A, light/air sensitive |
| Salicylic Acid | SALICYLIC ACID | 69-72-7 | 3.0-4.0 | partially | max 2% | BHA, oil-soluble, anti-acne |
| Glycolic Acid | GLYCOLIC ACID | 79-14-1 | 3.0-4.5 | soluble | 5-10% | Smallest AHA |
| Lactic Acid | LACTIC ACID | 50-21-5 | 3.0-5.0 | soluble | 5-10% | Gentle AHA + humectant |
| Allantoin | ALLANTOIN | 97-59-6 | 4.0-7.0 | partially | 0.1-2% | Soothing, wound healing |
| Caffeine | CAFFEINE | 58-08-2 | 4.0-7.0 | soluble | 1-5% | Vasoconstrictor, eye creams |
| Alpha-Arbutin | ALPHA-ARBUTIN | 84380-01-8 | 3.5-6.5 | soluble | 0.5-2% | Skin brightening |
| Azelaic Acid | AZELAIC ACID | 123-99-9 | 4.0-5.0 | partially | 10-20% | Anti-acne, anti-rosacea |

---

## pH Adjusters (4)

| Common Name | INCI | CAS | Direction | Notes |
|-------------|------|-----|-----------|-------|
| Citric Acid | CITRIC ACID | 77-92-9 | Lower pH | Also chelating agent, use as 10-50% solution |
| Sodium Hydroxide | SODIUM HYDROXIDE | 1310-73-2 | Raise pH | Neutralizes carbomers, use as 10-20% solution |
| Triethanolamine | TRIETHANOLAMINE | 102-71-6 | Raise pH | Alternative to NaOH, softer gels, max 2.5% EU |
| Sodium Lactate | SODIUM LACTATE | 72-17-3 | Buffer | Part of NMF, humectant + pH buffer, 1-3% |

---

## Chelating Agents (2)

| Common Name | INCI | CAS | Notes |
|-------------|------|-----|-------|
| Disodium EDTA | DISODIUM EDTA | 139-33-3 | Chelates metal ions, protects preservatives, 0.05-0.2% |
| Sodium Phytate | SODIUM PHYTATE | 14306-25-3 | Natural EDTA alternative, rice-derived, 0.05-0.2% |

---

## Solvents & Base (3)

| Common Name | INCI | CAS | Notes |
|-------------|------|-----|-------|
| Water | AQUA | 7732-18-5 | Use distilled or deionized |
| Ethanol | ALCOHOL DENAT. | 64-17-5 | Solvent, astringent, can be drying |
| Witch Hazel Extract | HAMAMELIS VIRGINIANA LEAF EXTRACT | 68916-73-4 | Natural astringent, can replace part of water phase |

---

## Colorants & Pigments (12)

| Common Name | INCI | CAS / CI | Solubility | Use % | Notes |
|-------------|------|----------|------------|-------|-------|
| Iron Oxide Yellow | IRON OXIDES | 51274-00-1 (CI 77492) | insoluble | 1-10% | Warm yellow pigment, foundation/concealer base |
| Iron Oxide Red | IRON OXIDES | 1309-37-1 (CI 77491) | insoluble | 0.5-5% | Red-brown pigment, foundation/blush/lipstick |
| Iron Oxide Black | IRON OXIDES | 1317-61-9 (CI 77499) | insoluble | 0.1-3% | Black pigment, eyeliner/mascara/shade adjustment |
| Titanium Dioxide | TITANIUM DIOXIDE | 13463-67-7 (CI 77891) | insoluble | 2-25% | White pigment + UV filter, opacity in foundations |
| Zinc Oxide | ZINC OXIDE | 1314-13-2 (CI 77947) | insoluble | 2-25% | White pigment + UV filter + mattifying, calming |
| Mica | MICA | 12001-26-2 (CI 77019) | insoluble | 5-40% | Pearlescent base, slip agent, shimmer in eyeshadow/highlighter |
| Ultramarine Blue | ULTRAMARINES | 57455-37-5 (CI 77007) | insoluble | 0.5-5% | Vivid blue, eyeshadow, color correctors |
| Ultramarine Violet | ULTRAMARINES | 12769-96-9 (CI 77007) | insoluble | 0.5-5% | Purple shade, eyeshadow, blush toning |
| Chromium Oxide Green | CHROMIUM OXIDE GREENS | 1308-38-9 (CI 77288) | insoluble | 0.5-5% | Stable matte green, eyeshadow |
| Carmine | CARMINE | 1390-65-4 (CI 75470) | partially | 0.5-5% | Natural red from cochineal, lipstick staple |
| D&C Red No. 7 Ca Lake | D&C RED NO. 7 CALCIUM LAKE | 5281-04-9 (CI 15850:1) | insoluble | 0.5-3% | Lip-safe red lake pigment |
| FD&C Yellow No. 5 Al Lake | FD&C YELLOW NO. 5 ALUMINUM LAKE | 12225-21-7 (CI 19140:1) | insoluble | 0.5-3% | Yellow lake for color cosmetics |

---

## Powder Fillers & Binders (10)

| Common Name | INCI | CAS | Solubility | Use % | Notes |
|-------------|------|-----|------------|-------|-------|
| Talc | TALC | 14807-96-6 | insoluble | 10-80% | Classic filler, slip agent, bulk in pressed powders |
| Kaolin | KAOLIN | 1332-58-7 | insoluble | 5-30% | Oil-absorbing clay, mattifying, binder for pressed powders |
| Silica (Amorphous) | SILICA | 7631-86-9 | insoluble | 1-10% | Mattifying microspheres, oil absorption, soft-focus |
| Magnesium Stearate | MAGNESIUM STEARATE | 557-04-0 | insoluble | 1-5% | Binder/lubricant for pressed powders, adhesion |
| Zinc Stearate | ZINC STEARATE | 557-05-1 | insoluble | 1-10% | Adhesion promoter, skin-feel modifier, compressibility |
| Calcium Carbonate | CALCIUM CARBONATE | 471-34-1 | insoluble | 5-30% | Cheap filler, mild abrasive, opacity |
| Nylon-12 | NYLON-12 | 24937-16-4 | insoluble | 2-15% | Spherical powder, silky texture, blur/soft-focus effect |
| Boron Nitride | BORON NITRIDE | 10043-11-5 | insoluble | 2-10% | Ultra-luxe slip agent, soft focus, satin finish |
| Rice Starch | ORYZA SATIVA STARCH | 9005-25-8 | insoluble | 5-20% | Natural oil absorber, mattifying, dry shampoo |
| Sericite | SERICITE | 12001-26-2 | insoluble | 5-30% | Fine-grade mica, superior adhesion in foundations |

---

## Lip & Stick Specific Ingredients (9)

| Common Name | INCI | CAS | Solubility | Use % | Notes |
|-------------|------|-----|------------|-------|-------|
| Ozokerite | OZOKERITE | 12198-93-5 | insoluble | 5-15% | Mineral wax, key lipstick structure agent, MP 58-70°C |
| Microcrystalline Wax | CERA MICROCRISTALLINA | 63231-60-7 | insoluble | 5-20% | Flexible structure, prevents sweating/blooming in sticks |
| Ceresin | CERESIN | 8001-75-0 | insoluble | 5-15% | Purified ozokerite, smooth stick structure |
| Lanolin | LANOLIN | 8006-54-0 | insoluble | 2-15% | Skin-identical lipid, superb lip emollient, occlusive |
| Polybutene | POLYBUTENE | 9003-29-6 | insoluble | 5-30% | Glossy viscosity builder in lip glosses |
| Hydrogenated Polyisobutene | HYDROGENATED POLYISOBUTENE | 68937-10-0 | insoluble | 5-25% | Non-tacky gloss agent, occlusive film |
| Diisostearyl Malate | DIISOSTEARYL MALATE | 70969-70-9 | insoluble | 5-25% | Long-wear pigment binder in lipstick |
| Octyldodecanol | OCTYLDODECANOL | 5333-42-6 | insoluble | 5-20% | Emollient + excellent pigment dispersant |
| Bis-Diglyceryl Polyacyladipate-2 | BIS-DIGLYCERYL POLYACYLADIPATE-2 | 126928-07-2 | insoluble | 10-40% | Glossy, non-sticky emollient for lip oils |

---

## Film Formers & Fixatives (5)

| Common Name | INCI | CAS | Solubility | Use % | Notes |
|-------------|------|-----|------------|-------|-------|
| VP/VA Copolymer | VP/VA COPOLYMER | 25086-89-9 | soluble | 2-10% | Hair fixative, styling hold, film former |
| PVP | PVP | 9003-39-8 | soluble | 1-5% | Film former, hair styling, adhesion |
| Acrylates Copolymer | ACRYLATES COPOLYMER | 25133-97-5 | dispersible | 2-10% | Waterproof film, mascara, sunscreen, long-wear |
| Acrylates/Octylacrylamide Copolymer | ACRYLATES/OCTYLACRYLAMIDE COPOLYMER | 65033-31-6 | insoluble | 1-5% | Water-resistant film for mascara, sun care |
| Shellac | SHELLAC | 9000-59-3 | insoluble | 2-10% | Natural resin film former, mascara, nail |

---

## UV Filters (9)

| Common Name | INCI | CAS | Solubility | Use % (max) | UVA/UVB | Notes |
|-------------|------|-----|------------|-------------|---------|-------|
| Zinc Oxide (nano) | ZINC OXIDE | 1314-13-2 | insoluble | 25% | Broad | Mineral filter, also pigment, reef-safer |
| Titanium Dioxide (nano) | TITANIUM DIOXIDE | 13463-67-7 | insoluble | 25% | UVB + UVA2 | Mineral filter, white cast concern |
| Avobenzone | BUTYL METHOXYDIBENZOYLMETHANE | 70356-09-1 | insoluble | 3% (EU) / 3% (US) | UVA1 | Key UVA filter, photo-unstable alone |
| Homosalate | HOMOSALATE | 118-56-9 | insoluble | 10% (EU) / 15% (US) | UVB | Common UVB filter, solvent properties |
| Octinoxate | ETHYLHEXYL METHOXYCINNAMATE | 5466-77-3 | insoluble | 10% (EU) / 7.5% (US) | UVB | Widely used UVB filter, eco concerns |
| Octocrylene | OCTOCRYLENE | 6197-30-4 | insoluble | 10% (EU/US) | UVB | Photostabilizes avobenzone, film former |
| Tinosorb S | BIS-ETHYLHEXYLOXYPHENOL METHOXYPHENYL TRIAZINE | 187393-00-6 | insoluble | 10% (EU) | Broad | Oil-soluble broad-spectrum, photostable |
| Tinosorb M | METHYLENE BIS-BENZOTRIAZOLYL TETRAMETHYLBUTYLPHENOL | 103597-45-1 | dispersible | 10% (EU) | Broad | Particulate UV filter, boosts SPF synergistically |
| Uvinul A Plus | DIETHYLAMINO HYDROXYBENZOYL HEXYL BENZOATE | 302776-68-7 | insoluble | 10% (EU) | UVA | Photostable UVA filter, oil-soluble |

---

## Emollients & Esters (6)

| Common Name | INCI | CAS | HLB Required | Solubility | Notes |
|-------------|------|-----|-------------|------------|-------|
| Cetyl Ethylhexanoate | CETYL ETHYLHEXANOATE | 59130-69-7 | 5.0 | insoluble | Lightweight dry-touch ester, fast absorption |
| Coco-Caprylate | COCO-CAPRYLATE | 95912-87-1 | 5.0 | insoluble | Natural-derived, dry non-greasy feel |
| Dicaprylyl Carbonate | DICAPRYLYL CARBONATE | 1680-31-5 | 5.0 | insoluble | Ultra-light, volatile-feeling, spreadability |
| Ethylhexyl Palmitate | ETHYLHEXYL PALMITATE | 29806-73-3 | 5.0 | insoluble | Spreading agent, pigment dispersant in makeup |
| C12-15 Alkyl Benzoate | C12-15 ALKYL BENZOATE | 68411-27-8 | 5.0 | insoluble | SPF booster, emollient, good pigment wetter |
| Isododecane | ISODODECANE | 31807-55-3 | — | insoluble | Volatile emollient, dry quick-evap feel, foundation/mascara carrier |

---

## Oil-Phase Rheology Modifiers (3)

| Common Name | INCI | CAS | Solubility | Use % | Notes |
|-------------|------|-----|------------|-------|-------|
| Stearalkonium Hectorite | STEARALKONIUM HECTORITE | 12691-60-0 | insoluble | 1-4% | Organoclay, thickens/gels oils, suspends pigments (Bentone Gel) |
| Silica Silylate | SILICA SILYLATE | 68909-20-6 | insoluble | 1-5% | Thickens oils into gel texture, stabilizes emulsions |
| Disteardimonium Hectorite | DISTEARDIMONIUM HECTORITE | 68153-33-9 | insoluble | 1-4% | Organoclay for anhydrous systems, lipstick/mascara structure |

---

## Sensory Modifiers (5)

| Common Name | INCI | CAS | Solubility | Use % | Notes |
|-------------|------|-----|------------|-------|-------|
| Polymethylsilsesquioxane | POLYMETHYLSILSESQUIOXANE | 68554-70-1 | insoluble | 2-10% | Silicone microspheres, soft-focus blur, velvety feel |
| Lauroyl Lysine | LAUROYL LYSINE | 52315-75-0 | insoluble | 2-15% | Amino acid powder, skin adhesion, silky slip in powders |
| Ethylhexyl Hydroxystearate | ETHYLHEXYL HYDROXYSTEARATE | 29710-25-6 | insoluble | 5-20% | Cushiony feel in lip products, pigment wetter |
| Trimethylsiloxysilicate | TRIMETHYLSILOXYSILICATE | 56275-01-5 | insoluble | 2-10% | Silicone resin, long-wear adhesion, transfer resistance |
| Calcium Aluminum Borosilicate | CALCIUM ALUMINUM BOROSILICATE | 65997-17-3 | insoluble | 1-15% | Glass flake base for shimmer/glitter effects |

---

## Data Fields Per Substance

Each substance was seeded with:
- `common_name` — display name
- `inci_name` — INCI nomenclature (industry standard identifier)
- `cas_id` — CAS registry number (null for blends)
- `ci_number` — Colour Index number for pigments/colorants (e.g., CI 77491)
- `molecular_weight` — where known
- `cosmetic_role` — JSONB array of role strings (e.g., `["emulsifier", "structure"]`, `["colorant", "uv_filter"]`)
- `hlb_value` — HLB number for emulsifiers
- `hlb_required` — required HLB for oils/waxes
- `ph_range_min` / `ph_range_max` — operating pH window
- `water_solubility` — `soluble` | `insoluble` | `partially` | `dispersible`
- `use_level_min` / `use_level_max` — typical usage percentage range
- `uv_coverage` — for UV filters: `UVA`, `UVB`, `UVA1`, `UVA2`, `broad` (null for non-filters)
- `melting_point` — melting point in °C (useful for waxes, stick formulations)
- `domain` — `cosmetic` or `both`
- `description` — usage guidelines including typical percentages

## Script Usage

```bash
# Insert all substances
npx tsx scripts/seed-cosmetic-substances.ts

# Preview without inserting
npx tsx scripts/seed-cosmetic-substances.ts --dry-run

# Delete cosmetic-only substances and re-insert
npx tsx scripts/seed-cosmetic-substances.ts --clean
```

The script checks for existing substances by CAS number and INCI name before inserting. Existing substances get updated with cosmetic fields and domain set to `both`.
