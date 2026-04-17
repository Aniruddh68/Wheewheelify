"""
scrape_press_renders.py
=======================
Scrapes OFFICIAL PRESS RENDERS (black background, 3D CGI studio shots) for cars.
These are the type found on:
- Official brand press rooms (media.hyundai.com, media.vw.com, etc.)
- Autocar India (autocarindia.com)
- CarWale / CarDekho (their official render listings)
- Motor1, CarScoops (often source directly from press packs)

Searches specifically for: "{Brand} {Model} official press render black background"
Validates the image actually has a dark/black background before saving.

Usage:
    python scrape_press_renders.py

Output: frontend/public/assets/models/{brand}_{model}.jpg  (replaces scraped photos)
"""

import sys, os, re, json, time, random, requests
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from io import BytesIO
from PIL import Image
from bs4 import BeautifulSoup
from urllib.parse import quote_plus
import numpy as np

# ─────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────

OUTPUT_DIR  = "frontend/public/assets/models"
PREMIUM_DIR = "frontend/public/assets/vehicle_images"
CSV_PATH    = "frontend/public/Vehical Dataset updated final.csv"
LOG_FILE    = "render_search.log"

MIN_W, MIN_H = 600, 350   # minimum resolution

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}
IMG_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
    "Referer": "https://www.google.com/",
}

# ─────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────

def slugify(t):
    t = t.lower().strip()
    t = re.sub(r"[^\w\s-]", "", t)
    t = re.sub(r"[\s_-]+", "_", t)
    return t.strip("-")


def has_dark_background(img: Image.Image, threshold: float = 0.30) -> bool:
    """
    Returns True if >= 30% of the image border pixels are dark (black background).
    This filters out editorial photos with white/grey/outdoor backgrounds.
    """
    img_rgb = img.convert("RGB").resize((200, 120))
    arr = np.array(img_rgb)

    # Sample the border: top row, bottom row, left col, right col
    border_pixels = np.concatenate([
        arr[0, :, :],          # top row
        arr[-1, :, :],         # bottom row
        arr[:, 0, :],          # left col
        arr[:, -1, :],         # right col
    ])

    # A pixel is "dark" if all RGB channels < 60
    dark_mask = np.all(border_pixels < 60, axis=1)
    dark_ratio = dark_mask.sum() / len(border_pixels)
    return dark_ratio >= threshold


def bing_image_search(query: str, n: int = 8) -> list:
    """Scrape Bing Images for direct image URLs."""
    urls = []
    url = f"https://www.bing.com/images/search?q={quote_plus(query)}&form=HDRSC2&first=1"
    try:
        r = requests.get(url, headers=HEADERS, timeout=15)
        soup = BeautifulSoup(r.text, "html.parser")
        for a in soup.find_all("a", {"class": "iusc"}):
            try:
                d = json.loads(a.get("m", "{}"))
                u = d.get("murl", "")
                if u.startswith("http"):
                    urls.append(u)
                    if len(urls) >= n:
                        break
            except Exception:
                pass
    except Exception as e:
        print(f"      Bing error: {e}")
    return urls


def google_image_search(query: str, n: int = 8) -> list:
    """Extract image URLs from Google Image search page source."""
    urls = []
    url = f"https://www.google.com/search?q={quote_plus(query)}&tbm=isch&hl=en"
    try:
        r = requests.get(url, headers=HEADERS, timeout=15)
        found = re.findall(
            r'"(https?://[^"]+\.(?:jpg|jpeg|png|webp)(?:\?[^"]*)?)"',
            r.text, re.IGNORECASE
        )
        for u in found:
            if ("gstatic" not in u and "google.com" not in u
                    and "encrypted-tbn" not in u and len(u) < 450):
                urls.append(u)
                if len(urls) >= n:
                    break
    except Exception as e:
        print(f"      Google error: {e}")
    return urls


def try_download(url: str, brand: str, model: str) -> Image.Image | None:
    """Download and validate. Returns PIL image or None."""
    try:
        r = requests.get(url, headers=IMG_HEADERS, timeout=20)
        r.raise_for_status()
        if "text/html" in r.headers.get("Content-Type", ""):
            return None
        if len(r.content) < 10_000:
            return None
        img = Image.open(BytesIO(r.content))
        if img.width < MIN_W or img.height < MIN_H:
            print(f"      Too small: {img.width}x{img.height}")
            return None
        return img
    except Exception as e:
        print(f"      Fail: {str(e)[:70]}")
        return None


def find_press_render(brand: str, model: str) -> Image.Image | None:
    """
    Try multiple targeted search queries, prioritising dark-background renders.
    Returns the best image found, or None.
    """
    # Queries ordered from most to least specific for press renders
    queries = [
        f"{brand} {model} press render official black background",
        f'"{brand} {model}" car render black background official image',
        f"{brand} {model} studio official photograph",
        f"{brand} {model} official image",
        f"{brand} {model} front view car",
    ]

    best: Image.Image | None = None  # keep first valid img as fallback
    best_is_dark = False

    for q in queries:
        if best_is_dark:
            break

        print(f"   Query: {q[:70]}...")
        urls = bing_image_search(q, n=6) + google_image_search(q, n=4)
        urls = list(dict.fromkeys(urls))  # deduplicate

        for url in urls[:8]:
            print(f"      {url[:90]}")
            img = try_download(url, brand, model)
            if img is None:
                continue

            dark = has_dark_background(img)
            print(f"      -> {img.width}x{img.height}  dark_bg={dark}")

            if dark:
                print(f"      [DARK BG FOUND!]")
                return img   # perfect — return immediately

            if best is None:
                best = img   # store as fallback

        time.sleep(0.8)

    return best  # either dark-bg image or best fallback


# ─────────────────────────────────────────────
# HELPERS — PREMIUM SKIP MAP
# ─────────────────────────────────────────────

import pandas as pd

def build_premium_slugs() -> set:
    """Return set of slugs that already have a hand-curated premium image."""
    slugs = set()
    if not os.path.isdir(PREMIUM_DIR):
        return slugs
    for brand_dir in os.listdir(PREMIUM_DIR):
        brand_path = os.path.join(PREMIUM_DIR, brand_dir)
        if not os.path.isdir(brand_path):
            continue
        for fname in os.listdir(brand_path):
            if not fname.lower().endswith(".png"):
                continue
            stem = os.path.splitext(fname)[0]          # e.g. "Tata Sierra"
            brand_slug = slugify(brand_dir)            # "tata"
            model_slug = slugify(stem)                 # "tata_sierra"
            if model_slug.startswith(brand_slug + "_"):
                model_slug = model_slug[len(brand_slug) + 1:]
            slugs.add(f"{brand_slug}_{model_slug}")
    return slugs


def load_all_cars() -> list:
    """Load all unique (Brand, Model) pairs from the CSV."""
    df = pd.read_csv(CSV_PATH, encoding="latin-1")
    df.columns = df.columns.str.strip()
    pairs = (
        df[["Company", "Model Name"]]
        .dropna()
        .drop_duplicates()
        .values.tolist()
    )
    return [(str(b).strip(), str(m).strip()) for b, m in pairs]


# ─────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────

def main():
    import logging
    logging.basicConfig(
        filename=LOG_FILE, filemode="w", level=logging.WARNING,
        format="%(asctime)s  %(message)s", datefmt="%H:%M:%S",
    )
    log = logging.getLogger()

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    all_cars     = load_all_cars()
    premium_slugs = build_premium_slugs()
    total        = len(all_cars)

    print(f"Total cars in CSV       : {total}")
    print(f"Premium images (skip)   : {len(premium_slugs)}")
    print(f"Output dir              : {os.path.abspath(OUTPUT_DIR)}")
    print("=" * 65)

    success_dark  = 0
    success_other = 0
    skipped       = 0
    failed        = 0

    for idx, (brand, model) in enumerate(all_cars, 1):
        slug     = f"{slugify(brand)}_{slugify(model)}"
        out_jpg  = os.path.join(OUTPUT_DIR, slug + ".jpg")
        out_png  = os.path.join(OUTPUT_DIR, slug + ".png")

        print(f"\n[{idx}/{total}] {brand} {model}")

        # ── SKIP: premium hand-curated image exists ──
        if slug in premium_slugs:
            print(f"   [SKIP] Premium image exists in vehicle_images/")
            skipped += 1
            continue

        # ── SKIP: already downloaded (resume-safe) ──
        if os.path.exists(out_jpg) or os.path.exists(out_png):
            print(f"   [SKIP] Already downloaded.")
            skipped += 1
            continue

        img = find_press_render(brand, model)

        if img is None:
            msg = f"{brand} {model}: no image found"
            log.warning(msg)
            print(f"   [FAIL] No image found")
            failed += 1
            continue

        # Save
        img.convert("RGB").save(out_jpg, "JPEG", quality=95, optimize=True)
        kb   = os.path.getsize(out_jpg) // 1024
        dark = has_dark_background(img)

        if dark:
            print(f"   [OK-DARK] {img.width}x{img.height}  {kb}KB -> {slug}.jpg")
            success_dark += 1
        else:
            print(f"   [OK-STD]  {img.width}x{img.height}  {kb}KB -> {slug}.jpg")
            success_other += 1

        delay = random.uniform(2.5, 4.0)
        print(f"   Waiting {delay:.1f}s...")
        time.sleep(delay)

    print("\n" + "=" * 65)
    print("DONE!")
    print(f"   Dark background  : {success_dark}")
    print(f"   Other background : {success_other}")
    print(f"   Skipped          : {skipped}")
    print(f"   Failed           : {failed}")
    if failed:
        print(f"   See {LOG_FILE} for failures.")
    print(f"   Output: {os.path.abspath(OUTPUT_DIR)}")


if __name__ == "__main__":
    main()
