import os
import pandas as pd
import glob

csv_path = r'c:\Users\asus\OneDrive\Desktop\wheelify\frontend\public\Vehical Dataset updated final.csv'
vehicle_images_dir = r'C:\Users\asus\OneDrive\Desktop\wheelify\frontend\public\assets\vehicle_images'
ai_gen_dir = r'C:\Users\asus\OneDrive\Desktop\wheelify\frontend\public\assets\ai_generated_images'

# 1. Read existing CSV
df = pd.read_csv(csv_path)
total_orig = len(df)

# Create a clean set of mapped images to avoid duplicates
mapped_files_clean = set()
for img in df['Car images'].dropna():
    clean = str(img).strip().lower().replace(' ', '_').replace('\\', '/')
    clean = clean.split('/')[-1].replace('.png', '').replace('.jpg', '')
    mapped_files_clean.add(clean)

# 2. Gather unmapped images explicitly from vehicle_images (and ai_generated_images)
unmapped_images = []

def process_dir(directory, relative_base):
    for root, _, files in os.walk(directory):
        for f in files:
            if f.endswith(('.png', '.jpg')):
                clean = f.lower().replace(' ', '_').replace('.png', '').replace('.jpg', '')
                if clean.startswith('3d_'):
                    clean = clean[3:]
                
                if clean not in mapped_files_clean:
                    # Not in CSV! Let's extract details.
                    # For Brand: use parent folder if it's the subfolder structure
                    folder_name = os.path.basename(root)
                    if folder_name and folder_name != os.path.basename(directory):
                        brand = folder_name.replace('_', ' ').title()
                    else:
                        brand = 'TBA'
                    
                    model = f.rsplit('.', 1)[0].replace('_', ' ').title()
                    
                    # Construct full image path relative to public dir
                    # e.g., /assets/vehicle_images/tata/Tata Tiago.png
                    rel_path = os.path.relpath(os.path.join(root, f), start=r'c:\Users\asus\OneDrive\Desktop\wheelify\frontend\public').replace('\\', '/')
                    image_path = f"/{rel_path}"
                    
                    unmapped_images.append({
                        'Company': brand,
                        'Model Name': model,
                        'Car images': image_path
                    })

process_dir(vehicle_images_dir, 'vehicle_images')
# Also process AI ones just to be thorough and fully complete the pipeline
if os.path.exists(ai_gen_dir):
    process_dir(ai_gen_dir, 'ai_generated_images')

print(f'Starting rows: {total_orig}')
print(f'Found {len(unmapped_images)} unmapped images to append.')

if not unmapped_images:
    print("Nothing to append.")
    exit(0)

# Create new DataFrame for appended rows
new_rows = []
for file_data in unmapped_images:
    row = {col: "TBA" for col in df.columns}
    row['Company'] = file_data['Company']
    row['Model Name'] = file_data['Model Name']
    row['Car images'] = file_data['Car images']
    # Specific safe fallbacks
    row['Price'] = 0  # Number column fallback
    row['Seating capacity'] = 5
    row['Launch year'] = 2024
    row['Airbags count'] = 0
    row['Fuel type'] = 'TBA'
    row['Transmission type'] = 'TBA'
    
    new_rows.append(row)

new_df = pd.DataFrame(new_rows)
final_df = pd.concat([df, new_df], ignore_index=True)

# Write out safely
final_df.to_csv(csv_path, index=False)
print(f'Successfully updated CSV. New total rows: {len(final_df)}')
