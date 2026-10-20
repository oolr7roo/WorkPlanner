$ErrorActionPreference = 'Stop'
$base = $PSScriptRoot
$pgCtl = Join-Path $base 'runtime\bin\pg_ctl.exe'
$data = Join-Path $base 'data'
$log = Join-Path $base 'postgres.log'
$config = [IO.File]::ReadAllText((Join-Path $base '..\.config'))
$portMatch = [regex]::Match($config, '(?m)^POSTGRES_PORT=(\d+)\r?$')
if (-not $portMatch.Success) { throw 'POSTGRES_PORT is missing from .config' }
$port = [int]$portMatch.Groups[1].Value

& $pgCtl -D $data status *> $null
if ($LASTEXITCODE -eq 0) {
    Write-Output 'PostgreSQL is already running.'
    exit 0
}

& $pgCtl -D $data -l $log -o "-h 127.0.0.1 -p $port" -w start
exit $LASTEXITCODE
