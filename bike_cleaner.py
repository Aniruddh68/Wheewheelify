"""
bike_cleaner.py
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Cleans, verifies, and enriches bikes_dataset.csv
  - Removes brands/models NOT sold in India
  - Removes discontinued models
  - Verifies & corrects specs from BikeWale / BikeDekho
  - Adds missing variants
  - Saves incrementally (brand-by-brand) to bikes_india_cleaned.csv
  - Logs failures to failed_models_log.txt

pip install pandas requests beautifulsoup4 duckduckgo-search lxml
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

import os
import re
import time
import random
import logging
import traceback
import pandas as pd
from datetime import datetime
from bs4 import BeautifulSoup

try:
    import requests
    from requests.adapters import HTTPAdapter
    from urllib3.util.retry import Retry
except ImportError:
    raise SystemExit("Run: pip install requests")

try:
    from duckduckgo_search import DDGS
except ImportError:
    raise SystemExit("Run: pip install duckduckgo-search")

# ══════════════════════════════════════════════════════════════
#  CONFIG
# ══════════════════════════════════════════════════════════════

INPUT_CSV        = "frontend/public/bikes_dataset.csv"
OUTPUT_CSV       = "frontend/public/bikes_india_cleaned.csv"
FAILED_LOG       = "failed_models_log.txt"
SLEEP_MIN        = 3      # seconds
SLEEP_MAX        = 7      # seconds
SEARCH_MAX_HITS  = 5      # DuckDuckGo results per query
REQUEST_TIMEOUT  = 12     # seconds

# Brands confirmed to have active Indian retail presence
INDIA_ACTIVE_BRANDS = {
    "hero", "honda", "bajaj", "tvs", "yamaha", "royal enfield", "ktm",
    "suzuki", "kawasaki", "bmw", "triumph", "jawa", "yezdi", "harley",
    "aprilia", "benelli", "ducati", "zontes", "keeway", "keeway-benda",
    "qj motor", "husqvarna",
}

# Hard-coded discontinued model patterns (will also be caught by web search)
DISCONTINUED_PATTERNS = [
    "rx 100", "rx100",          # Yamaha RX 100 – discontinued decades ago
    "wr 155r",                   # Not officially sold in India
    "raider 125",                # Not in Indian lineup
    "yzf-r1", "yzf-r1m",        # Not officially in India
    "mt-07", "yzf-r7", "tenere 700", "mt-03",  # Grey imports / not official India
    "ninja h2r",                 # Track-only, not road legal for sale
    "1290 super adv s", "1390 super adv s",  # KTM – verify
    "250 sx-f", "350 sx-f", "450 sx-f",  # Motocross – not road bikes
    "fireblade",                 # Honda CBR1000RR not officially sold in India
    "cb1000r",
    "gsxr1000r", "gsx-r1000r",
    "katana",
    "hayabusa",                  # Discontinued in India currently verify
    "m 1000 rr", "m 1000 r", "m 1000 xr",  # BMW M series – not officially India
    "k 1600",
    "r 1250 rt",
    "superleggera",
    "desmo450",
    "panigale v4",               # verify
    "xdiavel",
    "hypermotard",
    "ninja zx-10rr",
    "z h2",
    "ninja h2",
    "meguro",
    "kle500",
    "w230",
]

# Trusted Indian automotive domains for verification
TRUSTED_DOMAINS = [
    "bikewale.com",
    "bikedekho.com",
    "zigwheels.com",
    "autocarindia.com",
    "bikesales.com.au",  # Lower priority
]

# ══════════════════════════════════════════════════════════════
#  LOGGING SETUP
# ══════════════════════════════════════════════════════════════

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("bike_cleaner")

failed_log = open(FAILED_LOG, "a", encoding="utf-8")
failed_log.write(f"\n{'='*60}\nRun started: {datetime.now()}\n{'='*60}\n")

def log_failed(brand, model, reason, error=""):
    msg = f"[FAILED] {brand} {model} | {reason}"
    if error:
        msg += f" | {error}"
    logger.warning(msg)
    failed_log.write(msg + "\n")
    failed_log.flush()


# ══════════════════════════════════════════════════════════════
#  HTTP SESSION (with retry + browser-like headers)
# ══════════════════════════════════════════════════════════════

def make_session() -> requests.Session:
    s = requests.Session()
    retry = Retry(total=3, backoff_factor=1, status_forcelist=[429, 500, 502, 503, 504])
    s.mount("https://", HTTPAdapter(max_retries=retry))
    s.headers.update({
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/124.0.0.0 Safari/537.36"
        ),
        "Accept-Language": "en-IN,en;q=0.9",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    })
    return s

SESSION = make_session()

def polite_sleep():
    t = random.uniform(SLEEP_MIN, SLEEP_MAX)
    time.sleep(t)


# ══════════════════════════════════════════════════════════════
#  WEB SEARCH  (DuckDuckGo  →  scrape best result)
# ══════════════════════════════════════════════════════════════

def ddg_search(query: str, max_results: int = SEARCH_MAX_HITS) -> list[dict]:
    """Returns list of {title, href, body} from DuckDuckGo."""
    try:
        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=max_results))
        return results
    except Exception as e:
        logger.debug(f"DDG search failed for '{query}': {e}")
        return []

def fetch_page(url: str) -> BeautifulSoup | None:
    """Fetch a URL and return BeautifulSoup object, or None on failure."""
    try:
        resp = SESSION.get(url, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
        return BeautifulSoup(resp.text, "lxml")
    except Exception:
        return None


# ══════════════════════════════════════════════════════════════
#  INDIA AVAILABILITY CHECK
# ══════════════════════════════════════════════════════════════

INDIA_POSITIVE_KEYWORDS = [
    "price in india", "ex-showroom", "bikewale", "bikedekho", "zigwheels",
    "available in india", "launched in india", "on-road price", "₹", "rs.",
    "buy in india", "showroom",
]
DISCONTINUED_KEYWORDS = [
    "discontinued", "no longer available", "not available in india",
    "stopped production", "not sold in india", "not officially",
    "production stopped", "grey import", "cbdu",
]


def is_discontinued_by_pattern(model_name: str) -> bool:
    """Quick check against hard-coded known discontinued patterns."""
    ml = model_name.lower().strip()
    return any(pat in ml for pat in DISCONTINUED_PATTERNS)


def check_india_availability(brand: str, model: str) -> dict:
    """
    Returns:
        {
          "available": bool,
          "reason": str,         # why removed if available=False
          "source_url": str,     # first trusted URL found
          "confidence": str,     # "high" | "low"
        }
    """
    result = {"available": True, "reason": "", "source_url": "", "confidence": "low"}

    # Step 0: Pattern check
    if is_discontinued_by_pattern(model):
        result["available"] = False
        result["reason"]    = "Matched discontinued pattern list"
        result["confidence"] = "high"
        return result

    # Step 1: DuckDuckGo search
    query = f"{brand} {model} price in India 2024 site:bikewale.com OR site:bikedekho.com OR site:zigwheels.com"
    hits  = ddg_search(query)
    polite_sleep()

    if not hits:
        # Fallback – broader search
        query = f"{brand} {model} India buy new 2024"
        hits  = ddg_search(query)
        polite_sleep()

    # Step 2: Analyse snippet text
    combined_text = " ".join(
        (h.get("title", "") + " " + h.get("body", "")).lower()
        for h in hits
    ).strip()

    # Check for trusted domain presence
    trusted_hit_urls = [
        h["href"] for h in hits
        if any(d in h.get("href", "") for d in TRUSTED_DOMAINS)
    ]

    discontinued_score = sum(1 for kw in DISCONTINUED_KEYWORDS if kw in combined_text)
    india_score        = sum(1 for kw in INDIA_POSITIVE_KEYWORDS if kw in combined_text)

    if trusted_hit_urls:
        result["source_url"]  = trusted_hit_urls[0]
        result["confidence"]  = "high"

    if discontinued_score >= 2 and india_score <= 1:
        result["available"] = False
        result["reason"]    = f"Search suggests discontinued (disc_score={discontinued_score}, india_score={india_score})"
        return result

    if india_score == 0 and not trusted_hit_urls:
        result["available"] = False
        result["reason"]    = "No India-specific listings found on trusted portals"
        result["confidence"] = "low"
        return result

    result["available"] = True
    return result


# ══════════════════════════════════════════════════════════════
#  SPEC SCRAPING FROM BIKEWALE
# ══════════════════════════════════════════════════════════════

def clean_price_string(raw: str) -> str:
    """Normalise price: strip junk, keep ₹ + digits."""
    if not raw:
        return raw
    raw = raw.replace("\u20b9", "₹").strip()
    match = re.search(r"₹[\d,]+", raw)
    return match.group(0) if match else raw


def scrape_bikewale_specs(brand: str, model: str, source_url: str) -> dict:
    """
    Attempt to pull key specs from the BikeWale page.
    Returns dict of {column_name: value} overrides, or empty dict.
    """
    overrides = {}

    # Build BikeWale-style slug if we don't have a direct URL
    if not source_url or "bikewale" not in source_url:
        slug  = f"{brand}-{model}".lower().replace(" ", "-").replace("'", "")
        source_url = f"https://www.bikewale.com/{slug}-price/"

    soup = fetch_page(source_url)
    if not soup:
        return overrides

    # Price
    price_el = soup.find(attrs={"data-testid": re.compile(r"price", re.I)})
    if not price_el:
        price_el = soup.find(class_=re.compile(r"price|Price", re.I))
    if price_el:
        overrides["Price (Ex-Showroom)"] = clean_price_string(price_el.get_text())

    # Mileage from spec tables
    spec_items = soup.find_all(["li", "tr"])
    for item in spec_items:
        text = item.get_text(" ", strip=True).lower()
        if "mileage" in text:
            val = re.search(r"[\d.]+\s*km/?l", text, re.I)
            if val:
                overrides["Mileage (km/l)"] = val.group(0).strip()
                break

    return overrides


# ══════════════════════════════════════════════════════════════
#  VARIANT DISCOVERY
# ══════════════════════════════════════════════════════════════

def discover_variants(brand: str, model: str, existing_variants: list[str], source_url: str) -> list[str]:
    """
    Attempt to find variant names on BikeWale and return only NEW ones
    not already in the CSV.
    """
    if not source_url or "bikewale" not in source_url:
        slug = f"{brand}-{model}".lower().replace(" ", "-").replace("'", "")
        source_url = f"https://www.bikewale.com/{slug}-price/"

    soup = fetch_page(source_url)
    if not soup:
        return []

    # BikeWale lists variants in elements with "variant" in class/aria or as tab text
    variant_candidates = set()
    for el in soup.find_all(class_=re.compile(r"variant|edition|version", re.I)):
        txt = el.get_text(strip=True)
        if 3 < len(txt) < 60 and not txt.lower().startswith("₹"):
            variant_candidates.add(txt)

    existing_lower = {v.lower().strip() for v in existing_variants}
    new_variants    = [v for v in variant_candidates if v.lower().strip() not in existing_lower]
    return new_variants[:5]  # cap to avoid runaway rows


# ══════════════════════════════════════════════════════════════
#  BUILD NEW VARIANT ROWS
# ══════════════════════════════════════════════════════════════

def build_variant_row(base_row: pd.Series, new_variant_name: str) -> pd.Series:
    """Clone a base row and set the variant name. Prices/specs will need manual review."""
    new_row = base_row.copy()
    new_row["Variant"] = new_variant_name
    new_row["Price (Ex-Showroom)"] = "Verify"
    new_row["Images"] = ""
    return new_row


# ══════════════════════════════════════════════════════════════
#  MAIN PROCESSING
# ══════════════════════════════════════════════════════════════

def main():
    # ── Load raw CSV ──────────────────────────────────────────
    if not os.path.exists(INPUT_CSV):
        raise FileNotFoundError(f"Cannot find input: {INPUT_CSV}")

    df = pd.read_csv(INPUT_CSV, dtype=str).fillna("")
    logger.info(f"Loaded {len(df)} rows from {INPUT_CSV}")

    # Normalise column casing for lookup
    df.columns = [c.strip() for c in df.columns]

    # ── Output file setup ─────────────────────────────────────
    output_file_exists = os.path.exists(OUTPUT_CSV)
    # Track already-processed brands so we can resume
    processed_brands: set[str] = set()
    if output_file_exists:
        existing_out = pd.read_csv(OUTPUT_CSV, dtype=str)
        processed_brands = set(existing_out["Brand"].str.strip().str.lower().unique())
        logger.info(f"Resuming – {len(processed_brands)} brand(s) already done: {processed_brands}")

    # ── Outer loop: Brand ─────────────────────────────────────
    brands = df["Brand"].str.strip().unique()

    for brand in brands:
        brand_lower = brand.lower().strip()

        # Skip already processed brands (resume support)
        if brand_lower in processed_brands:
            logger.info(f"⏭  Skipping already-processed brand: {brand}")
            continue

        # Check if brand operates in India at all
        if brand_lower not in INDIA_ACTIVE_BRANDS:
            logger.info(f"🚫 Brand NOT in India list – dropping entire brand: {brand}")
            log_failed(brand, "*ALL*", "Brand not active in India retail")
            continue

        logger.info(f"\n{'─'*60}")
        logger.info(f"🏭  Processing Brand: {brand}")
        logger.info(f"{'─'*60}")

        brand_df     = df[df["Brand"].str.strip() == brand].copy()
        kept_rows    = []
        base_models  = brand_df["Model"].str.strip().unique()

        # ── Inner loop: Base Model ────────────────────────────
        for model in base_models:
            logger.info(f"   🔍 Processing Brand: {brand} → Model: {model}")

            model_df    = brand_df[brand_df["Model"].str.strip() == model]
            variants_in_csv = model_df["Variant"].tolist()

            # ── Step 1: Availability check ────────────────────
            try:
                avail = check_india_availability(brand, model)
            except Exception as e:
                log_failed(brand, model, "Availability check crashed", str(e))
                # Keep the rows – be conservative
                kept_rows.append(model_df)
                polite_sleep()
                continue

            if not avail["available"]:
                logger.info(f"      ❌ REMOVE – {avail['reason']} (conf={avail['confidence']})")
                log_failed(brand, model, f"Removed: {avail['reason']}")
                continue

            logger.info(f"      ✅ Available in India (conf={avail['confidence']})")
            source_url = avail.get("source_url", "")

            # ── Step 2: Spec verification & enrichment ────────
            overrides = {}
            try:
                overrides = scrape_bikewale_specs(brand, model, source_url)
                polite_sleep()
            except Exception as e:
                log_failed(brand, model, "Spec scrape failed", str(e))

            if overrides:
                logger.info(f"      📝 Spec overrides found: {list(overrides.keys())}")
                for col, val in overrides.items():
                    if col in model_df.columns:
                        model_df = model_df.copy()
                        model_df[col] = val

            # ── Step 3: Variant discovery ─────────────────────
            new_variant_rows = []
            try:
                new_variants = discover_variants(brand, model, variants_in_csv, source_url)
                polite_sleep()
                if new_variants:
                    logger.info(f"      ➕ New variants found: {new_variants}")
                    base_row = model_df.iloc[0]
                    for vname in new_variants:
                        new_variant_rows.append(build_variant_row(base_row, vname))
            except Exception as e:
                log_failed(brand, model, "Variant discovery failed", str(e))

            # Accumulate all rows for this model
            kept_rows.append(model_df)
            if new_variant_rows:
                kept_rows.append(pd.DataFrame(new_variant_rows, columns=model_df.columns))

            polite_sleep()

        # ── Save brand output incrementally ───────────────────
        if kept_rows:
            brand_clean_df = pd.concat(kept_rows, ignore_index=True)
            write_header   = not output_file_exists and not processed_brands
            brand_clean_df.to_csv(
                OUTPUT_CSV,
                mode   = "a",
                index  = False,
                header = write_header or (not os.path.exists(OUTPUT_CSV)),
            )
            output_file_exists = True
            processed_brands.add(brand_lower)
            logger.info(f"   💾 Saved {len(brand_clean_df)} rows for brand: {brand}")
        else:
            logger.info(f"   ⚠  No rows kept for brand: {brand}")

    # ── Done ──────────────────────────────────────────────────
    logger.info(f"\n{'═'*60}")
    logger.info(f"✅  Cleaning complete!  Output → {OUTPUT_CSV}")
    logger.info(f"📋  Failed log        → {FAILED_LOG}")
    logger.info(f"{'═'*60}")
    failed_log.close()


# ══════════════════════════════════════════════════════════════
#  ENTRY POINT
# ══════════════════════════════════════════════════════════════

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        logger.info("\n⚠  Script interrupted by user. Progress saved so far.")
        failed_log.close()
    except Exception as e:
        logger.critical(f"FATAL: {e}")
        traceback.print_exc()
        failed_log.write(f"FATAL: {e}\n")
        failed_log.close()
