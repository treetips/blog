#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if ! type bun >/dev/null 2>&1; then
  echo "bun が必要ですが、PATH 上に見つかりません。" >&2
  exit 1
fi

echo "Astro でサイトをビルドします。"
ASTRO_TELEMETRY_DISABLED=1 bun run build

echo "Build Output (BOS) を生成します。"
bunx wrangler build --x-new-config --x-cf-build-output

echo "Build Output を検証します。"
bunx cf deploy --prebuilt --dry-run

echo "Cloudflare Workers にデプロイします。"
bunx cf deploy --prebuilt
