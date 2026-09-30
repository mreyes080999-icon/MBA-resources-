#!/usr/bin/env sh
# Valida avances: corre las pruebas y levanta la web en modo demo (sin llaves ni red).
# Requiere Node >= 18. Uso: ./validar.sh   (PORT=4000 ./validar.sh para otro puerto)
cd "$(dirname "$0")" || exit 1
command -v node >/dev/null || { echo "Instala Node 18 o superior: https://nodejs.org"; exit 1; }
echo "== Pruebas =="; node test.mjs || { echo "Las pruebas fallaron"; exit 1; }
echo "== Web demo: abre http://localhost:${PORT:-3000} y sube cualquier foto (Ctrl+C para salir) =="
env -u ANTHROPIC_API_KEY -u LIVE_STORES -u APP_PASSWORD node server.mjs
