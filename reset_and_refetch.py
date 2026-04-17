"""
reset_and_refetch.py
====================
Deletes all the old scraped images in models/ (except the 10 press renders
we already verified), then re-runs the press render scraper for all remaining cars.
"""
import sys, os, re
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

MODELS_DIR = "frontend/public/assets/models"

# The 10 cars we already fetched as proper press renders — KEEP THESE
KEEP_SLUGS = {
    "hyundai_creta",
    "hyundai_verna",
    "kia_seltos",
    "kia_ev6",
    "honda_city",
    "toyota_fortuner",
    "volkswagen_virtus",
    "mercedes_benz_c_class",
    "renault_kiger",
    "nissan_magnite",
}

files = sorted(os.listdir(MODELS_DIR))
deleted = 0
kept    = 0

for fname in files:
    slug = os.path.splitext(fname)[0]
    path = os.path.join(MODELS_DIR, fname)
    if slug in KEEP_SLUGS:
        kept += 1
        print(f"  KEEP   : {fname}")
    else:
        os.remove(path)
        deleted += 1

print(f"\nDeleted {deleted} old scraped images.")
print(f"Kept    {kept} verified press renders.")
print(f"\nNow run:  python scrape_press_renders.py")
