import pandas as pd
import os
import re

CSV_PATH = "frontend/public/Vehical Dataset updated final.csv"
MODELS_DIR = "frontend/public/assets/models"

def slugify(t):
    t = str(t).lower().strip()
    t = re.sub(r"[^\w\s-]", "", t)
    t = re.sub(r"[\s_-]+", "_", t)
    return t.strip("-")

df = pd.read_csv(CSV_PATH, encoding="latin-1")
df.columns = df.columns.str.strip()
unique_cars = df[["Company", "Model Name"]].dropna().drop_duplicates().values.tolist()

existing_files = [os.path.splitext(f)[0] for f in os.listdir(MODELS_DIR)]

missing = []
for brand, model in unique_cars:
    slug = f"{slugify(brand)}_{slugify(model)}"
    if slug not in existing_files:
        missing.append(f"{brand} {model}")

print(f"Missing ({len(missing)}):")
for item in missing:
    print(f"- {item}")
