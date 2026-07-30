@echo off
pushd "%~dp0"
curl.exe -fsS http://127.0.0.1:8080 >nul 2>&1
if not errorlevel 1 (
	start "" "http://127.0.0.1:8080/"
	popd
	exit /b 0
)

npm run dev -- --host 127.0.0.1 --port 8080 --open
popd