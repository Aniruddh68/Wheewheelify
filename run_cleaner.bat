@echo off
chcp 65001 >nul
echo ============================================================
echo  Wheelify Bike Dataset Cleaner
echo  Input : frontend/public/bikes_dataset.csv
echo  Output: frontend/public/bikes_india_cleaned.csv
echo  Log   : failed_models_log.txt
echo ============================================================
echo.
python bike_cleaner.py
echo.
echo Done! Press any key to exit.
pause >nul
