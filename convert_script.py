import pandas as pd
import sys

def process(file_path, output_csv, car_type):
    try:
        df = pd.read_excel(file_path)
    except Exception as e:
        print(f"Failed to read {file_path}: {e}")
        return

    print("Columns in", file_path, ":")
    columns = list(df.columns)
    for i, c in enumerate(columns):
        print(f"{i}: {c.encode('ascii', 'ignore').decode('ascii')}")
    
    # Just output it to csv inside frontend/public
    df.to_csv(output_csv, index=False)
    print(f"Saved to {output_csv}")

if __name__ == "__main__":
    process('bike data.xlsx', 'frontend/public/bikes_dataset.csv', 'bike')
    process('_scotter .xlsx', 'frontend/public/scooters_dataset.csv', 'scooter')
