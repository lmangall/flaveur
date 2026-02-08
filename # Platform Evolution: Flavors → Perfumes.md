# Platform Evolution: Flavors → Perfumes → Cosmetics

## Current State

Platform currently centered around flavors. Expanding to support perfumes with a database of 1500 molecules.

**Note:** A CSV analysis document will be provided for the new database entries for fragrance.

---

## Phase 1: Perfume Integration

### 1.1 Molecular Database Structure

Essential data per molecule:

**Olfactive Properties:**
- Primary facet (woody, floral, citrus, spicy, etc.)
- Secondary facets (creamy, powdery, green, animalic, etc.)
- Intensity/strength (scale 1-10)
- Diffusion characteristics (poor, moderate, excellent)

**Technical Properties:**
- Volatility class (top/heart/base)
- Evaporation rate (specific hours/days)
- Substantivity (how long it clings to skin/fabric)
- Tenacity score

**Dosage Guidance:**
- Typical usage range (e.g., 0.1-5%)
- Maximum recommended %
- Minimum effective %

**Blending Behavior:**
- Solubility (in ethanol, oils, water)
- Known synergies (works beautifully with X, Y, Z)
- Known conflicts (clashes with, overpowers, muddles)
- Color contribution
- Stability notes (light-sensitive, oxidizes easily, etc.)

**Safety & Regulatory:**
- IFRA restrictions (max % in different product types) - add later
- Allergen status - add later
- Natural vs synthetic
- Cost tier

**Data Structure Note:**
- No separate "perfume/flavor/cosmetic" column needed
- Molecule applicability determined by presence of relevant data:
  - Has olfactive_profile → usable in perfume
  - Has taste_profile → usable in flavor
  - Has skin_compatibility → usable in cosmetic
- Same molecule can appear in multiple contexts

### 1.2 Fragrance Architecture: The Pyramid System

**Top Notes (5-15 minutes)**
- Typical % in formula: 20-30%
- Character: Fresh, bright, immediate impact
- Common families: Citrus, green, aldehydic, light fruits
- Features needed:
  - Filter molecules by volatility
  - Visualize evaporation curve
  - Real-time % distribution warnings

**Heart Notes (30 minutes - 3 hours)**
- Typical % in formula: 40-60%
- Character: The personality, fullness, body
- Common families: Florals, spices, fruits, soft woods
- Features needed:
  - Accord building tools (see 1.3)
  - Balance visualization

**Base Notes (3+ hours)**
- Typical % in formula: 20-30%
- Character: Depth, warmth, sensuality, longevity
- Common families: Musks, woods, resins, vanilla, amber, leather
- Features needed:
  - Fixative property indicators
  - Persistence visualization

**Platform Feature: Visual Pyramid Builder**
- Real-time % distribution across notes
- Evaporation timeline simulation
- Balance warnings (e.g., "too top-heavy, lacks base")
- Interactive pyramid showing composition at different time points

### 1.3 Accords: Nested Composition System

**What is an accord:**
A blend of molecules that creates a unified olfactive impression.

**Classic Accord Examples:**
- **Chypre:** Bergamot + oakmoss + labdanum + patchouli
- **Fougère:** Lavender + coumarin + oakmoss
- **Rose:** Phenylethyl alcohol + geraniol + citronellol + damascones
- **Marine:** Calone + aldehydes + seaweed notes

**Features Needed:**

*Pre-built Accord Library:*
- Classic accords with formulas
- Modern accord templates
- User-created accords (shareable/private)

*Accord Creation Mode:*
- Build mini-compositions that function as single units
- Test accord in isolation before adding to main formula
- Adjust accord strength without changing internal ratios
- Save and reuse accords across projects

*Nested Composition:*
- Accord within accord
- Formula = base accord + modifier accords + individual molecules
- This same concept applies to flavors: a flavor within a flavor

*UI Flow:*
- Create accord as standalone mini-formula
- Save accord to library
- Add accord to main formula as single "ingredient"
- Adjust accord % without touching internal ratios
- Option to "expand" accord to see/edit components

### 1.4 Olfactive Families & Navigation

**Major Families to Implement:**
- **Floral:** Rose, jasmine, tuberose, orange blossom, lily, violet
- **Oriental/Amber:** Vanilla, tonka, benzoin, labdanum, incense
- **Woody:** Sandalwood, cedarwood, vetiver, patchouli, oud
- **Citrus/Hesperidic:** Bergamot, lemon, orange, grapefruit, yuzu
- **Chypre:** Mossy, woody, citrus, sophisticated
- **Fougère:** Lavender, coumarin, aromatic, herbal
- **Gourmand:** Edible, sweet (caramel, chocolate, coffee, honey)
- **Fresh/Aquatic:** Marine, ozonic, watery, clean
- **Green:** Cut grass, leaves, stems, galbanum
- **Leather:** Smoky, tarry, animalic
- **Spicy:** Cinnamon, clove, pepper, cardamom

**Platform Features:**
- Family classification for each molecule (can have multiple tags)
- Filter molecules by family
- Suggest molecules to reinforce chosen family direction
- Alert when formula strays from intended family
- "Family balance" visualization

### 1.5 Concentration Types & Dilution Calculator

**Standard Fragrance Concentrations:**
- **Parfum/Extrait:** 20-40% fragrance oils
- **Eau de Parfum (EdP):** 15-20%
- **Eau de Toilette (EdT):** 5-15%
- **Eau de Cologne (EdC):** 2-5%
- **Body mist/Splash:** 1-3%

**Platform Features:**
- Work in concentrate (100% oils)
- Specify final product type
- Automatic dilution calculation
- Show how formula performs at different concentrations
- Alcohol/solvent selection (ethanol %, water %, other carriers)
- Total volume calculator

### 1.6 Temporal Dynamics: Life of a Fragrance

**Evaporation Simulation:**
- Timeline view showing which notes appear when
- Hour-by-hour scent profile evolution
- Dry-down prediction (what's left after 6+ hours)
- Interactive scrubber to "smell" formula at different times

**Sillage (Scent Trail):**
- How far the fragrance projects
- Which molecules contribute most to sillage
- Suggestions to increase/decrease sillage
- Sillage strength indicator (1-10 scale)

**Projection vs. Intimacy:**
- Loud molecules (high projection) identification
- Skin scents (low projection, close to body)
- Balance recommendations
- Projection curve over time

**Platform Feature: "Wear Simulation"**
- Visual timeline (0-12 hours)
- Click any point to see active molecules at that time
- Intensity curve visualization
- Note transition visualization
- Compare your formula to reference fragrances

### 1.7 Dosage & Balance Tools

**Overdose Warnings:**
- "Iso E Super at 40% is extremely high—typical is 10-20%"
- "You have 3 very strong florals competing—consider reducing"
- Highlight molecules exceeding typical ranges
- Color-coded warnings (yellow = high, red = excessive)

**Balance Analysis:**
- Fresh vs warm ratio
- Light vs heavy balance
- Natural vs synthetic feel
- Character indicators (bright, deep, sharp, smooth)
- Balance score with suggestions

**Validation Rules:**
- Total formula must = 100%
- Individual molecule limits (some work at 0.01%)
- Minimum effective dose warnings
- Synergy suggestions: "Adding 0.5% hedione will lift your florals"

**Smart Suggestions:**
- "Formula lacks fixatives—consider adding base notes"
- "Too linear—needs more complexity in heart"
- "Sharp opening—add 2% sandalwood as smoother"

### 1.8 Molecule Roles & Modifiers

**Beyond Note Classification:**

*Fixatives (make fragrance last):*
- Musks, woods, resins, ambergris notes
- Platform: Tag fixatives, warn if formula lacks them

*Boosters (amplify other notes):*
- Hedione (boosts florals)
- Iso E Super (boosts woods)
- Certain musks (boost overall projection)
- Platform: Suggest boosters for specific note families

*Bridges (smooth transitions):*
- Molecules that connect disparate elements
- Help top notes flow into heart
- Platform: Identify transition gaps, suggest bridges

*Blockers (reduce unwanted aspects):*
- Mask harsh edges
- Reduce metallic or chemical notes
- Platform: Detect harsh combinations, suggest blockers

**Platform Feature:**
- Tag molecules by modifier function (can have multiple roles)
- Context-aware suggestions based on formula analysis
- "Your citrus notes will fade too quickly—add a fixative"

### 1.9 Creative Workflow & Starting Points

**Project Creation Modes:**

*Blank Canvas:*
- Start from scratch
- Free exploration

*Brief-Based:*
- Answer questions: Target audience? Season? Mood?
- Platform suggests starting molecules
- "Fresh summer fragrance for women 25-35"

*Ingredient-Led:*
- "I want to build around this jasmine absolute"
- Platform suggests complementary molecules
- Show classic pairings

*Reference-Based:*
- "Something like Santal 33 but fresher"
- Platform suggests modification approach
- (If you have reference fragrance database)

*Accord-First:*
- Start with pre-built or custom accord
- Expand and modify from there

**Inspiration Tools:**
- Browse by mood (romantic, energetic, mysterious, clean)
- Browse by season (spring florals, summer citrus, winter spices)
- Browse by occasion (office, evening, casual)
- Color associations (what does "blue" smell like?)
- Image upload → suggested scent profile (advanced)

### 1.10 Version Control & Iteration

**Why It's Critical:**
Perfumers never get it right first time. Need to track changes and iterations.

**Features Needed:**

*Version Management:*
- Save formula iterations (v1, v2, v3...)
- Auto-save drafts
- Compare versions side-by-side
- Diff view showing changes
- Revert to previous version

*Change Tracking:*
- "In v3: reduced rose by 5%, added 2% vanilla"
- Change log with timestamps
- Highlight modified molecules
- Show impact of changes on balance/projection/etc.

*Notes & Annotations:*
- Add notes to entire formula or specific molecules
- "Too powdery on skin test"
- "Client loved opening, not dry-down"
- "Needs more freshness"
- Attach actual test results or photos
- Rating system for each version

*Testing Workflow:*
- Mark versions as: Draft / Testing / Final / Archived
- Track physical testing results
- Link versions to actual production batches

### 1.11 Cost Calculation

**Why It Matters:**
Some naturals cost $10,000+/kg while synthetics can be $10/kg.

**Features Needed:**

*Real-Time Cost Display:*
- Cost per kg of concentrate
- Cost per 100ml at different dilutions
- Cost breakdown by ingredient
- % of total cost per ingredient

*Price Tier System:*
- Budget tier
- Mid-range tier
- Luxury tier
- Set target cost, get warnings when exceeded

*Cost Optimization:*
- "Replace 20% of rose absolute with phenylethyl alcohol to cut costs 40%"
- Suggest cheaper alternatives with similar profiles
- Show quality/cost trade-offs
- "Swapping this maintains 85% of character, saves 60% cost"

*Batch Scaling:*
- Calculate costs for different batch sizes
- Minimum order quantities consideration
- Volume discounts

### 1.12 Naturals vs. Synthetics

**Key Distinction:**

*Natural Materials:*
- Batch variation (rose from Bulgaria ≠ rose from Turkey)
- Vintage/harvest year matters
- More complex, often more expensive
- Sustainability concerns
- May have color/stability issues
- Regulatory variations

*Synthetic Molecules:*
- Consistent batch-to-batch
- Often more powerful/efficient
- May be more stable
- Can create scents impossible in nature
- More predictable behavior

**Platform Features:**
- Filter by: All Natural / All Synthetic / Hybrid
- "All-natural" formula mode with stricter constraints
- Sustainability scores (when data available)
- Vegan/cruelty-free indicators
- Origin tracking for naturals
- Certification badges (organic, fair trade, etc.)

*Formula Analysis:*
- Natural/synthetic ratio display
- Impact on marketing claims
- Regulatory implications by region (later)

### 1.13 Collaboration Tools

**Sharing & Permissions:**
- Share formula with team (read-only or editable)
- Public/private/team-only formulas
- Fork formula to create own version
- Attribution tracking

**Commenting System:**
- Comment on specific molecules
- Threaded discussions
- @mentions for team members
- Suggest alternative molecule swaps
- "What if you replaced this with that?"

**Review Workflow:**
- Submit formula for review
- Approval/feedback loop
- Track reviewer comments
- Version comparison in review

### 1.14 Advanced Features (Future)

**AI-Powered Suggestions:**
- "Formulas similar to yours often include..."
- "Users who used these molecules also used..."
- Gap analysis: "Your formula lacks a bridge between citrus and woods"
- Auto-complete suggestions while building

**Headspace Recreation:**
- Database of real-world scent reconstructions
- "Recreate the scent of: rain, leather, garden, ocean"
- User-submitted headspace formulas

**Smart Rebalancing:**
- "If I increase this woody note by 3%, what else needs adjusting?"
- Maintain overall balance while modifying
- Preserve ratios in specific note groups

**Reference Library:**
- Famous fragrances deconstructed (where legal/educational)
- "Your formula is similar to: [fragrance names]"
- Style analysis
- Trend tracking

---

## Phase 2: Flavor Enhancement

### 2.1 Apply Accord System to Flavors

**Concept:** A flavor within a flavor

**Examples:**
- **Strawberry accord:** Multiple molecules creating unified strawberry
- **Vanilla accord:** Vanillin + ethyl vanillin + other vanillic notes
- **Coffee accord:** Blend creating coffee impression
- **Caramel accord:** Combination for caramelized sugar notes

**Same Features as Perfume:**
- Accord library
- Nested composition
- Save and reuse
- Adjust strength without changing ratios

### 2.2 Flavor-Specific Adaptations

**Taste Profile Structure:**
- Primary taste (sweet, salty, sour, bitter, umami)
- Secondary characteristics (creamy, fruity, roasted, fresh)
- Intensity scale
- Mouthfeel contribution
- Aftertaste profile

**Application-Specific Considerations:**
- Heat stability (baking, cooking)
- pH stability
- Water vs oil soluble
- Alcohol compatibility
- Typical applications (beverage, dairy, baked goods, etc.)

**Dosage in ppm:**
- Flavors often measured in parts per million
- Much lower concentrations than perfume
- Usage level calculator

---

## Phase 3: Cosmetics (Future - Major Expansion)

### 3.1 Fundamental Shift: Ingredients Have Jobs

Unlike perfume (smell) or flavor (taste), cosmetic ingredients serve functional roles:

| Role | Examples | Function |
|------|----------|----------|
| Solvent | Water, glycols | Dissolve other ingredients |
| Structure | Waxes, fatty alcohols, polymers | Provide texture, consistency |
| Emulsifier | PEGs, lecithin, glyceryl stearate | Blend oil and water |
| Preservative | Phenoxyethanol, organic acids | Prevent microbial growth |
| Active | Retinol, niacinamide, AHA | Deliver claimed benefits |
| Sensory modifier | Silicones, esters | Improve feel, spreadability |
| Fragrance | Existing strength | Scent |

**Platform Implication:**
- New data structure: ingredient roles
- Multiple roles per ingredient possible
- Role-based filtering and requirements

### 3.2 Product Types & Templates

**Major Cosmetic Categories:**

*Emulsions (most common):*
- Lotions (oil-in-water)
- Creams (water-in-oil or o/w)
- Serums (usually water-based)
- Sunscreens

*Anhydrous (no water):*
- Balms
- Oil blends
- Lipsticks
- Oil cleansers

*Gels:*
- Water-based gels
- Oil-based gels
- Hydrogels

*Surfactant-Based:*
- Shampoos
- Body washes
- Cleansers
- Makeup removers

*Powders:*
- Makeup powders
- Dry shampoos
- Body powders

**Platform Feature:**
- Select product type at project start
- Each type has different requirements and constraints
- Template formulas for each type
- Required ingredient categories per type

### 3.3 Formulation Structure: Phases

Unlike perfume (single phase blending), cosmetics have phases:

**Water Phase:**
- Water
- Water-soluble ingredients
- Humectants (glycerin, hyaluronic acid)
- Water-soluble actives

**Oil Phase:**
- Oils
- Butters
- Waxes
- Emulsifiers (lipophilic part)
- Oil-soluble actives

**Cool Down Phase:**
- Heat-sensitive ingredients added after emulsion cools
- Preservatives
- Fragrance
- Some actives (vitamin C, peptides)

**Platform Requirements:**
- Assign each ingredient to a phase
- Phase total % tracking
- Phase compatibility checks
- Order of addition guidance

### 3.4 Emulsion Science

**Critical for Most Cosmetics:**

*HLB System (Hydrophilic-Lipophilic Balance):*
- Each oil has required HLB value
- Emulsifiers must match oil phase HLB
- Platform calculates required HLB
- Suggests emulsifier combinations
- Auto-balances emulsifier blend

*Emulsion Type Selection:*
- **Oil-in-water:** Light lotions, most face products
- **Water-in-oil:** Rich creams, barrier products
- Platform determines which type based on oil/water ratio

*Stability Considerations:*
- Emulsifier % must be sufficient for oil load
- Viscosity targets
- Temperature stability
- pH impact on emulsion stability

**Platform Features:**
- HLB calculator
- Emulsifier suggestion engine
- Stability risk warnings
- Phase ratio validation

### 3.5 Manufacturing Process Constraints

**Why It Matters:**
Two identical ingredient lists can produce completely different results based on process.

**Key Process Variables:**

*Temperature:*
- Heating requirements (some ingredients need heat)
- Heat-sensitive ingredients (must add cold)
- Emulsification temperature (usually 70-75°C)
- Cool-down temperature for additives

*Mixing:*
- Shear requirements (high shear for some emulsions)
- Mixing speed and duration
- Order of addition
- Homogenization needs

*Cooling:*
- Cooling rate impacts texture
- Some ingredients need slow cooling
- Crash cooling vs. gradual

**Platform Features:**
- Process templates per product type
- Step-by-step manufacturing instructions
- Temperature and time specifications
- Equipment recommendations
- Process warnings: "Don't add vitamin C above 40°C"

### 3.6 Percentage Ranges & Constraints

Unlike perfume (relatively flexible %), cosmetics have hard limits:

**Typical Ranges:**
- **Emulsifier:** 2-8% (depends on oil load)
- **Preservative:** 0.5-1% (specific to preservative type)
- **Fragrance:** 0.1-2% max (less in leave-on products)
- **Active ingredients:** varies (retinol 0.1-1%, niacinamide 2-10%)
- **Thickeners:** 0.5-3%

**Platform Features:**
- Min/max % for each ingredient based on role
- Auto-warnings when out of range
- "This preservative needs 0.8% minimum to be effective"
- Sum validation: "Total emulsifier is only 1.5%, need at least 3% for 15% oil phase"

*Usage Levels by Product Type:*
- Leave-on products: stricter limits
- Rinse-off products: more permissive
- Eye area: strictest limits

### 3.7 pH Requirements

**Critical in Cosmetics:**

Skin pH: ~4.5-6

**pH-Dependent Factors:**
- Preservative efficacy (many work only in specific pH range)
- Active stability (vitamin C needs low pH, some peptides need higher)
- Skin compatibility
- Product stability

**Platform Features:**
- pH calculator based on ingredients
- pH range indicator
- Warnings: "Your preservative won't work at pH 7"
- pH adjustment suggestions
- Buffer system recommendations

### 3.8 Preservative Systems

**Non-Optional in Water-Containing Products:**

*Why Critical:*
- Water + nutrients = microbial paradise
- Product safety requirement
- Shelf life determination
- Legal requirement in most regions

*Complexity:*
- Broad spectrum coverage (bacteria + fungi + yeast)
- pH dependent
- Interaction with other ingredients
- Some actives deactivate preservatives
- Packaging impact (jar vs pump)

**Platform Features:**
- Preservative selection wizard
- Broad spectrum validation
- Compatibility checker
- Challenge test recommendations
- Alternative suggestions
- "Phenoxyethanol won't work with this peptide—try X instead"

### 3.9 Stability & Shelf Life Considerations

**Cosmetics Must Survive:**
- Months or years in storage
- Temperature fluctuations
- Light exposure
- Oxygen exposure
- Microbial contamination
- User contamination

**Stability Challenges:**

*Physical Stability:*
- Emulsion separation
- Color changes
- Texture changes
- Syneresis (water seeping out)

*Chemical Stability:*
- Oxidation (especially oils, vitamin C)
- Hydrolysis
- pH drift
- Active degradation

*Microbiological Stability:*
- Preservative effectiveness
- Water activity
- Contamination vectors

**Platform Features:**
- Stability risk assessment
- Antioxidant recommendations
- Packaging suggestions
- Shelf life estimation
- Stability testing guidance
- "This formula contains unstable vitamin C—recommend airless packaging"

### 3.10 Performance Claims & Actives

**Claims Drive Ingredient Requirements:**

*Example Claims:*
- **Moisturizing:** Need humectants (glycerin, HA) + occlusives
- **Anti-aging:** Need actives (retinol, peptides, antioxidants)
- **Brightening:** Need actives (vitamin C, niacinamide, alpha arbutin)
- **Mattifying:** Need oil-absorbing ingredients (silicas, clays)

**Platform Features:**
- Select desired claim(s)
- Platform suggests required actives
- Minimum effective concentrations
- Combination synergies
- Warnings: "0.1% vitamin C won't deliver brightening claim—need 5%+"
- Evidence level indicators

*Testing Implications:*
- Some claims require clinical testing
- Safety testing requirements
- Substantiation needs

### 3.11 Regulatory & Safety (To Be Added Later)

**Placeholder for Future:**
- Regional banned/restricted substances (EU, US, Asia)
- Leave-on vs rinse-off differences
- Eye area vs skin vs lips
- Maximum use levels
- Labeling requirements
- Claims substantiation

**Data Structure:**
- Regulatory status per region
- Product type restrictions
- Concentration limits
- Required warnings
- Prohibited combinations

**Skin Compatibility Data:**

Can be structured or unstructured initially:

*Structured approach:*
- Irritation potential (low/moderate/high)
- Sensitization risk (yes/no/potential)
- Comedogenicity rating (0-5 scale)
- Eye area safe (yes/no)

*Unstructured approach:*
- Text field for notes
- Links to studies
- User reports
- Can structure later as data accumulates

### 3.12 Cosmetic-Specific UX Flow

**Guided Creation Workflow:**

**Step 1: Product Type**
- What are you making? (lotion, serum, cleanser, etc.)
- Platform loads appropriate template

**Step 2: Claims/Function**
- What should it do? (moisturize, anti-age, cleanse, etc.)
- Platform suggests required actives

**Step 3: Build Formula**
- Water phase ingredients
- Oil phase ingredients
- Cool down phase ingredients
- Platform validates at each step

**Step 4: Process**
- Generated manufacturing instructions
- Temperature and timing
- Equipment needs

**Step 5: Stability & Safety**
- Preservative check
- pH check
- Stability warnings
- Packaging recommendations

*Much more structured than perfume's creative freedom*

### 3.13 What Transfers from Perfume & Flavor

**Existing Strengths:**
- Molecular database infrastructure
- Sensory modeling (fragrance in cosmetics)
- User creativity workflows
- Version control
- Cost calculation
- Collaboration tools
- Ingredient search and filtering

**Fragrance in Cosmetics:**
- Your perfume system applies directly
- But with stricter concentration limits
- And skin safety considerations
- IFRA limits even more important in cosmetics

**Key Insight:**
Cosmetics isn't a pivot—it's layering structure and safety requirements onto existing capabilities.

---

## Data Architecture Summary

### Molecule Table Structure

The molecule database will include fields for:

- **Identifiers:** molecule_id, name, cas_number, synonyms
- **Sensory data:** olfactive_profile (primary/secondary facets, intensity, diffusion), taste_profile (primary taste, characteristics, intensity)
- **Technical properties:** volatility (class, evaporation rate, substantivity, tenacity), physical_properties (solubility, color, state)
- **Cosmetic-specific:** cosmetic_role, phase_compatibility, skin_compatibility
- **Blending & formulation:** synergies, conflicts, modifier_functions
- **Regulatory:** IFRA restrictions, FEMA status, EU cosmetic restrictions (to be added later)
- **Commercial:** cost_per_kg, suppliers, natural_synthetic, certifications
- **Usage guidance:** typical usage ranges for perfume (%), flavor (ppm), and cosmetic (%)

**Note:** No "application type" column needed - molecule applicability determined by presence of relevant data fields.

### Project-Level Data

Projects will track:
- Project type (perfume/flavor/cosmetic)
- Product subtype (EdP, lotion, beverage flavor, etc.)
- Formula composition with ingredients, percentages, and phases
- Manufacturing process details (for cosmetics)
- Metadata (version, dates, status, target cost, notes)

---

## Implementation Priority

### Must-Have for Perfume Launch:
- Olfactive data structure in molecule DB
- Volatility classification (top/heart/base)
- Visual pyramid builder with % distribution
- Basic accord creation and nesting
- Olfactive family tagging and filtering
- Dosage warnings (min/max/typical ranges)
- Cost calculator
- Version control

### Nice-to-Have for Perfume Launch:
- Evaporation timeline simulation
- Sillage/projection visualization
- Synergy/conflict suggestions
- Inspiration browsers (mood, season, etc.)
- AI-powered suggestions
- Collaboration tools

### Flavor Enhancements:
- Apply accord system to flavors
- Taste profile structure
- Application-specific considerations (heat stability, etc.)
- Usage in ppm

### Cosmetics (Later Phase):
- Everything listed in Phase 3
- Most complex due to safety, regulatory, and formulation requirements
- Build on proven perfume + flavor foundation