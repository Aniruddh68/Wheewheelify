# Graph Report - .  (2026-04-29)

## Corpus Check
- Large corpus: 910 files · ~17,804,170 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder, or use --no-semantic to run AST-only.

## Summary
- 269 nodes · 186 edges · 15 communities detected
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Bike Cleaner Py|Bike Cleaner Py]]
- [[_COMMUNITY_Scrape Press Renders Py|Scrape Press Renders Py]]
- [[_COMMUNITY_Process Car Images Py|Process Car Images Py]]
- [[_COMMUNITY_Generate Free Images Py|Generate Free Images Py]]
- [[_COMMUNITY_Frontend Src Utils Parsevehicles Ts|Frontend Src Utils Parsevehicles Ts]]
- [[_COMMUNITY_Frontend Src Components Ui Toaster Tsx|Frontend Src Components Ui Toaster Tsx]]
- [[_COMMUNITY_Frontend Src Utils Formatcurrency Js|Frontend Src Utils Formatcurrency Js]]
- [[_COMMUNITY_Test Process Py|Test Process Py]]
- [[_COMMUNITY_Reset And Refetch Py|Reset And Refetch Py]]
- [[_COMMUNITY_Analytics Models Breakeven Model Py|Analytics Models Breakeven Model Py]]
- [[_COMMUNITY_Analytics Models Fuel Cost Model Py|Analytics Models Fuel Cost Model Py]]
- [[_COMMUNITY_Analytics Models Maintenance Model Py|Analytics Models Maintenance Model Py]]
- [[_COMMUNITY_Analytics Models Tco Model Py|Analytics Models Tco Model Py]]
- [[_COMMUNITY_Analytics Utils Formulas Py|Analytics Utils Formulas Py]]
- [[_COMMUNITY_Analytics Utils Validators Py|Analytics Utils Validators Py]]

## God Nodes (most connected - your core abstractions)
1. `main()` - 7 edges
2. `find_press_render()` - 7 edges
3. `check_india_availability()` - 6 edges
4. `main()` - 6 edges
5. `scrape_bikewale_specs()` - 5 edges
6. `get_candidate_urls()` - 5 edges
7. `composite_car_on_studio()` - 5 edges
8. `fetch_page()` - 4 edges
9. `discover_variants()` - 4 edges
10. `main()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `Toaster()` --calls--> `useToast()`  [INFERRED]
  frontend\src\components\ui\toaster.tsx → frontend\src\hooks\use-toast.ts

## Communities

### Community 0 - "Bike Cleaner Py"
Cohesion: 0.14
Nodes (20): build_variant_row(), check_india_availability(), clean_price_string(), ddg_search(), discover_variants(), fetch_page(), is_discontinued_by_pattern(), log_failed() (+12 more)

### Community 1 - "Scrape Press Renders Py"
Cohesion: 0.18
Nodes (17): bing_image_search(), build_premium_slugs(), find_press_render(), google_image_search(), has_dark_background(), load_all_cars(), main(), scrape_press_renders.py ======================= Scrapes OFFICIAL PRESS RENDERS ( (+9 more)

### Community 2 - "Process Car Images Py"
Cohesion: 0.17
Nodes (15): add_floor_reflection(), build_premium_name_map(), composite_car_on_studio(), main(), make_dark_studio_background(), make_dark_studio_background_fast(), process_car_images.py ===================== Prepares all car images for the Whee, Vectorised version (numpy) — much faster than the pixel loop above.     Same vis (+7 more)

### Community 4 - "Generate Free Images Py"
Cohesion: 0.24
Nodes (11): download_and_save(), get_candidate_urls(), main(), generate_free_images.py ======================= Downloads REAL, ACCURATE car ima, Scrape Google Images for direct image URLs. No API key needed., Build a list of candidate image URLs from multiple sources.     Tries Bing first, Download image from URL, validate size, convert to JPEG, save.     Returns True, Scrape Bing Image Search for image URLs. No API key needed.     Returns a list o (+3 more)

### Community 5 - "Frontend Src Utils Parsevehicles Ts"
Cohesion: 0.24
Nodes (4): fetchVehicles(), normalizePriceRaw(), parseCSV(), toNum()

### Community 6 - "Frontend Src Components Ui Toaster Tsx"
Cohesion: 0.33
Nodes (7): addToRemoveQueue(), dispatch(), genId(), reducer(), toast(), useToast(), Toaster()

### Community 8 - "Frontend Src Utils Formatcurrency Js"
Cohesion: 0.6
Nodes (5): _convertLakh(), formatIndianPrice(), formatLakhPrice(), formatPriceRange(), _formatSingle()

### Community 9 - "Test Process Py"
Cohesion: 0.67
Nodes (3): composite(), make_bg(), Quick test: process 2 cars to preview the dark studio look.

### Community 20 - "Reset And Refetch Py"
Cohesion: 1.0
Nodes (1): reset_and_refetch.py ==================== Deletes all the old scraped images in

### Community 22 - "Analytics Models Breakeven Model Py"
Cohesion: 1.0
Nodes (1): # TODO: Implement models/breakeven_model.py

### Community 23 - "Analytics Models Fuel Cost Model Py"
Cohesion: 1.0
Nodes (1): # TODO: Implement models/fuel_cost_model.py

### Community 24 - "Analytics Models Maintenance Model Py"
Cohesion: 1.0
Nodes (1): # TODO: Implement models/maintenance_model.py

### Community 25 - "Analytics Models Tco Model Py"
Cohesion: 1.0
Nodes (1): # TODO: Implement models/tco_model.py

### Community 26 - "Analytics Utils Formulas Py"
Cohesion: 1.0
Nodes (1): # TODO: Implement utils/formulas.py

### Community 27 - "Analytics Utils Validators Py"
Cohesion: 1.0
Nodes (1): # TODO: Implement utils/validators.py

## Knowledge Gaps
- **37 isolated node(s):** `bike_cleaner.py ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ Cl`, `Returns list of {title, href, body} from DuckDuckGo.`, `Fetch a URL and return BeautifulSoup object, or None on failure.`, `Quick check against hard-coded known discontinued patterns.`, `Returns:         {           "available": bool,           "reason": str,` (+32 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Reset And Refetch Py`** (2 nodes): `reset_and_refetch.py`, `reset_and_refetch.py ==================== Deletes all the old scraped images in`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Analytics Models Breakeven Model Py`** (2 nodes): `breakeven_model.py`, `# TODO: Implement models/breakeven_model.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Analytics Models Fuel Cost Model Py`** (2 nodes): `fuel_cost_model.py`, `# TODO: Implement models/fuel_cost_model.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Analytics Models Maintenance Model Py`** (2 nodes): `maintenance_model.py`, `# TODO: Implement models/maintenance_model.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Analytics Models Tco Model Py`** (2 nodes): `tco_model.py`, `# TODO: Implement models/tco_model.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Analytics Utils Formulas Py`** (2 nodes): `formulas.py`, `# TODO: Implement utils/formulas.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Analytics Utils Validators Py`** (2 nodes): `validators.py`, `# TODO: Implement utils/validators.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What connects `bike_cleaner.py ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ Cl`, `Returns list of {title, href, body} from DuckDuckGo.`, `Fetch a URL and return BeautifulSoup object, or None on failure.` to the rest of the system?**
  _37 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Bike Cleaner Py` be split into smaller, more focused modules?**
  _Cohesion score 0.14 - nodes in this community are weakly interconnected._
- **Should `Frontend Src App Tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.14 - nodes in this community are weakly interconnected._