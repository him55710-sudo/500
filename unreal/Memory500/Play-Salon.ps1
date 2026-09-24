param([ValidateSet(85,100)][int]$ScreenPercentage = 85, [string]$EngineRoot = 'C:\Program Files\Epic Games\UE_5.8')
$ErrorActionPreference = 'Stop'
$editor = Join-Path $EngineRoot 'Engine\Binaries\Win64\UnrealEditor.exe'
$project = Join-Path $PSScriptRoot 'Memory500.uproject'
if (!(Test-Path -LiteralPath $editor)) { throw 'Unreal Engine 5.8 is required.' }
if (!(Test-Path -LiteralPath (Join-Path $PSScriptRoot 'Content\FirstPerson\Blueprints\BP_FirstPersonCharacter.uasset'))) {
    throw 'Run Open-Unreal.ps1 once to prepare the local template dependencies, then launch again.'
}
$arguments = '"' + $project + '" /Game/Maps/MemorySalon_VisualSlice -game -windowed -ForceRes -ResX=1920 -ResY=1080 -WinX=0 -WinY=0 -NoSplash -ExecCmds="r.ScreenPercentage ' + $ScreenPercentage + ',r.VSync 0,t.MaxFPS 60"'
Start-Process -FilePath $editor -ArgumentList $arguments -WindowStyle Normal
Write-Output 'WASD: move. Mouse: look. Alt+F4: close. This is the visual walkthrough; puzzles remain in the browser game.'
