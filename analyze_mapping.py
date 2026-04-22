import pandas as pd
import os
import re
from difflib import SequenceMatcher

def clean_filename(name):
    name = os.path.splitext(name)[0]
    name = re.sub(r'_\d{10,}', '', name) # remove timestamps like _1776605133524
    name = name.replace('_', ' ')
    return name.lower().strip()

def similar(a, b):
    return SequenceMatcher(None, a, b).ratio()

df = pd.read_csv('frontend/public/final_vehicle_dataset.csv')
img_dir = 'frontend/public/assets/vehicle_images'

all_images = []
for root, dirs, files in os.walk(img_dir):
    for f in files:
        if f.endswith('.png') or f.endswith('.jpg') or f.endswith('.jpeg'):
            all_images.append(os.path.join(root, f))
        if f.endswith('.crdownload'):
            print(f"Incomplete download found: {os.path.join(root, f)}")

print(f"Found {len(all_images)} images.")

df['Company_clean'] = df['Company'].astype(str).str.lower().str.strip()
df['Model_clean'] = df['Model Name'].astype(str).str.lower().str.strip()

groups = df.groupby(['Company_clean', 'Model_clean']).first().reset_index()

unmatched_models = []
matched_info = []

for idx, row in groups.iterrows():
    company = row['Company_clean']
    model = row['Model_clean']
    
    best_match = None
    best_score = 0
    
    for img_path in all_images:
        # Check if company matches (fuzzy or directory name)
        rel_path = os.path.relpath(img_path, img_dir)
        folder = os.path.dirname(rel_path).lower()
        img_name = clean_filename(os.path.basename(img_path))
        
        # does folder match company somewhat?
        if company in folder or folder in company or similar(company, folder) > 0.6:
            score = similar(model, img_name)
            # boost score if model string is strictly in image name
            if model in img_name or img_name in model:
                score += 0.3
            if score > best_score:
                best_score = score
                best_match = img_path
                
    if best_score > 0.4:
        matched_info.append((company, model, best_match, best_score))
    else:
        unmatched_models.append((company, model))

print(f"Matched {len(matched_info)} models.")
if unmatched_models:
    print("Unmatched models:")
    for c, m in unmatched_models:
        print(f"  {c} -> {m}")

print("\nSample matches:")
for c, m, p, s in matched_info[:10]:
    print(f"[{s:.2f}] {c} {m} => {os.path.basename(p)}")

