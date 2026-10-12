@echo off
rem Instancia INDEPENDENTE da DEMO publica (porta 8900, banco proprio em data_demo). Painel sem senha SO neste computador. (c) Thiago Silva
cd /d "%~dp0"
set PA_EDITION=premium
set PA_DATA=%~dp0data_demo
set PORT=8900
set ADMIN_OPEN=1
set PA_DEMO_LINK=1
node server.js
