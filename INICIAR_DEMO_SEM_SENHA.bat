@echo off
rem Painel do administrador SEM senha: so para ver a demo no seu computador. NUNCA use na internet. (c) Thiago Silva
cd /d "%~dp0"
set ADMIN_OPEN=1
node server.js
