"""Quick test: process 2 cars to preview the dark studio look."""
import sys, os, numpy as np
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
from PIL import Image
from rembg import remove, new_session

SCRAPED_DIR = "frontend/public/assets/models"
OUTPUT_DIR  = "frontend/public/assets/processed"
os.makedirs(OUTPUT_DIR, exist_ok=True)
CANVAS_W, CANVAS_H = 1200, 720

def make_bg():
    base = np.full((CANVAS_H, CANVAS_W, 3), [10, 10, 12], dtype=np.float32)
    xs = np.linspace(0, 1, CANVAS_W)
    ys = np.linspace(0, 1, CANVAS_H)
    xx, yy = np.meshgrid(xs, ys)
    dist = np.sqrt(((xx - 0.5) / 0.55) ** 2 + ((yy - 0.72) / 0.45) ** 2)
    glow = np.clip(1.0 - dist, 0, 1) ** 1.8 * 30
    base[:,:,0] = np.clip(base[:,:,0] + glow * 1.1, 0, 255)
    base[:,:,1] = np.clip(base[:,:,1] + glow * 0.9, 0, 255)
    base[:,:,2] = np.clip(base[:,:,2] + glow * 0.7, 0, 255)
    return Image.fromarray(base.astype(np.uint8), "RGB")

def composite(car_rgba):
    bg = make_bg().convert("RGBA")
    car_w = int(CANVAS_W * 0.82)
    car_h = int(car_w * car_rgba.height / car_rgba.width)
    if car_h > int(CANVAS_H * 0.78):
        car_h = int(CANVAS_H * 0.78)
        car_w = int(car_h * car_rgba.width / car_rgba.height)
    car_rgba = car_rgba.resize((car_w, car_h), Image.LANCZOS)
    car_x = (CANVAS_W - car_w) // 2
    car_y = int(CANVAS_H * 0.5) - car_h // 2 + int(CANVAS_H * 0.04)
    # Reflection
    ref = car_rgba.copy().transpose(Image.FLIP_TOP_BOTTOM)
    r_arr = np.array(ref).astype(np.float32)
    fade = np.linspace(0.18, 0.0, r_arr.shape[0])
    r_arr[:,:,3] *= fade[:,None]
    ref = Image.fromarray(r_arr.astype(np.uint8), "RGBA")
    ref = ref.resize((int(car_w*0.92), int(car_h*0.28)), Image.LANCZOS)
    bg.paste(ref, (car_x + (car_w - int(car_w*0.92))//2, car_y + car_h - 4), ref)
    bg.paste(car_rgba, (car_x, car_y), car_rgba)
    return bg.convert("RGB")

test_cars = ["hyundai_creta.jpg", "mercedes_benz_c_class.jpg"]

print("Loading rembg...")
session = new_session("u2net")
print("Ready.\n")

for fname in test_cars:
    fpath = os.path.join(SCRAPED_DIR, fname)
    if not os.path.exists(fpath):
        print(f"Not found: {fname}, skipping")
        continue
    print(f"Processing {fname}...")
    img = Image.open(fpath)
    car_rgba = remove(img.convert("RGB"), session=session)
    bbox = car_rgba.getbbox()
    if bbox: car_rgba = car_rgba.crop(bbox)
    final = composite(car_rgba)
    out = os.path.join(OUTPUT_DIR, fname.replace(".jpg", "_test.png"))
    final.save(out, "PNG")
    print(f"  Saved -> {out}")

print("\nTest done! Check frontend/public/assets/processed/")
