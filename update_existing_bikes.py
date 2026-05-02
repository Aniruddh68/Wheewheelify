import pandas as pd

csv_path = "frontend/public/bikes_india_cleaned.csv"
df = pd.read_csv(csv_path)

def update_remaining(row):
    brand = str(row['Brand']).strip()
    model = str(row['Model']).strip()
    
    if brand == "Bajaj" and "Pulsar P150" in model:
        return "/assets/Bikes/BAJAJ/BAJAJ PULSAR P150.png"
    if brand == "Hero" and "Xtreme 200S" in model:
        return "/assets/Bikes/Hero/images_black/Hero_Xtreme_200S.jpg"
    return row['Images'] if 'Images' in row and pd.notna(row['Images']) else ""

df['Images'] = df.apply(update_remaining, axis=1)
df.to_csv(csv_path, index=False)
print("CSV updated with Bajaj and Hero images.")
