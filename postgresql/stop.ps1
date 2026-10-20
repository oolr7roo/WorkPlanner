$ErrorActionPreference = 'Stop'
$base = $PSScriptRoot
$pgCtl = Join-Path $base 'runtime\bin\pg_ctl.exe'
$data = Join-Path $base 'data'

& $pgCtl -D $data status *> $null
if ($LASTEXITCODE -ne 0) {
    Write-Output 'PostgreSQL is already stopped.'
    exit 0
}

& $pgCtl -D $data -m fast -w stop
exit $LASTEXITCODE
