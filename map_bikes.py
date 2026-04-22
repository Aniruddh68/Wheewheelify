import os
import pandas as pd
import json

base = r'frontend/public/assets/Bikes'
images = []
for root, dirs, files in os.walk(base):
    for f in files:
        if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
            images.append(os.path.join(root, f).replace('\\', '/'))

df = pd.read_csv('frontend/public/bikes_dataset.csv')

def find_best_image(brand, model):
    if not isinstance(brand, str) or not isinstance(model, str):
        return ''
    
    brand = brand.lower()
    model = model.lower()
    
    brand_images = [img for img in images if brand in img.lower()]
    
    if not brand_images:
        return ''

    for img in brand_images:
        filename = os.path.basename(img).lower()
        name_without_ext = os.path.splitext(filename)[0]
        if model == name_without_ext:
            return '/' + img.split('frontend/public/')[1]
            
    for img in brand_images:
        filename = os.path.basename(img).lower()
        name_without_ext = os.path.splitext(filename)[0]
        normalized_file = name_without_ext.replace(brand, '').replace('_', ' ').strip()
        if model == normalized_file:
            return '/' + img.split('frontend/public/')[1]

    for img in brand_images:
        filename = os.path.basename(img).lower()
        name_without_ext = os.path.splitext(filename)[0]
        normalized_file = name_without_ext.replace(brand, '').replace('_', ' ').strip()
        if model in normalized_file or normalized_file in model or model in name_without_ext.replace('_', ' '):
            return '/' + img.split('frontend/public/')[1]
            
    best_img = ''
    max_overlap = 0
    model_words = set(model.replace('-', ' ').split())
    for img in brand_images:
        filename = os.path.basename(img).lower()
        name_without_ext = os.path.splitext(filename)[0]
        file_words = set(name_without_ext.replace(brand, '').replace('_', ' ').replace('-', ' ').split())
        overlap = len(model_words.intersection(file_words))
        if overlap > max_overlap:
            max_overlap = overlap
            best_img = img
            
    if max_overlap > 0:
        return '/' + best_img.split('frontend/public/')[1]
        
    return ''

df['Images'] = df.apply(lambda row: find_best_image(row['Brand'], row['Model']), axis=1)

missing = df[df['Images'] == '']
if not missing.empty:
    print(f"Missing images for {len(missing)} rows.")
    for _, row in missing.iterrows():
        print(f"Missing: {row['Brand']} - {row['Model']}")
else:
    print("All images mapped successfully.")

df.to_csv('frontend/public/bikes_dataset.csv', index=False)
