"""
process_car_images.py
=====================
Prepares all car images for the Wheelify grid with a premium dark-studio look.

Strategy:
  - PRIORITY 1: Cars that already have a hand-curated PNG in vehicle_images/
    (Tata, Mahindra, some Maruti Suzuki) → copy those directly, DO NOT overwrite.
  - PRIORITY 2: All other cars → take the scraped JPG from models/,
    remove background with rembg, composite onto a dark gradient studio
    background matching the reference screenshots.

Output:
  All processed PNGs saved to frontend/public/assets/processed/ so the
  originals in models/ are never touched.

Usage:
    python process_car_images.py

Requirements:
    pip install rembg pillow numpy pandas onnxruntime
"""

import sys
import os
import re
import shutil
import logging
import numpy as np
import pandas as pd
from PIL import Image, ImageFilter, ImageDraw
from rembg import remove, new_session

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

# ─────────────────────────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────────────────────────

SCRAPED_DIR   = "frontend/public/assets/models"         # 350 scraped JPGs
PREMIUM_DIR   = "frontend/public/assets/vehicle_images" # existing hand-curated PNGs
OUTPUT_DIR    = "frontend/public/assets/processed"      # final output folder
CSV_PATH      = "frontend/public/Vehical Dataset updated final.csv"
LOG_FILE      = "image_processing_failed.log"

# Output canvas size (px) — matches premium reference images
CANVAS_W = 1200
CANVAS_H = 720

# ─────────────────────────────────────────────────────────────────
# LOGGING
# ─────────────────────────────────────────────────────────────────

logging.basicConfig(
    filename=LOG_FILE,
    filemode="w",
    level=logging.WARNING,
    format="%(asctime)s  %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger()


# ─────────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────────

def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "_", text)
    return text.strip("-")


def make_dark_studio_background(width: int, height: int) -> Image.Image:
    """
    Create a premium dark gradient background matching the reference screenshots:
    - Very dark charcoal/black base
    - Subtle radial glow in the center-bottom (floor reflection area)
    - Slight vignette around edges
    """
    bg = Image.new("RGB", (width, height), (10, 10, 12))
    arr = np.array(bg, dtype=np.float32)

    # Radial glow: subtle warm light source from center-bottom
    cx, cy = width * 0.5, height * 0.72
    for y in range(height):
        for x in range(width):
            dist = ((x - cx) ** 2 / (width * 0.55) ** 2 +
                    (y - cy) ** 2 / (height * 0.45) ** 2) ** 0.5
            strength = max(0.0, 1.0 - dist) ** 1.8 * 30
            arr[y, x, 0] = min(255, arr[y, x, 0] + strength * 1.1)
            arr[y, x, 1] = min(255, arr[y, x, 1] + strength * 0.9)
            arr[y, x, 2] = min(255, arr[y, x, 2] + strength * 0.7)

    bg = Image.fromarray(arr.astype(np.uint8), "RGB")
    return bg


def make_dark_studio_background_fast(width: int, height: int) -> Image.Image:
    """
    Vectorised version (numpy) — much faster than the pixel loop above.
    Same visual result.
    """
    base = np.full((height, width, 3), [10, 10, 12], dtype=np.float32)

    # Meshgrid of normalised coordinates
    xs = np.linspace(0, 1, width)
    ys = np.linspace(0, 1, height)
    xx, yy = np.meshgrid(xs, ys)

    # Radial distance from the glow centre (cx=0.5, cy=0.72)
    dist = np.sqrt(((xx - 0.5) / 0.55) ** 2 + ((yy - 0.72) / 0.45) ** 2)
    glow = np.clip(1.0 - dist, 0, 1) ** 1.8 * 30   # strength scalar per pixel

    base[:, :, 0] = np.clip(base[:, :, 0] + glow * 1.1, 0, 255)
    base[:, :, 1] = np.clip(base[:, :, 1] + glow * 0.9, 0, 255)
    base[:, :, 2] = np.clip(base[:, :, 2] + glow * 0.7, 0, 255)

    return Image.fromarray(base.astype(np.uint8), "RGB")


def add_floor_reflection(canvas: Image.Image, car_rgba: Image.Image,
                         car_x: int, car_y: int, car_w: int, car_h: int) -> Image.Image:
    """
    Add a subtle floor reflection below the car for the floating premium look.
    """
    reflection = car_rgba.copy().transpose(Image.FLIP_TOP_BOTTOM)

    # Fade the reflection from top (opaque near floor) to bottom (invisible)
    r_arr = np.array(reflection).astype(np.float32)
    fade = np.linspace(0.18, 0.0, r_arr.shape[0])  # max 18% opacity at top
    r_arr[:, :, 3] *= fade[:, None]
    reflection = Image.fromarray(r_arr.astype(np.uint8), "RGBA")

    # Scale reflection down slightly so it looks natural
    ref_w = int(car_w * 0.92)
    ref_h = int(car_h * 0.28)
    reflection = reflection.resize((ref_w, ref_h), Image.LANCZOS)

    ref_x = car_x + (car_w - ref_w) // 2
    ref_y = car_y + car_h - 4   # just below the car
    canvas.paste(reflection, (ref_x, ref_y), reflection)
    return canvas


def composite_car_on_studio(car_rgba: Image.Image) -> Image.Image:
    """
    Composite a cut-out car (RGBA) onto the premium dark studio background.
    Returns a final RGB image ready to save.
    """
    bg = make_dark_studio_background_fast(CANVAS_W, CANVAS_H)
    canvas = bg.convert("RGBA")

    # Scale car to fill ~80% of canvas width, maintaining aspect
    car_w = int(CANVAS_W * 0.82)
    car_h = int(car_w * car_rgba.height / car_rgba.width)

    # If too tall, fit to height instead
    if car_h > int(CANVAS_H * 0.78):
        car_h = int(CANVAS_H * 0.78)
        car_w = int(car_h * car_rgba.width / car_rgba.height)

    car_rgba = car_rgba.resize((car_w, car_h), Image.LANCZOS)

    # Position: horizontally centred, vertically centred-bottom
    car_x = (CANVAS_W - car_w) // 2
    car_y = int(CANVAS_H * 0.5) - car_h // 2 + int(CANVAS_H * 0.04)

    # Add floor reflection first (behind car)
    canvas = add_floor_reflection(canvas, car_rgba, car_x, car_y, car_w, car_h)

    # Paste the car
    canvas.paste(car_rgba, (car_x, car_y), car_rgba)

    return canvas.convert("RGB")


def remove_background(img: Image.Image, session) -> Image.Image:
    """Use rembg to strip the background; return RGBA image."""
    # Convert to RGB first (rembg works best with RGB input)
    img_rgb = img.convert("RGB")
    result = remove(img_rgb, session=session)
    return result   # returns RGBA


def build_premium_name_map() -> dict:
    """
    Build a lookup {slugified_key: absolute_path} for all existing
    premium images in vehicle_images/ so we can match them to scraped files.
    Key format: "brand_model"  e.g. "tata_sierra", "mahindra_thar"
    """
    name_map = {}
    for brand_dir in os.listdir(PREMIUM_DIR):
        brand_path = os.path.join(PREMIUM_DIR, brand_dir)
        if not os.path.isdir(brand_path):
            continue
        for fname in os.listdir(brand_path):
            if not fname.lower().endswith(".png"):
                continue
            # Filename examples: "Tata Sierra.png", "BE 6.png"
            stem = os.path.splitext(fname)[0]          # "Tata Sierra"

            # Normalise: strip brand prefix if duplicated (e.g. "Tata Sierra" -> "sierra")
            # Key = brand_dir + "_" + model_slug
            brand_slug = slugify(brand_dir)            # "tata", "mahindra", "maruti_suzuki"
            model_slug = slugify(stem)                 # "tata_sierra" or "be_6"

            # Remove brand prefix from model slug if present
            if model_slug.startswith(brand_slug + "_"):
                model_slug = model_slug[len(brand_slug) + 1:]

            key = f"{brand_slug}_{model_slug}"
            name_map[key] = os.path.join(brand_path, fname)

    return name_map


# ─────────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────────

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"[OK] Output folder: {os.path.abspath(OUTPUT_DIR)}")
    print(f"[OK] Log file     : {os.path.abspath(LOG_FILE)}\n")

    # Build the premium image lookup
    premium_map = build_premium_name_map()
    print(f"[OK] Found {len(premium_map)} premium vehicle_images:")
    for k in sorted(premium_map.keys()):
        print(f"       {k}")
    print()

    # Collect all scraped images
    scraped_files = sorted([
        f for f in os.listdir(SCRAPED_DIR)
        if f.lower().endswith((".jpg", ".jpeg", ".png"))
    ])
    print(f"[OK] Found {len(scraped_files)} scraped images in models/\n")
    print("=" * 70)

    # Initialise rembg session once (downloads ONNX model on first run ~100MB)
    print("Loading rembg AI model (first run downloads ~100MB, please wait)...")
    session = new_session("u2net")
    print("[OK] rembg ready.\n")
    print("=" * 70)

    success_premium = 0
    success_rembg   = 0
    skipped         = 0
    failed          = 0
    total           = len(scraped_files)

    for idx, fname in enumerate(scraped_files, 1):
        stem      = os.path.splitext(fname)[0]          # e.g. "tata_sierra"
        out_path  = os.path.join(OUTPUT_DIR, stem + ".png")

        print(f"\n[{idx}/{total}] {fname}")

        # ── SKIP if already processed ──
        if os.path.exists(out_path):
            print(f"   [SKIP] Already processed.")
            skipped += 1
            continue

        # ── CHECK: does a premium version exist? ──
        if stem in premium_map:
            premium_src = premium_map[stem]
            print(f"   [PREMIUM] Copying from vehicle_images: {os.path.basename(premium_src)}")
            try:
                # Open, resize to standard canvas, composite on dark BG
                prem_img = Image.open(premium_src).convert("RGBA")

                # If premium image already has transparency, composite on dark BG
                # If it's solid (RGB), use as-is — it's likely already studio-styled
                if prem_img.mode == "RGBA" and prem_img.split()[3].getextrema()[0] < 255:
                    final = composite_car_on_studio(prem_img)
                else:
                    # Already has dark background — just resize to standard canvas
                    final = prem_img.convert("RGB").resize(
                        (CANVAS_W, CANVAS_H), Image.LANCZOS
                    )

                final.save(out_path, "PNG", optimize=True)
                print(f"   [SAVED] {CANVAS_W}x{CANVAS_H} premium -> {stem}.png")
                success_premium += 1
            except Exception as e:
                msg = f"{fname} (premium copy failed): {e}"
                log.warning(msg)
                print(f"   [FAIL] {e}")
                failed += 1
            continue

        # ── REMBG: remove background + composite ──
        src_path = os.path.join(SCRAPED_DIR, fname)
        try:
            img = Image.open(src_path)

            # Basic quality guard — skip tiny images
            if img.width < 200 or img.height < 150:
                raise ValueError(f"Image too small: {img.width}x{img.height}")

            print(f"   Removing background ({img.width}x{img.height})...")
            car_rgba = remove_background(img, session)

            # Crop out any excess transparent padding
            bbox = car_rgba.getbbox()
            if bbox:
                car_rgba = car_rgba.crop(bbox)

            print(f"   Compositing on dark studio background...")
            final = composite_car_on_studio(car_rgba)
            final.save(out_path, "PNG", optimize=True)

            kb = os.path.getsize(out_path) // 1024
            print(f"   [SAVED] {CANVAS_W}x{CANVAS_H}px  {kb}KB -> {stem}.png")
            success_rembg += 1

        except Exception as e:
            msg = f"{fname}: {e}"
            log.warning(msg)
            print(f"   [FAIL] {e}")
            failed += 1

    # ── SUMMARY ──
    print("\n" + "=" * 70)
    print("DONE!")
    print(f"   Premium (copied)   : {success_premium}")
    print(f"   rembg processed    : {success_rembg}")
    print(f"   Skipped (existing) : {skipped}")
    print(f"   Failed             : {failed}")
    if failed:
        print(f"   See {LOG_FILE} for details on failures.")
    print(f"   Output: {os.path.abspath(OUTPUT_DIR)}")


if __name__ == "__main__":
    main()
