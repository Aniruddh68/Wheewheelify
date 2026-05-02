import pandas as pd
import os

df = pd.read_csv('frontend/public/bikes_dataset.csv')

# First map any existing images in ai_generated_images/bikes
bikes_img_dir = 'frontend/public/assets/ai_generated_images/bikes'
if os.path.exists(bikes_img_dir):
    for idx, row in df.iterrows():
        if pd.isna(row['Images']) or row['Images'] == '':
            brand = str(row['Brand']).strip().lower()
            model = str(row['Model']).strip().lower().replace(' ', '_').replace('-', '_')
            expected_name = f"{brand}_{model}.png"
            # check if expected_name exists
            if os.path.exists(os.path.join(bikes_img_dir, expected_name)):
                df.at[idx, 'Images'] = f"/assets/ai_generated_images/bikes/{expected_name}"
            # also check if just model name exists
            elif os.path.exists(os.path.join(bikes_img_dir, f"{model}.png")):
                df.at[idx, 'Images'] = f"/assets/ai_generated_images/bikes/{model}.png"

df.to_csv('frontend/public/bikes_dataset.csv', index=False)

missing = df[df['Images'].isnull() | (df['Images'] == '')]
models = missing[['Brand', 'Model']].drop_duplicates()
for _, row in models.iterrows():
    print(f"{row['Brand']} - {row['Model']}")

print(f'\nTotal remaining missing variants: {len(missing)}')
print(f'Total remaining missing distinct models: {len(models)}')
