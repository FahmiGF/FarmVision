@echo off
title FarmVision Platform Launcher
echo =========================================================================
echo    FARMVISION - Intelligent Agriculture & Crop Optimization Platform
echo =========================================================================
echo.
echo Menjalankan backend FastAPI dan frontend FarmVision...
cd /d "%~dp0backend"
python run.py
pause
