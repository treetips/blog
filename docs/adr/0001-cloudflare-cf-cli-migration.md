# ADR 0001 — CLI を wrangler から Cloudflare 新 CLI `cf` に移行する

- 日付: 2026-10-10
- 状態: Accepted
- 参照: Zenn「Cloudflare の CLI を wrangler から cf に移行する」 https://zenn.dev/sora_kumo/articles/cloudflare-to-cf 、公式ドキュメント https://developers.cloudflare.com/cf/wrangler/migrate/ 、PR #2

## 背景

Cloudflare は 2026-09-28 に統合 CLI `cf` (1.0.0-beta) を発表した。設定ファイルは TypeScript ベースの `cloudflare.config.ts` になり、Workers 以外の Cloudflare API 全域 (DNS, R2, D1 など約 3,000 コマンド) を 1 つの CLI で扱える。wrangler はオープンベータ終了後に最終メジャーを出した上で 18 ヶ月の保守期間に入る見込み。

本リポジトリは Astro 静的サイト + `src/worker.ts` のカスタム Worker で、`wrangler.jsonc` (routes 2 本, `run_worker_first: true`, `assets.directory: ./dist`) から `./deploy.sh` と GitHub Actions (`CLOUDFLARE_API_TOKEN` secrets) でデプロイしていた。

## 決定

- `cf migrate` (Wrangler バンドラ) で `cloudflare.config.ts` + `wrangler.config.ts` に移行した
- routes ×2 は `triggers.fetch()`、`run_worker_first` は `assets.runWorkerFirst` に自動変換された
- `cf build` の Astro 自動検出は Build Output (BOS) を出さず失敗するため、デプロイ経路を `astro build` → `wrangler build --x-new-config --x-cf-build-output` (BOS 生成) → `cf deploy --prebuilt --dry-run` → `cf deploy --prebuilt` に統一した
- `package.json` / `deploy.sh` は `bunx` 経由 (`cf` は Bun ランタイムをサポートしないが、bunx は node の shebang を解釈して node で実行するため問題ない。実測で確認済み)

## 結果

- `cf deploy --prebuilt --dry-run` PASS (assets 3785 ファイル、`env.ASSETS` バインディング確認)
- 本番デプロイ検証は PR #2 のマージ後 GitHub Actions で行う (ローカルには `cf auth login` が必要なため)
- wrangler はバンドラ devDependency として残る (4.147.0)
- `wrangler.jsonc` は本番デプロイ成功確認後に後続コミットで削除する

## トレードオフ

- Wrangler の実験的フラグ (`--x-new-config --x-cf-build-output`) に依存するため、ベータ期間中の仕様変更リスクがある
- 手書き `Env { ASSETS: Fetcher }` を維持 (生成型 import は tsconfig なしで検証不能のため)。バインディング追加時は型の手動同期が必要
