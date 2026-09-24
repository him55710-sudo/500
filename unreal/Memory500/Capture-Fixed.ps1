param([Parameter(Mandatory=$true)][ValidatePattern('^[a-zA-Z0-9_-]+$')][string]$Prefix, [ValidateSet('All','CAM_A','CAM_B','CAM_C')][string]$SelectedCamera = 'All', [string]$EngineRoot = 'C:\Program Files\Epic Games\UE_5.8')
$ErrorActionPreference = 'Stop'
$utf8NoBom = [System.Text.UTF8Encoding]::new($false)
$env:MEMORY500_UNREAL_ROOT = $EngineRoot
$python = Join-Path $EngineRoot 'Engine\Binaries\ThirdParty\Python3\Win64\python.exe'
$cameras = Get-Content (Join-Path $PSScriptRoot 'Evidence\fixed-cameras.json') -Raw | ConvertFrom-Json
if ($SelectedCamera -ne 'All') { $cameras = $cameras | Where-Object name -eq $SelectedCamera }
foreach ($camera in $cameras) {
    $started = Get-Date
    [System.IO.File]::WriteAllText((Join-Path $PSScriptRoot 'Tools\capture-request.json'), (@{camera=$camera.name; prefix=$Prefix} | ConvertTo-Json), $utf8NoBom)
    & $python (Join-Path $PSScriptRoot 'Tools\run_unreal.py') (Join-Path $PSScriptRoot 'Tools\prepare_fixed_camera.py') (Join-Path $PSScriptRoot 'Evidence\camera-prepare.json')
    if ($LASTEXITCODE -ne 0) { throw 'Camera preparation failed' }
    Start-Sleep -Seconds 3
    & $python (Join-Path $PSScriptRoot 'Tools\run_unreal.py') (Join-Path $PSScriptRoot 'Tools\capture_fixed.py') (Join-Path $PSScriptRoot ('Evidence\capture-' + $Prefix + '-' + $camera.name + '.json'))
    if ($LASTEXITCODE -ne 0) { throw 'Unreal capture request failed' }
    $request = Get-Content (Join-Path $PSScriptRoot 'Tools\capture-viewport.json') -Raw | ConvertFrom-Json
    $request.arguments.arguments.captureTransform.location = @{x=$camera.location_cm[0];y=$camera.location_cm[1];z=$camera.location_cm[2]}
    $request.arguments.arguments.captureTransform.rotation = @{pitch=$camera.rotation[0];yaw=$camera.rotation[1];roll=$camera.rotation[2]}
    [System.IO.File]::WriteAllText((Join-Path $PSScriptRoot 'Tools\capture-active-view.json'), ($request | ConvertTo-Json -Depth 12), $utf8NoBom)
    node (Join-Path $PSScriptRoot 'Tools\mcp.mjs') tools/call (Join-Path $PSScriptRoot 'Tools\capture-active-view.json') (Join-Path $PSScriptRoot 'Evidence\capture-active-view.json')
    if ($LASTEXITCODE -ne 0) { throw 'Viewport draw failed' }
    $output = Join-Path $PSScriptRoot ('Evidence\' + $Prefix + '-' + $camera.name + '.png')
    $deadline = (Get-Date).AddSeconds(25)
    while ((!(Test-Path $output) -or (Get-Item $output).LastWriteTime -lt $started) -and (Get-Date) -lt $deadline) { Start-Sleep -Milliseconds 250 }
    if (!(Test-Path $output) -or (Get-Item $output).LastWriteTime -lt $started) { throw ('Capture not produced: ' + $output) }
    Write-Output ('Verified new fixed capture: ' + $output)
}
