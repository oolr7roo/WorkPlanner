$ErrorActionPreference = 'Stop'
$base = $PSScriptRoot
$psql = Join-Path $base 'runtime\bin\psql.exe'
$secret = Join-Path $base 'admin-password.txt'
$previousPassword = $env:PGPASSWORD
$config = [IO.File]::ReadAllText((Join-Path $base '..\.config'))
$portMatch = [regex]::Match($config, '(?m)^POSTGRES_PORT=(\d+)\r?$')
if (-not $portMatch.Success) { throw 'POSTGRES_PORT is missing from .config' }
$port = $portMatch.Groups[1].Value

try {
    $env:PGPASSWORD = [IO.File]::ReadAllText($secret).Trim()
    & $psql -h 127.0.0.1 -p $port -U postgres -d calendarapp @args
    $result = $LASTEXITCODE
} finally {
    if ($null -eq $previousPassword) {
        Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
    } else {
        $env:PGPASSWORD = $previousPassword
    }
}

exit $result
