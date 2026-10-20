CalendarApp local runtime

Windows background start/stop from CalendarApp:
  start.bat
  stop.bat
  The start file opens the default browser after both services are ready.
  If this folder was last used on macOS, run npm ci on Windows before starting.

macOS background start/stop from CalendarApp:
  ./start.command
  ./stop.command
  The start file opens the default browser after both services are ready.
  Install the macOS runtime and app dependencies first:
    brew install node postgresql@17
    npm ci
  If needed, set PG_BIN to the directory containing pg_ctl, initdb, and psql.
  Make the .command files executable with chmod +x once after copying to macOS.
  Startup errors are written to postgresql/supervisor.log.

Foreground start/stop from CalendarApp:
  node server.mjs
  node server.mjs stop

WEB_PORT and POSTGRES_PORT are read from CalendarApp/.config at startup.
Restart the supervisor after changing a port.
Database: calendarapp
User: postgres. Windows password: admin-password.txt (current Windows user only).
macOS password: admin-password-macos.txt (created on first run).

Windows and macOS use separate PostgreSQL data directories; the databases are not synced.
Stop CalendarApp before moving or backing up its PostgreSQL folder.
The React calendar still uses browser localStorage; no events have been migrated.
Forced process termination or a power loss can leave PostgreSQL running; stop it with
postgresql/stop.ps1 on Windows or pg_ctl on macOS before the next start.
