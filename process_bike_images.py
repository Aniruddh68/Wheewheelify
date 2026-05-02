import shutil
import os
import pandas as pd

# Mapping of generated image absolute paths to their target relative paths
image_mapping = {
    r"C:\Users\asus\.gemini\antigravity\brain\ffe4d0c5-669a-4069-9a16-34afd05f2823\suzuki_vstrom_sx250_2026_1777444682286.png": "/assets/ai_generated_images/bikes/suzuki_vstrom_sx250.png",
    r"C:\Users\asus\.gemini\antigravity\brain\ffe4d0c5-669a-4069-9a16-34afd05f2823\suzuki_vstrom_800de_2026_1777444697706.png": "/assets/ai_generated_images/bikes/suzuki_vstrom_800de.png",
    r"C:\Users\asus\.gemini\antigravity\brain\ffe4d0c5-669a-4069-9a16-34afd05f2823\suzuki_vstrom_1050_2026_1777444716182.png": "/assets/ai_generated_images/bikes/suzuki_vstrom_1050.png",
    r"C:\Users\asus\.gemini\antigravity\brain\ffe4d0c5-669a-4069-9a16-34afd05f2823\jawa_standard_bs6_dual_abs_1777444733579.png": "/assets/ai_generated_images/bikes/jawa_standard.png",
    r"C:\Users\asus\.gemini\antigravity\brain\ffe4d0c5-669a-4069-9a16-34afd05f2823\yezdi_roadster_dark_chrome_1777444750143.png": "/assets/ai_generated_images/bikes/yezdi_roadster_dark_chrome.png",
    r"C:\Users\asus\.gemini\antigravity\brain\ffe4d0c5-669a-4069-9a16-34afd05f2823\yezdi_roadster_alpha_trailster_1777444771832.png": "/assets/ai_generated_images/bikes/yezdi_roadster_alpha.png",
    r"C:\Users\asus\.gemini\antigravity\brain\ffe4d0c5-669a-4069-9a16-34afd05f2823\kawasaki_z7_hybrid_2026_1777444797494.png": "/assets/ai_generated_images/bikes/kawasaki_z7_hybrid.png",
    r"C:\Users\asus\.gemini\antigravity\brain\ffe4d0c5-669a-4069-9a16-34afd05f2823\bmw_g310gs_standard_2026_1777444815148.png": "/assets/ai_generated_images/bikes/bmw_g310gs.png",
    r"C:\Users\asus\.gemini\antigravity\brain\ffe4d0c5-669a-4069-9a16-34afd05f2823\bmw_r1300gs_standard_2026_1777444831816.png": "/assets/ai_generated_images/bikes/bmw_r1300gs.png",
    r"C:\Users\asus\.gemini\antigravity\brain\ffe4d0c5-669a-4069-9a16-34afd05f2823\bmw_r1300gs_adventure_gsa_2026_1777444847867.png": "/assets/ai_generated_images/bikes/bmw_r1300gs_adventure.png",
    r"C:\Users\asus\.gemini\antigravity\brain\ffe4d0c5-669a-4069-9a16-34afd05f2823\triumph_speed_twin_900_2026_1777444867144.png": "/assets/ai_generated_images/bikes/triumph_speed_twin_900.png",
    r"C:\Users\asus\.gemini\antigravity\brain\ffe4d0c5-669a-4069-9a16-34afd05f2823\triumph_speed_twin_1200_2026_1777444884479.png": "/assets/ai_generated_images/bikes/triumph_speed_twin_1200.png",
    r"C:\Users\asus\.gemini\antigravity\brain\ffe4d0c5-669a-4069-9a16-34afd05f2823\triumph_speed_twin_1200_rs_2026_1777444901423.png": "/assets/ai_generated_images/bikes/triumph_speed_twin_1200_rs.png",
    r"C:\Users\asus\.gemini\antigravity\brain\ffe4d0c5-669a-4069-9a16-34afd05f2823\harley_softail_standard_2026_1777444919337.png": "/assets/ai_generated_images/bikes/harley_softail_standard.png",
    r"C:\Users\asus\.gemini\antigravity\brain\ffe4d0c5-669a-4069-9a16-34afd05f2823\aprilia_rs660_standard_2026_1777444935253.png": "/assets/ai_generated_images/bikes/aprilia_rs660.png",
    r"C:\Users\asus\.gemini\antigravity\brain\ffe4d0c5-669a-4069-9a16-34afd05f2823\aprilia_rs660_extrema_2026_1777444954503.png": "/assets/ai_generated_images/bikes/aprilia_rs660_extrema.png",
    r"C:\Users\asus\.gemini\antigravity\brain\ffe4d0c5-669a-4069-9a16-34afd05f2823\aprilia_rs125_2026_1777444979102.png": "/assets/ai_generated_images/bikes/aprilia_rs125.png"
}

target_dir_base = "frontend/public"

# Move images
for src, rel_path in image_mapping.items():
    dest = os.path.join(target_dir_base, rel_path.lstrip('/'))
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    if os.path.exists(src):
        shutil.copy(src, dest)
        print(f"Moved {src} to {dest}")
    else:
        print(f"Source not found: {src}")

# Update CSV
csv_path = "frontend/public/bikes_india_cleaned.csv"
df = pd.read_csv(csv_path)

# Logic to match Brand/Model/Variant to the new paths
def get_image_path(row):
    brand = str(row['Brand']).strip()
    model = str(row['Model']).strip()
    variant = str(row['Variant']).strip()
    
    if brand == "Suzuki" and model == "V-Strom":
        if "250" in variant: return "/assets/ai_generated_images/bikes/suzuki_vstrom_sx250.png"
        if "800" in variant: return "/assets/ai_generated_images/bikes/suzuki_vstrom_800de.png"
        if "1050" in variant: return "/assets/ai_generated_images/bikes/suzuki_vstrom_1050.png"
    if brand == "Jawa" and "Standard" in model:
        return "/assets/ai_generated_images/bikes/jawa_standard.png"
    if brand == "Yezdi" and "Roadster" in model:
        if "Dark" in variant: return "/assets/ai_generated_images/bikes/yezdi_roadster_dark_chrome.png"
        if "Alpha" in variant: return "/assets/ai_generated_images/bikes/yezdi_roadster_alpha.png"
    if brand == "Kawasaki" and "Z7 Hybrid" in model:
        return "/assets/ai_generated_images/bikes/kawasaki_z7_hybrid.png"
    if brand == "BMW":
        if "310 GS" in model: return "/assets/ai_generated_images/bikes/bmw_g310gs.png"
        if "1300 GS" in model:
            if "Adventure" in variant or "(GSA)" in variant: return "/assets/ai_generated_images/bikes/bmw_r1300gs_adventure.png"
            return "/assets/ai_generated_images/bikes/bmw_r1300gs.png"
    if brand == "Triumph" and "Speed Twin" in model:
        if "900" in variant: return "/assets/ai_generated_images/bikes/triumph_speed_twin_900.png"
        if "1200" in variant:
            if "RS" in variant: return "/assets/ai_generated_images/bikes/triumph_speed_twin_1200_rs.png"
            return "/assets/ai_generated_images/bikes/triumph_speed_twin_1200.png"
    if brand == "Harley" and "Softail" in model:
        return "/assets/ai_generated_images/bikes/harley_softail_standard.png"
    if brand == "Aprilia":
        if "RS 660" in model:
            if "Extrema" in variant: return "/assets/ai_generated_images/bikes/aprilia_rs660_extrema.png"
            return "/assets/ai_generated_images/bikes/aprilia_rs660.png"
        if "RS 125" in model:
            return "/assets/ai_generated_images/bikes/aprilia_rs125.png"
            
    return row['Images'] if 'Images' in row and pd.notna(row['Images']) else ""

df['Images'] = df.apply(get_image_path, axis=1)
df.to_csv(csv_path, index=False)
print("CSV updated.")
