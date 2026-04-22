import pandas as pd
df = pd.read_csv('frontend/public/scooters_dataset.csv')
missing = df[df['Images'].isnull() | (df['Images'] == '')]
models = missing[['Brand', 'Model']].drop_duplicates()
for _, row in models.iterrows():
    print(f"{row['Brand']} - {row['Model']}")
print(f'\nTotal remaining missing variants: {len(missing)}')
print(f'Total remaining missing distinct models: {len(models)}')
