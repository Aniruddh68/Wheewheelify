import requests
import os
from io import BytesIO
from PIL import Image

def download_image(url, filename):
    headers = {"User-Agent": "Mozilla/5.0"}
    try:
        r = requests.get(url, headers=headers, timeout=10)
        img = Image.open(BytesIO(r.content))
        img.convert("RGB").save(filename, "JPEG", quality=95)
        print(f"Saved {filename}")
    except Exception as e:
        print(f"Failed to save {filename}: {e}")

# Manual URLs for the missing ones
# Renault Arkana
download_image("https://stimg.cardekho.com/images/carexteriorimages/930x620/Renault/Arkana/7325/1585806674720/front-left-side-47.jpg", "frontend/public/assets/models/renault_arkana.jpg")

# Citroen elo Concept (Using slug-safe name)
download_image("https://stimg.cardekho.com/images/carexteriorimages/930x620/Citroen/e-lo-Concept/12711/1753768165243/front-left-side-47.jpg", "frontend/public/assets/models/citroen_elo_concept.jpg")
