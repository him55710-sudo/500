@echo off
chcp 65001 >nul
cd /d "%~dp0"
set "GAME_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if exist "%GAME_NODE%" (
  "%GAME_NODE%" serve.mjs
) else (
  node serve.mjs
)
if errorlevel 1 pause
