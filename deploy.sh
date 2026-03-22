#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if ! type bun >/dev/null 2>&1; then
  echo "bun が必要ですが、PATH 上に見つかりません。" >&2
  exit 1
fi

rotate_wrangler_logs() {
  local max_logs=10
  local -a logs=()

  if [ ! -d .wrangler-logs ]; then
    return
  fi

  while IFS= read -r log; do
    logs+=("$log")
  done < <(find .wrangler-logs -maxdepth 1 -type f -name 'wrangler-*.log' | sort)

  if ((${#logs[@]} <= max_logs)); then
    return
  fi

  local remove_count=$(( ${#logs[@]} - max_logs ))
  local index
  for ((index = 0; index < remove_count; index += 1)); do
    rm -f -- "${logs[index]}"
  done
}

mkdir -p .wrangler-logs
rotate_wrangler_logs

echo "Astro でサイトをビルドします。"
ASTRO_TELEMETRY_DISABLED=1 bun run build

echo "Cloudflare Workers にデプロイします。"
WRANGLER_LOG_PATH=.wrangler-logs bunx wrangler deploy
rotate_wrangler_logs
