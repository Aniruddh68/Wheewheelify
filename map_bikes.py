import pandas as pd
import os

df = pd.read_csv("frontend/public/bikes_dataset.csv")

images_dir = "frontend/public/assets/ai_generated_images/bikes"
images = os.listdir(images_dir)

def find_image(brand, model):
    b = str(brand).lower().replace(' ', '_').replace('-', '_')
    m = str(model).lower().replace(' ', '_').replace('-', '_')
    for img in images:
        if b in img.lower() and m in img.lower():
            return f"/assets/ai_generated_images/bikes/{img}"
    return None

for idx, row in df.iterrows():
    if pd.isna(row["Images"]) or str(row["Images"]).strip() == "":
        img_path = find_image(row["Brand"], row["Model"])
        if img_path:
            df.at[idx, "Images"] = img_path
            print(f"Mapped {row['Brand']} {row['Model']} -> {img_path}")

df.to_csv("frontend/public/bikes_dataset.csv", index=False)
