@echo off
cd /d "%~dp0"
python app.py
if %errorlevel% neq 0 (
    echo Error occurred. Please check if Python is installed.
    pause
)
