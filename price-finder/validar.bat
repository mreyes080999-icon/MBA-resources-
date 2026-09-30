@echo off
rem Valida avances: corre las pruebas y levanta la web en modo demo. Requiere Node 18+.
cd /d "%~dp0"
where node >nul 2>nul || (echo Instala Node 18 o superior: https://nodejs.org & exit /b 1)
echo == Pruebas == & node test.mjs || (echo Las pruebas fallaron & exit /b 1)
set ANTHROPIC_API_KEY=& set LIVE_STORES=& set APP_PASSWORD=
echo == Web demo: abre http://localhost:3000 y sube cualquier foto (Ctrl+C para salir) ==
node server.mjs
