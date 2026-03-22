#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if ! command -v bun >/dev/null 2>&1; then
  echo "bun が必要ですが、PATH 上に見つかりません。" >&2
  exit 1
fi

if [ ! -x node_modules/.bin/astro ]; then
  echo "astro がインストールされていません。先に 'bun install' を実行してください。" >&2
  exit 1
fi

HOST="${HOST:-127.0.0.1}"
PORT="${PORT:-4321}"

echo "Astro の開発サーバーを http://${HOST}:${PORT} で起動します。"
ASTRO_TELEMETRY_DISABLED=1 bun run dev -- --host "$HOST" --port "$PORT" "$@"
