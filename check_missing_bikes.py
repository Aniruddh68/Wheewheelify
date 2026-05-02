import pandas as pd
import os

csv_path = "frontend/public/bikes_india_cleaned.csv"
base_dir = "frontend/public"

df = pd.read_csv(csv_path)

missing_bikes = []

for index, row in df.iterrows():
    brand = str(row['Brand']).strip()
    model = str(row['Model']).strip()
    variant = str(row['Variant']).strip()
    image_path = str(row['Images']).strip() if 'Images' in row and pd.notna(row['Images']) else ""
    
    is_missing = False
    if not image_path:
        is_missing = True
    else:
        # Check if file exists
        full_path = os.path.join(base_dir, image_path.lstrip('/'))
        if not os.path.exists(full_path):
            is_missing = True
            
    if is_missing:
        missing_bikes.append({
            "Brand": brand,
            "Model": model,
            "Variant": variant
        })

print(f"Total bikes in CSV: {len(df)}")
print(f"Bikes missing images: {len(missing_bikes)}")
for bike in missing_bikes:
    print(f"- {bike['Brand']} {bike['Model']} ({bike['Variant']})")
