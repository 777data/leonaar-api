@echo off
echo 🚀 Démarrage de l'application NestJS...
start "NestJS Server" npm run start:dev

echo ⏳ Attente du démarrage du serveur...
timeout /t 5 /nobreak > nul

echo 🌐 Démarrage du tunnel localtunnel...
lt --port 4000 --subdomain leonaar-albums

pause
