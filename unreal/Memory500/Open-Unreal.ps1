param([string]$EngineRoot = 'C:\Program Files\Epic Games\UE_5.8')
$ErrorActionPreference = 'Stop'
$editor = Join-Path $EngineRoot 'Engine\Binaries\Win64\UnrealEditor.exe'
$project = Join-Path $PSScriptRoot 'Memory500.uproject'
if (!(Test-Path -LiteralPath $editor)) { throw "Unreal Editor not found: $editor" }
& (Join-Path $PSScriptRoot 'Setup-Templates.ps1') -EngineRoot $EngineRoot
$existing = @(Get-CimInstance Win32_Process -Filter "Name='UnrealEditor.exe'" | Where-Object { $_.CommandLine -and $_.CommandLine.Contains($project) -and $_.CommandLine -notmatch '(?i)(?:^|\s)-game(?:\s|$)' })
if ($existing.Count -gt 1) { throw 'More than one editor has this exact project open. Close the duplicate before automation.' }
if ($existing.Count -eq 1) {
    $editorPid = $existing[0].ProcessId
} else {
    $launched = Start-Process -FilePath $editor -ArgumentList ('"' + $project + '" -NoSplash') -WindowStyle Normal -PassThru
    $editorPid = $launched.Id
}
New-Item -ItemType Directory -Path (Join-Path $PSScriptRoot 'Evidence') -Force | Out-Null
@{pid=$editorPid} | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $PSScriptRoot 'Tools\editor-session.json') -Encoding utf8
$env:MEMORY500_UNREAL_ROOT = $EngineRoot
$python = Join-Path $EngineRoot 'Engine\Binaries\ThirdParty\Python3\Win64\python.exe'
$configured = $false
for ($attempt=0; $attempt -lt 4; $attempt++) {
    & $python (Join-Path $PSScriptRoot 'Tools\run_unreal.py') (Join-Path $PSScriptRoot 'Tools\configure_walkthrough.py') (Join-Path $PSScriptRoot 'Evidence\walkthrough-setup.json')
    if ($LASTEXITCODE -eq 0) { $configured=$true; break }
    Start-Sleep -Seconds 3
}
if (!$configured) { Write-Warning 'The editor is still initializing. Run Open-Unreal.ps1 again after shader compilation finishes.' }
Write-Output "Unreal editor PID $editorPid. Press Play, then click the viewport. WASD moves; mouse looks; Esc stops."
