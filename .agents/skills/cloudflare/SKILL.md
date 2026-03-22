---
name: cloudflare
description: Project-scoped Cloudflare guidance for this Astro blog. Focuses on Workers, Static Assets, Wrangler, routes/custom domains, and GitHub Actions deployment.
---

# Cloudflare Skill

このプロジェクトで使う Cloudflare の範囲だけに絞った案内です。

## このプロジェクトで使うもの

- Workers
- Static Assets
- Wrangler
- Routes / Custom Domains
- GitHub Actions からのデプロイ

## 迷ったときの判断

### 実行環境

- HTTP を受けてページやリダイレクトを返す → Workers
- 静的な `dist/` を配信する → Static Assets

### 配備

- ローカルからデプロイする → Wrangler
- GitHub から自動デプロイする → GitHub Actions + Wrangler

### ドメイン

- `bunkei-programmer.net` を正規ホストにする
- `www.bunkei-programmer.net` は `301` で apex に寄せる

## このプロジェクトで触らないもの

次の Cloudflare サービスは、このリポジトリでは基本的に使いません。

- D1
- KV
- R2
- Queues
- Durable Objects
- Workers AI
- Vectorize
- Pages
- Stream
- Images
- Turnstile
- WAF
- Bot Management
- Tunnel
- Spectrum

## 参考にする順番

1. `wrangler.jsonc`
2. `astro.config.mjs`
3. `src/worker.ts`
4. `DEPLOYMENT.md`

## 運用メモ

- デプロイは `./deploy.sh`
- ローカル確認は `./run.sh`
- GitHub Actions の自動デプロイは `.github/workflows/deploy.yml`
