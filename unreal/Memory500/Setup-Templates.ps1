param([string]$EngineRoot = 'C:\Program Files\Epic Games\UE_5.8')
$ErrorActionPreference = 'Stop'
$copies = @(
    @{ Source='Templates\TP_FirstPersonBP\Content\FirstPerson'; Target='Content\FirstPerson' },
    @{ Source='Templates\TemplateResources\High\Characters\Content'; Target='Content\Characters' },
    @{ Source='Templates\TemplateResources\High\Input\Content'; Target='Content\Input' }
)
foreach ($entry in $copies) {
    $source = Join-Path $EngineRoot $entry.Source
    $target = Join-Path $PSScriptRoot $entry.Target
    if (!(Test-Path -LiteralPath $source)) { throw "Install Unreal 5.8 Templates and Feature Packs first. Missing: $source" }
    New-Item -ItemType Directory -Path $target -Force | Out-Null
    foreach ($file in Get-ChildItem -LiteralPath $source -File -Recurse) {
        if ($file.Extension -notin @('.uasset','.umap')) { continue }
        if ($entry.Target -eq 'Content\FirstPerson' -and $file.Extension -eq '.umap') { continue }
        $relative = $file.FullName.Substring($source.Length).TrimStart('\')
        $destination = Join-Path $target $relative
        if (Test-Path -LiteralPath $destination) { continue }
        New-Item -ItemType Directory -Path (Split-Path $destination -Parent) -Force | Out-Null
        Copy-Item -LiteralPath $file.FullName -Destination $destination
    }
}
Write-Output 'Local Unreal template dependencies are ready. Existing files were preserved.'
