$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$server = Join-Path $root 'server.mjs'
$stdout = Join-Path $root 'postgresql\supervisor.log'
$stderr = Join-Path $root 'postgresql\supervisor-error.log'

try {
    $node = (Get-Command node -CommandType Application | Select-Object -First 1).Source
    Set-Location -LiteralPath $root
    & $node $server status *> $null
    if ($LASTEXITCODE -eq 0) {
        Write-Output 'CalendarApp is already running.'
        & $node $server wait --open
        exit $LASTEXITCODE
    }

    try {
        & $node --input-type=module -e "import('vite')" *> $null
        if ($LASTEXITCODE -ne 0) { throw 'Vite could not load.' }
    } catch {
        throw 'Windows dependencies could not load. Run npm ci in this folder, then try again.'
    }

    $supervisor = Start-Process -FilePath $node -ArgumentList 'server.mjs' `
        -WorkingDirectory $root -WindowStyle Hidden -PassThru `
        -RedirectStandardOutput $stdout -RedirectStandardError $stderr
    $timer = [Diagnostics.Stopwatch]::StartNew()
    while ($timer.Elapsed.TotalSeconds -lt 65) {
        $supervisor.Refresh()
        if ($supervisor.HasExited) {
            throw 'CalendarApp supervisor exited before it became ready.'
        }
        & $node $server status *> $null
        if ($LASTEXITCODE -eq 0) {
            & $node $server wait --open
            exit $LASTEXITCODE
        }
        Start-Sleep -Milliseconds 500
    }
    throw 'CalendarApp did not become ready within 65 seconds.'
} catch {
    [Console]::Error.WriteLine($_.Exception.Message)
    [Console]::Error.WriteLine("Logs: $stderr ; $stdout ; $(Join-Path $root 'postgresql\postgres.log')")
    if ($supervisor -and (Test-Path -LiteralPath $stderr)) {
        Get-Content -LiteralPath $stderr -Tail 20 | ForEach-Object { [Console]::Error.WriteLine($_) }
    }
    exit 1
}
