"""
generate_free_images.py
=======================
Downloads REAL, ACCURATE car images using multiple free strategies:

Strategy (tried in order for each car):
  1. Bing Image Search scraper (no API key, very reliable)
  2. Google Image Search scraper (fallback)
  3. CarDekho direct URL pattern (for Indian cars)

Each car tries up to 5 real image URLs and picks the first valid one.
Images must be at least 400x250px to be accepted (rejects icons/ads).

Usage:
    python generate_free_images.py

Requirements:
    pip install pandas requests pillow beautifulsoup4
"""

import sys
import os
import re
import time
import random
import requests
import pandas as pd
from io import BytesIO
from PIL import Image
from bs4 import BeautifulSoup
from urllib.parse import quote_plus

# Force UTF-8 output on Windows terminals
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

# ─────────────────────────────────────────────
# CONFIGURATION
# ─────────────────────────────────────────────

CSV_PATH   = "frontend/public/Vehical Dataset updated final.csv"
OUTPUT_DIR = "frontend/public/assets/models"
STOP_BRAND = "Mercedes-Benz"  # Last brand in CSV — process ALL brands

MAX_ATTEMPTS = 5   # Max image URLs to try per car
DELAY_SEC    = 3   # Seconds between cars
MIN_WIDTH    = 400
MIN_HEIGHT   = 250

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
}

IMG_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
    "Referer": "https://www.google.com/",
}

SESSION = requests.Session()
SESSION.headers.update(HEADERS)

# ─────────────────────────────────────────────
# IMAGE SEARCH BACKENDS
# ─────────────────────────────────────────────

def search_bing_images(query: str, max_results: int = 5) -> list:
    """
    Scrape Bing Image Search for image URLs. No API key needed.
    Returns a list of direct image URLs.
    """
    urls = []
    search_url = f"https://www.bing.com/images/search?q={quote_plus(query)}&form=HDRSC2&first=1"
    try:
        resp = SESSION.get(search_url, timeout=15)
        soup = BeautifulSoup(resp.text, "html.parser")

        # Bing stores image URLs in 'murl' attribute of <a> tags
        for a in soup.find_all("a", {"class": "iusc"}):
            import json
            m = a.get("m", "")
            try:
                data = json.loads(m)
                img_url = data.get("murl", "")
                if img_url and img_url.startswith("http"):
                    urls.append(img_url)
                    if len(urls) >= max_results:
                        break
            except Exception:
                continue

        # Also try 'src2' attribute on img tags as fallback
        if not urls:
            for img in soup.find_all("img", {"src2": True}):
                src = img.get("src2", "")
                if src.startswith("http"):
                    urls.append(src)
                    if len(urls) >= max_results:
                        break
    except Exception as e:
        print(f"   [WARN] Bing search failed: {e}")

    return urls


def search_google_images(query: str, max_results: int = 5) -> list:
    """
    Scrape Google Images for direct image URLs. No API key needed.
    """
    urls = []
    search_url = f"https://www.google.com/search?q={quote_plus(query)}&tbm=isch&hl=en"
    try:
        resp = SESSION.get(search_url, timeout=15)

        # Google embeds image URLs as JSON strings in the page source
        # Pattern: "https://..." followed by image file extensions
        pattern = re.compile(
            r'"(https?://[^"]+\.(?:jpg|jpeg|png|webp)(?:\?[^"]*)?)"',
            re.IGNORECASE,
        )
        found = pattern.findall(resp.text)

        # Filter out Google's own thumbnail CDN URLs and tracking URLs
        for url in found:
            if (
                "gstatic" not in url
                and "google.com" not in url
                and "encrypted-tbn" not in url
                and len(url) < 500  # avoid suspiciously long encoded URLs
            ):
                urls.append(url)
                if len(urls) >= max_results:
                    break
    except Exception as e:
        print(f"   [WARN] Google search failed: {e}")

    return urls


def get_candidate_urls(brand: str, model: str) -> list:
    """
    Build a list of candidate image URLs from multiple sources.
    Tries Bing first (most reliable), then Google as fallback.
    """
    all_urls = []

    queries = [
        f"{brand} {model} car official image",
        f"{brand} {model} exterior side view",
        f"{brand} {model} India 2024",
    ]

    print(f"   Searching Bing Images...")
    for q in queries[:2]:
        urls = search_bing_images(q, max_results=3)
        for u in urls:
            if u not in all_urls:
                all_urls.append(u)
        if len(all_urls) >= MAX_ATTEMPTS:
            break
        time.sleep(0.8)

    if len(all_urls) < MAX_ATTEMPTS:
        print(f"   Searching Google Images...")
        for q in queries[:2]:
            urls = search_google_images(q, max_results=3)
            for u in urls:
                if u not in all_urls:
                    all_urls.append(u)
            if len(all_urls) >= MAX_ATTEMPTS:
                break
            time.sleep(0.8)

    return all_urls[:MAX_ATTEMPTS]


# ─────────────────────────────────────────────
# DOWNLOAD & VALIDATE
# ─────────────────────────────────────────────

def download_and_save(url: str, save_path: str) -> bool:
    """
    Download image from URL, validate size, convert to JPEG, save.
    Returns True on success.
    """
    try:
        resp = requests.get(url, headers=IMG_HEADERS, timeout=20, stream=True)
        resp.raise_for_status()

        content_type = resp.headers.get("Content-Type", "")
        if "text/html" in content_type:
            return False  # got a webpage, not an image

        raw = resp.content
        if len(raw) < 5000:
            return False  # too small to be a real photo

        img = Image.open(BytesIO(raw))

        if img.width < MIN_WIDTH or img.height < MIN_HEIGHT:
            print(f"   [SKIP] Too small: {img.width}x{img.height}")
            return False

        img = img.convert("RGB")
        img.save(save_path, "JPEG", quality=92, optimize=True)

        file_kb = os.path.getsize(save_path) / 1024
        print(f"   [SAVED] {img.width}x{img.height}px  {file_kb:.0f} KB  -> {os.path.basename(save_path)}")
        return True

    except Exception as e:
        print(f"   [FAIL] {str(e)[:100]}")
        return False


# ─────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────

def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "_", text)
    return text.strip("-")


# ─────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"[OK] Output folder: {os.path.abspath(OUTPUT_DIR)}\n")

    # Load CSV
    try:
        df = pd.read_csv(CSV_PATH, encoding="utf-8")
    except UnicodeDecodeError:
        df = pd.read_csv(CSV_PATH, encoding="latin-1")
    df.columns = df.columns.str.strip()
    print(f"[OK] {len(df)} rows loaded.\n")

    brand_col = "Company"
    model_col = "Model Name"

    # Determine which brands to process
    all_brands = list(dict.fromkeys(df[brand_col].dropna().tolist()))
    stop_idx = all_brands.index(STOP_BRAND)
    brands_to_process = all_brands[: stop_idx + 1]
    print(f">>> Brands to process: {brands_to_process}\n")

    filtered = df[df[brand_col].isin(set(brands_to_process))].dropna(subset=[brand_col, model_col])
    unique_cars = filtered[[brand_col, model_col]].drop_duplicates().reset_index(drop=True)
    print(f"[OK] {len(unique_cars)} unique car models.\n")
    print("=" * 65)

    success_count = skip_count = fail_count = 0

    for idx, row in unique_cars.iterrows():
        brand = str(row[brand_col]).strip()
        model = str(row[model_col]).strip()
        filename  = f"{slugify(brand)}_{slugify(model)}.jpg"
        save_path = os.path.join(OUTPUT_DIR, filename)

        print(f"\n[{idx+1}/{len(unique_cars)}] {brand} {model}")

        if os.path.exists(save_path):
            print(f"   [SKIP] Already downloaded.")
            skip_count += 1
            continue

        # Get candidate URLs from Bing + Google
        candidates = get_candidate_urls(brand, model)
        if not candidates:
            print(f"   [FAIL] No URLs found from any source.")
            fail_count += 1
            continue

        print(f"   Trying {len(candidates)} candidate URLs...")
        saved = False
        for i, url in enumerate(candidates, 1):
            print(f"   [{i}] {url[:90]}")
            if download_and_save(url, save_path):
                saved = True
                success_count += 1
                break

        if not saved:
            print(f"   [FAIL] All candidates failed.")
            fail_count += 1

        # Polite delay between cars
        if idx < len(unique_cars) - 1:
            wait = DELAY_SEC + random.uniform(0.5, 2.0)
            print(f"   Waiting {wait:.1f}s...")
            time.sleep(wait)

    print("\n" + "=" * 65)
    print("DONE!")
    print(f"   Downloaded : {success_count}")
    print(f"   Skipped    : {skip_count}  (already existed)")
    print(f"   Failed     : {fail_count}")
    print(f"   Output dir : {os.path.abspath(OUTPUT_DIR)}")


if __name__ == "__main__":
    main()
