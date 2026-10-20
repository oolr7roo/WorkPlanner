#!/bin/zsh
set -e
cd -- "$(dirname -- "$0")"
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js를 찾을 수 없습니다. Node.js를 설치한 뒤 다시 실행하세요."
  exit 1
fi
if [ ! -d ./node_modules/vite ]; then
  echo "앱 의존성이 없습니다. 이 폴더에서 npm ci를 실행한 뒤 다시 시작하세요."
  exit 1
fi
if ! node --input-type=module -e "import('vite')" >/dev/null 2>&1; then
  echo "앱 의존성을 실행할 수 없습니다. 이 Mac에서 npm ci를 다시 실행하세요."
  exit 1
fi
if node ./server.mjs status >/dev/null 2>&1; then
  echo "CalendarApp is already running."
  node ./server.mjs wait --open
  exit 0
fi
nohup node ./server.mjs >> ./postgresql/supervisor.log 2>&1 < /dev/null &
node ./server.mjs wait --open
