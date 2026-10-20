#!/bin/zsh
set -e
cd -- "$(dirname -- "$0")"
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js를 찾을 수 없습니다. Node.js를 설치한 뒤 다시 실행하세요."
  exit 1
fi
node ./server.mjs stop
