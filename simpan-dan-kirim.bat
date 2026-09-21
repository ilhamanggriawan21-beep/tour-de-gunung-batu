@echo off
echo ========================================================
echo   MENYIMPAN DAN MENGIRIM PERUBAHAN KE GITHUB (PUSH)
echo ========================================================
echo.
set /p msg="Tulis ringkasan perubahan (commit message): "
if "%msg%"=="" set msg=Update otomatis dari kantor

git add .
git commit -m "%msg%"
git push origin main
echo.
echo ========================================================
echo Selesai! Semua perubahan telah terkirim ke GitHub.
echo ========================================================
pause
